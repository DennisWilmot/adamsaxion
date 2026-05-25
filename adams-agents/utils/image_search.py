"""
Image search module using the Serper API image endpoint.

Searches for images matching script.json section queries, downloads candidates,
filters for quality, and passes them through image QA before organizing into
the contract folder structure consumed by video assembly and thumbnail agents.
"""

import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from PIL import Image

from config import SERPER_API_KEY

logger = logging.getLogger(__name__)

AI_IMAGE_DOMAINS = {
    "midjourney",
    "dall-e",
    "artstation.com",
    "deviantart.com",
    "dreamstudio",
    "lexica.art",
    "playground.ai",
    "craiyon",
    "nightcafe",
    "stable-diffusion",
    "stablediffusionweb",
    "openart.ai",
    "deepai.org",
}

WATERMARK_URL_PATTERNS = re.compile(
    r"(shutterstock|gettyimages|istockphoto|adobestock|dreamstime|123rf|"
    r"depositphotos|alamy|bigstock|canstockphoto|pond5|stockfresh)",
    re.IGNORECASE,
)

MIN_WIDTH = 800
MIN_HEIGHT = 600

SERPER_ENDPOINT = "https://google.serper.dev/images"
MAX_RETRIES = 2
CANDIDATES_PER_QUERY = 5
RESULTS_REQUESTED = 8


def _is_blocked_domain(url: str) -> bool:
    url_lower = url.lower()
    return any(domain in url_lower for domain in AI_IMAGE_DOMAINS)


def _has_watermark_indicator(url: str) -> bool:
    return bool(WATERMARK_URL_PATTERNS.search(url))


def _meets_resolution(width: int, height: int) -> bool:
    return width >= MIN_WIDTH and height >= MIN_HEIGHT


