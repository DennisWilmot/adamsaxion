"""
Image QA module using GPT-4o vision.

Evaluates candidate images for relevance, AI-generation detection, and quality.
Approved images are moved to the approved/ folder; failures are logged.
"""

import base64
import json
import logging
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from openai import OpenAI
from PIL import Image

from config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

logger = logging.getLogger(__name__)

MAX_RETRIES = 2
PASS_TARGET_PER_SECTION = 3
BATCH_SIZE = 4

QA_PROMPT_TEMPLATE = """You are a quality control reviewer for a YouTube economics education channel.

Evaluate this image for use in a video section about: "{section_title}"
The image was found by searching: "{search_query}"

Answer these three questions with YES or NO and a confidence level (high/medium/low):

1. RELEVANCE: Does this image accurately represent the search intent?
2. AI DETECTION: Does this image appear to be AI-generated, digitally illustrated, or a generic stock graphic?
3. QUALITY: Is this image adequate resolution, free of prominent watermarks, and appropriate for an educational video?

Respond as JSON:
{{
  "relevant": {{"answer": "yes|no", "confidence": "high|medium|low", "reason": "brief explanation"}},
  "ai_generated": {{"answer": "yes|no", "confidence": "high|medium|low", "reason": "brief explanation"}},
  "quality": {{"answer": "yes|no", "reason": "brief explanation"}},
  "overall_pass": true|false
}}"""


def _encode_image_base64(image_path: Path) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def _image_media_type(path: Path) -> str:
    suffix = path.suffix.lower()
    mapping = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    return mapping.get(suffix, "image/jpeg")


def _check_dimensions(image_path: Path, min_width: int = 800, min_height: int = 600) -> bool:
    """Pre-filter: skip images below minimum resolution without burning an API call."""
    try:
        with Image.open(image_path) as img:
            w, h = img.size
            return w >= min_width and h >= min_height
    except Exception:
        return False


def _parse_qa_response(raw: str) -> Optional[Dict[str, Any]]:
    """Extract JSON from the GPT-4o response, handling markdown fences."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{[\s\S]+\}", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None


def _evaluate_single(result: Dict[str, Any]) -> bool:
    """Determine overall pass from parsed QA fields."""
    if result.get("overall_pass") is True:
        return True
    if result.get("overall_pass") is False:
        return False
    relevant = result.get("relevant", {}).get("answer", "").lower() == "yes"
    ai_gen = result.get("ai_generated", {}).get("answer", "").lower() == "yes"
    quality = result.get("quality", {}).get("answer", "").lower() == "yes"
    return relevant and (not ai_gen) and quality


def qa_batch(
    image_paths: List[Path],
    section_title: str,
    search_query: str,
) -> List[Dict[str, Any]]:
    """
    Send a batch of images to GPT-4o for QA in a single API call.

    Returns list of per-image QA result dicts augmented with "path" and "passed" keys.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    client_kwargs = {"api_key": OPENAI_API_KEY}
    if OPENAI_BASE_URL:
        client_kwargs["base_url"] = OPENAI_BASE_URL
    client = OpenAI(**client_kwargs)

    content_parts: list = []

    prompt_text = QA_PROMPT_TEMPLATE.format(
        section_title=section_title,
        search_query=search_query,
    )

    if len(image_paths) > 1:
        prompt_text += (
            f"\n\nYou are reviewing {len(image_paths)} images. "
            "Return a JSON array with one object per image, in order."
        )

    content_parts.append({"type": "text", "text": prompt_text})

    for i, img_path in enumerate(image_paths):
        b64 = _encode_image_base64(img_path)
        media_type = _image_media_type(img_path)
        content_parts.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:{media_type};base64,{b64}"},
            }
        )

    last_err: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": content_parts}],
                max_tokens=1200,
                temperature=0.1,
            )
            raw_text = response.choices[0].message.content or ""
            break
        except Exception as exc:
            last_err = exc
            logger.warning("GPT-4o QA attempt %d failed: %s", attempt, exc)
            if attempt <= MAX_RETRIES:
                import time
                time.sleep(2 * attempt)
    else:
        # All retries exhausted — assume pass (prefer false positive over blocking)
        logger.error("GPT-4o QA exhausted retries, assuming images pass")
        return [
            {"path": str(p), "passed": True, "assumed_pass": True}
            for p in image_paths
        ]

    results: List[Dict[str, Any]] = []

    if len(image_paths) == 1:
        parsed = _parse_qa_response(raw_text)
        if parsed:
            passed = _evaluate_single(parsed)
            parsed["path"] = str(image_paths[0])
            parsed["passed"] = passed
            results.append(parsed)
        else:
            logger.warning("Could not parse QA response, assuming pass: %s", raw_text[:200])
            results.append({"path": str(image_paths[0]), "passed": True, "assumed_pass": True})
    else:
        parsed = _parse_qa_response(raw_text)
        if isinstance(parsed, list):
            for i, item in enumerate(parsed):
                if i < len(image_paths):
                    passed = _evaluate_single(item)
                    item["path"] = str(image_paths[i])
                    item["passed"] = passed
                    results.append(item)
        elif isinstance(parsed, dict):
            # GPT-4o sometimes returns a single object when batched — treat as first image
            passed = _evaluate_single(parsed)
            parsed["path"] = str(image_paths[0])
            parsed["passed"] = passed
            results.append(parsed)
            for p in image_paths[1:]:
                results.append({"path": str(p), "passed": True, "assumed_pass": True})
        else:
            logger.warning("Unparseable batch QA response, assuming all pass")
            for p in image_paths:
                results.append({"path": str(p), "passed": True, "assumed_pass": True})

    return results


def run_qa_for_section(
    section_number: int,
    section_title: str,
    candidate_paths: List[str],
    image_searches: List[Dict[str, str]],
    images_dir: Path,
) -> Dict[str, Any]:
    """
    Run QA on all candidates for a single section.

    Approved images are moved to the section's approved/ folder.
    Stops early once PASS_TARGET_PER_SECTION images pass.

    Returns summary dict.
    """
    section_dir = images_dir / f"section_{section_number:02d}"
    approved_dir = section_dir / "approved"
    approved_dir.mkdir(parents=True, exist_ok=True)

    search_query = image_searches[0].get("query", "") if image_searches else ""

    approved: List[str] = []
    rejected: List[Dict[str, Any]] = []

    eligible: List[Path] = []
    for p_str in candidate_paths:
        p = Path(p_str)
        if not p.exists():
            continue
        if not _check_dimensions(p):
            rejected.append({"path": p_str, "reason": "Below minimum resolution"})
            continue
        eligible.append(p)

    # Process in batches, stop early when we have enough
    batch_start = 0
    while batch_start < len(eligible) and len(approved) < PASS_TARGET_PER_SECTION:
        batch_end = min(batch_start + BATCH_SIZE, len(eligible))
        batch = eligible[batch_start:batch_end]

        qa_results = qa_batch(batch, section_title, search_query)

        for qr in qa_results:
            img_path = Path(qr["path"])
            if qr.get("passed"):
                dest = approved_dir / f"img_{len(approved) + 1:03d}{img_path.suffix}"
                try:
                    shutil.copy2(img_path, dest)
                    approved.append(str(dest))
                except Exception as exc:
                    logger.warning("Failed to copy approved image: %s", exc)
            else:
                reason = _rejection_reason(qr)
                rejected.append({"path": qr["path"], "reason": reason})

            if len(approved) >= PASS_TARGET_PER_SECTION:
                break

        batch_start = batch_end

    text_only = len(approved) == 0

    if text_only:
        logger.warning(
            "Section %d: all images failed QA — flagged for text-only layout",
            section_number,
        )

    return {
        "section_number": section_number,
        "approved_count": len(approved),
        "approved_paths": approved,
        "rejected_count": len(rejected),
        "rejected": rejected,
        "text_only": text_only,
    }


def _rejection_reason(qr: Dict[str, Any]) -> str:
    """Build a human-readable rejection reason from the QA result."""
    reasons = []
    rel = qr.get("relevant", {})
    if isinstance(rel, dict) and rel.get("answer", "").lower() == "no":
        reasons.append(f"Not relevant: {rel.get('reason', '')}")
    ai = qr.get("ai_generated", {})
    if isinstance(ai, dict) and ai.get("answer", "").lower() == "yes":
        reasons.append(f"AI-generated: {ai.get('reason', '')}")
    qual = qr.get("quality", {})
    if isinstance(qual, dict) and qual.get("answer", "").lower() == "no":
        reasons.append(f"Quality issue: {qual.get('reason', '')}")
    return "; ".join(reasons) if reasons else "Failed overall QA"