def _serper_image_search(query: str, num: int = RESULTS_REQUESTED) -> List[Dict[str, Any]]:
    """Call the Serper image search endpoint with retries."""
    if not SERPER_API_KEY:
        raise RuntimeError("SERPER_API_KEY is not configured")

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {"q": query, "num": num}

    last_err: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            resp = requests.post(SERPER_ENDPOINT, headers=headers, json=payload, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            return data.get("images", [])
        except Exception as exc:
            last_err = exc
            logger.warning("Serper search attempt %d failed: %s", attempt, exc)
            if attempt <= MAX_RETRIES:
                time.sleep(1.5 * attempt)

    logger.error("Serper search exhausted retries for query: %s", query)
    raise last_err  # type: ignore[misc]


def _filter_results(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Apply resolution, domain, and watermark filters."""
    filtered: List[Dict[str, Any]] = []
    for r in results:
        url = r.get("imageUrl", "")
        w = r.get("imageWidth", 0)
        h = r.get("imageHeight", 0)

        if not _meets_resolution(w, h):
            logger.debug("Skipping %s — resolution %dx%d below minimum", url, w, h)
            continue
        if _is_blocked_domain(url):
            logger.debug("Skipping %s — blocked AI-image domain", url)
            continue
        if _has_watermark_indicator(url):
            logger.debug("Skipping %s — watermark indicator in URL", url)
            continue

        filtered.append(r)
    return filtered


def _download_image(url: str, dest: Path, timeout: int = 20) -> bool:
    """Download a single image. Returns True on success."""
    try:
        resp = requests.get(url, timeout=timeout, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type and not url.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            logger.debug("Skipping non-image content-type for %s", url)
            return False

        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        if dest.stat().st_size < 5000:
            dest.unlink(missing_ok=True)
            logger.debug("Removed tiny download (<5KB): %s", dest)
            return False

        return True
    except Exception as exc:
        logger.warning("Download failed for %s: %s", url, exc)
        dest.unlink(missing_ok=True)
        return False


def search_and_download_section(
    section_number: int,
    image_searches: List[Dict[str, str]],
    images_dir: Path,
) -> Dict[str, Any]:
    """
    Run image search + download for one script section.

    Args:
        section_number: Zero-padded section index.
        image_searches: List of {query, purpose, fallback_query} dicts from script.json.
        images_dir: Root images directory (projects/<id>/images/).

    Returns:
        Dict with section_number, candidate paths, and any warnings.
    """
    section_dir = images_dir / f"section_{section_number:02d}"
    candidates_dir = section_dir / "candidates"
    candidates_dir.mkdir(parents=True, exist_ok=True)

    all_candidates: List[Path] = []
    warnings: List[str] = []

    for search_idx, search_spec in enumerate(image_searches):
        query = search_spec.get("query", "")
        fallback_query = search_spec.get("fallback_query", "")

        if not query:
            continue

        try:
            raw_results = _serper_image_search(query)
        except Exception:
            raw_results = []
            warnings.append(f"Serper search failed for query: {query}")

        usable = _filter_results(raw_results)

        if len(usable) < 3 and fallback_query:
            logger.info(
                "Primary query returned %d usable results, trying fallback: %s",
                len(usable),
                fallback_query,
            )
            try:
                fallback_results = _serper_image_search(fallback_query)
                usable.extend(_filter_results(fallback_results))
            except Exception:
                warnings.append(f"Fallback search also failed: {fallback_query}")

        downloaded = 0
        for rank, result in enumerate(usable):
            if downloaded >= CANDIDATES_PER_QUERY:
                break

            url = result.get("imageUrl", "")
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            elif ".webp" in url.lower():
                ext = ".webp"

            filename = f"search{search_idx + 1}_{rank + 1:03d}{ext}"
            dest = candidates_dir / filename

            if _download_image(url, dest):
                all_candidates.append(dest)
                downloaded += 1

        if downloaded == 0:
            warnings.append(f"No images downloaded for query: {query}")

    return {
        "section_number": section_number,
        "candidates_dir": str(candidates_dir),
        "candidate_paths": [str(p) for p in all_candidates],
        "warnings": warnings,
    }


def create_section_icon(approved_dir: Path, section_dir: Path) -> Optional[Path]:
    """
    Create a square-cropped icon from the first approved image.

    The icon is used for circular masks in video frames and thumbnails.

    Returns:
        Path to the icon, or None if no approved images exist.
    """
    approved_images = sorted(approved_dir.glob("img_*"))
    if not approved_images:
        return None

    icon_path = section_dir / "icon.jpg"
    try:
        with Image.open(approved_images[0]) as img:
            w, h = img.size
            side = min(w, h)
            left = (w - side) // 2
            top = (h - side) // 2
            cropped = img.crop((left, top, left + side, top + side))
            cropped = cropped.convert("RGB")
            cropped.save(icon_path, "JPEG", quality=90)
        return icon_path
    except Exception as exc:
        logger.error("Failed to create icon for %s: %s", section_dir, exc)
        return None


def create_thumbnail_icons(images_dir: Path) -> List[Path]:
    """
    Copy circular-crop icons into the thumbnail/ directory.

    Returns:
        List of created thumbnail icon paths.
    """
    thumbnail_dir = images_dir / "thumbnail"
    thumbnail_dir.mkdir(parents=True, exist_ok=True)

    created: List[Path] = []
    for section_dir in sorted(images_dir.glob("section_*")):
        icon = section_dir / "icon.jpg"
        if icon.exists():
            section_num = section_dir.name.replace("section_", "")
            dest = thumbnail_dir / f"icon_section_{section_num}.jpg"
            dest.write_bytes(icon.read_bytes())
            created.append(dest)

    return created


def fetch_images_for_project(project_dir: Path) -> Dict[str, Any]:
    """
    Top-level entry point: read script.json, search + download images for every section.

    Args:
        project_dir: Path to the project directory (projects/<id>/).

    Returns:
        Summary dict with per-section results and overall statistics.
    """
    script_path = project_dir / "script" / "script.json"
    if not script_path.exists():
        raise FileNotFoundError(f"script.json not found at {script_path}")

    with open(script_path, "r", encoding="utf-8") as f:
        script_data = json.load(f)

    sections = script_data if isinstance(script_data, list) else script_data.get("sections", [])

    images_dir = project_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    section_results: List[Dict[str, Any]] = []
    all_warnings: List[str] = []

    for section in sections:
        section_number = section.get("section_number", 0)
        image_searches = section.get("image_searches", [])

        if not image_searches:
            logger.info("Section %d has no image_searches, skipping", section_number)
            continue

        result = search_and_download_section(section_number, image_searches, images_dir)
        section_results.append(result)
        all_warnings.extend(result["warnings"])

    total_candidates = sum(len(r["candidate_paths"]) for r in section_results)

    return {
        "images_dir": str(images_dir),
        "section_results": section_results,
        "total_candidates": total_candidates,
        "warnings": all_warnings,
    }
