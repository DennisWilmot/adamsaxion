"""Video assembly module for Adam's Axiom YouTube pipeline.

Composes final MP4 videos from script data, approved images, and audio files
using Pillow for frame rendering and MoviePy for video compositing.
"""

from __future__ import annotations

import json
import logging
import os
import platform
import random
import textwrap
from pathlib import Path
from typing import Optional

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────

WIDTH, HEIGHT = 1920, 1080
BG_COLOR = (255, 255, 255)
TEXT_COLOR = (0, 0, 0)
KEYWORD_COLOR = (204, 0, 0)  # #CC0000
TITLE_BAR_HEIGHT = 80
ICON_SIZE = 64
ICON_MARGIN = 12
FADE_DURATION = 0.3
SECTION_PADDING = 40

# Layout geometry
IMAGE_AREA_RATIO = 0.40
TEXT_AREA_RATIO = 0.55
TEXT_LEFT_MARGIN = int(WIDTH * IMAGE_AREA_RATIO) + SECTION_PADDING * 2
TEXT_RIGHT_MARGIN = WIDTH - SECTION_PADDING
TEXT_MAX_WIDTH = TEXT_RIGHT_MARGIN - TEXT_LEFT_MARGIN

MIN_VIDEO_SECONDS = 120
MAX_VIDEO_SECONDS = 1800


# ── Font discovery ────────────────────────────────────────────────────

_FONT_SEARCH_PATHS: list[str] = []

if platform.system() == "Darwin":
    _FONT_SEARCH_PATHS = [
        "/System/Library/Fonts",
        "/Library/Fonts",
        os.path.expanduser("~/Library/Fonts"),
    ]
elif platform.system() == "Linux":
    _FONT_SEARCH_PATHS = [
        "/usr/share/fonts",
        "/usr/local/share/fonts",
        os.path.expanduser("~/.local/share/fonts"),
        os.path.expanduser("~/.fonts"),
    ]
elif platform.system() == "Windows":
    _FONT_SEARCH_PATHS = [
        os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts"),
    ]

_PREFERRED_FONTS = [
    "Montserrat-Bold",
    "MontserratBold",
    "Montserrat Bold",
    "DejaVuSans-Bold",
    "DejaVuSans",
    "Arial Bold",
    "ArialBold",
    "Arial",
    "Helvetica-Bold",
    "Helvetica",
    "LiberationSans-Bold",
    "NotoSans-Bold",
]

_font_cache: dict[int, ImageFont.FreeTypeFont | ImageFont.ImageFont] = {}


def _discover_font(size: int = 30) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Find the best available sans-serif font, with caching by size."""
    if size in _font_cache:
        return _font_cache[size]

    for search_dir in _FONT_SEARCH_PATHS:
        if not os.path.isdir(search_dir):
            continue
        for root, _dirs, files in os.walk(search_dir):
            for preferred in _PREFERRED_FONTS:
                for f in files:
                    name_lower = f.lower().replace("-", "").replace("_", "").replace(" ", "")
                    preferred_lower = preferred.lower().replace("-", "").replace("_", "").replace(" ", "")
                    if preferred_lower in name_lower and f.lower().endswith((".ttf", ".otf")):
                        try:
                            font = ImageFont.truetype(os.path.join(root, f), size)
                            _font_cache[size] = font
                            logger.info("Using font: %s (size %d)", f, size)
                            return font
                        except (OSError, IOError):
                            continue

    logger.warning("No preferred font found, using Pillow default (size %d)", size)
    font = ImageFont.load_default(size=size)
    _font_cache[size] = font
    return font


# ── Image helpers ─────────────────────────────────────────────────────

def _circular_crop(img: Image.Image, diameter: int) -> Image.Image:
    """Return *img* resized and cropped through a circular alpha mask."""
    img = img.convert("RGBA").resize((diameter, diameter), Image.LANCZOS)
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter, diameter), fill=255)
    result = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    result.paste(img, (0, 0), mask)
    return result


def _load_approved_images(section_dir: Path, max_count: int = 4) -> list[Image.Image]:
    """Load up to *max_count* approved images from a section folder."""
    approved_dir = section_dir / "approved"
    if not approved_dir.is_dir():
        return []
    imgs: list[Image.Image] = []
    for f in sorted(approved_dir.iterdir()):
        if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            try:
                imgs.append(Image.open(f).convert("RGB"))
            except Exception as exc:
                logger.warning("Could not load image %s: %s", f, exc)
        if len(imgs) >= max_count:
            break
    return imgs


def _load_icon(section_dir: Path) -> Optional[Image.Image]:
    """Load the section icon (icon.jpg) if present."""
    icon_path = section_dir / "icon.jpg"
    if icon_path.exists():
        try:
            return Image.open(icon_path).convert("RGB")
        except Exception as exc:
            logger.warning("Could not load icon %s: %s", icon_path, exc)
    return None


# ── Frame composition ─────────────────────────────────────────────────

def _draw_title_bar(
    canvas: Image.Image,
    draw: ImageDraw.ImageDraw,
    section_title: str,
    icon: Optional[Image.Image],
) -> None:
    """Render the top bar with circular icon and section title."""
    title_font = _discover_font(28)

    if icon is not None:
        circ = _circular_crop(icon, ICON_SIZE)
        canvas.paste(circ, (ICON_MARGIN, (TITLE_BAR_HEIGHT - ICON_SIZE) // 2), circ)
        text_x = ICON_MARGIN + ICON_SIZE + 12
    else:
        text_x = SECTION_PADDING

    title_y = (TITLE_BAR_HEIGHT - 28) // 2
    draw.text((text_x, title_y), section_title.upper(), fill=TEXT_COLOR, font=title_font)

    draw.line(
        [(0, TITLE_BAR_HEIGHT), (WIDTH, TITLE_BAR_HEIGHT)],
        fill=(220, 220, 220),
        width=2,
    )


def _fit_image(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    """Resize *img* to fit within max_w x max_h while preserving aspect ratio."""
    ratio = min(max_w / img.width, max_h / img.height)
    new_w, new_h = int(img.width * ratio), int(img.height * ratio)
    return img.resize((new_w, new_h), Image.LANCZOS)


def _place_images_standard(canvas: Image.Image, images: list[Image.Image]) -> None:
    """Place 1-2 images on the left side (standard layout)."""
    area_w = int(WIDTH * IMAGE_AREA_RATIO) - SECTION_PADDING * 2
    area_h = HEIGHT - TITLE_BAR_HEIGHT - SECTION_PADDING * 2
    x_start = SECTION_PADDING
    y_start = TITLE_BAR_HEIGHT + SECTION_PADDING

    if len(images) == 1:
        fitted = _fit_image(images[0], area_w, area_h)
        cx = x_start + (area_w - fitted.width) // 2
        cy = y_start + (area_h - fitted.height) // 2
        canvas.paste(fitted, (cx, cy))
    elif len(images) >= 2:
        half_h = (area_h - SECTION_PADDING) // 2
        for idx, img in enumerate(images[:2]):
            fitted = _fit_image(img, area_w, half_h)
            cx = x_start + (area_w - fitted.width) // 2
            cy = y_start + idx * (half_h + SECTION_PADDING) + (half_h - fitted.height) // 2
            canvas.paste(fitted, (cx, cy))


def _place_images_collage3(canvas: Image.Image, images: list[Image.Image]) -> None:
    """Tile 3 images on left side: one large on top, two smaller below."""
    area_w = int(WIDTH * IMAGE_AREA_RATIO) - SECTION_PADDING * 2
    area_h = HEIGHT - TITLE_BAR_HEIGHT - SECTION_PADDING * 2
    x_start = SECTION_PADDING
    y_start = TITLE_BAR_HEIGHT + SECTION_PADDING

    top_h = int(area_h * 0.55)
    bot_h = area_h - top_h - SECTION_PADDING

    if len(images) >= 1:
        fitted = _fit_image(images[0], area_w, top_h)
        cx = x_start + (area_w - fitted.width) // 2
        canvas.paste(fitted, (cx, y_start))

    bot_w = (area_w - SECTION_PADDING) // 2
    for idx in range(min(2, len(images) - 1)):
        img = images[idx + 1]
        fitted = _fit_image(img, bot_w, bot_h)
        cx = x_start + idx * (bot_w + SECTION_PADDING) + (bot_w - fitted.width) // 2
        cy = y_start + top_h + SECTION_PADDING + (bot_h - fitted.height) // 2
        canvas.paste(fitted, (cx, cy))


def _place_images_collage4(canvas: Image.Image, images: list[Image.Image]) -> None:
    """2x2 grid of images on the left side."""
    area_w = int(WIDTH * IMAGE_AREA_RATIO) - SECTION_PADDING * 2
    area_h = HEIGHT - TITLE_BAR_HEIGHT - SECTION_PADDING * 2
    x_start = SECTION_PADDING
    y_start = TITLE_BAR_HEIGHT + SECTION_PADDING

    cell_w = (area_w - SECTION_PADDING) // 2
    cell_h = (area_h - SECTION_PADDING) // 2

    for idx, img in enumerate(images[:4]):
        row, col = divmod(idx, 2)
        fitted = _fit_image(img, cell_w, cell_h)
        cx = x_start + col * (cell_w + SECTION_PADDING) + (cell_w - fitted.width) // 2
        cy = y_start + row * (cell_h + SECTION_PADDING) + (cell_h - fitted.height) // 2
        canvas.paste(fitted, (cx, cy))


def _place_image_single_focus(canvas: Image.Image, images: list[Image.Image]) -> None:
    """One large image ~60% width with minimal text overlay area."""
    if not images:
        return
    area_w = int(WIDTH * 0.60) - SECTION_PADDING * 2
    area_h = HEIGHT - TITLE_BAR_HEIGHT - SECTION_PADDING * 2
    fitted = _fit_image(images[0], area_w, area_h)
    cx = SECTION_PADDING + (area_w - fitted.width) // 2
    cy = TITLE_BAR_HEIGHT + SECTION_PADDING + (area_h - fitted.height) // 2
    canvas.paste(fitted, (cx, cy))


def _place_image_data_chart(canvas: Image.Image, images: list[Image.Image]) -> None:
    """Chart/graph shown large ~70% width."""
    if not images:
        return
    area_w = int(WIDTH * 0.70) - SECTION_PADDING * 2
    area_h = HEIGHT - TITLE_BAR_HEIGHT - SECTION_PADDING * 2
    fitted = _fit_image(images[0], area_w, area_h)
    cx = SECTION_PADDING + (area_w - fitted.width) // 2
    cy = TITLE_BAR_HEIGHT + SECTION_PADDING + (area_h - fitted.height) // 2
    canvas.paste(fitted, (cx, cy))


def _draw_narration_text(
    draw: ImageDraw.ImageDraw,
    narration: str,
    keywords: list[str],
    layout: str,
) -> None:
    """Render narration text with keyword highlighting."""
    font = _discover_font(30)
    small_font = _discover_font(26)

    if layout in ("single-focus", "data-chart"):
        x_start = int(WIDTH * 0.62) + SECTION_PADDING
        text_width = WIDTH - x_start - SECTION_PADDING
        active_font = small_font
    elif layout == "text-only":
        x_start = SECTION_PADDING * 3
        text_width = WIDTH - SECTION_PADDING * 6
        active_font = _discover_font(36)
    else:
        x_start = TEXT_LEFT_MARGIN
        text_width = TEXT_MAX_WIDTH
        active_font = font

    chars_per_line = max(1, text_width // (active_font.size * 6 // 10))
    wrapped_lines = textwrap.wrap(narration, width=chars_per_line)

    y = TITLE_BAR_HEIGHT + SECTION_PADDING + 10
    line_height = int(active_font.size * 1.5)
    kw_lower = {k.lower() for k in keywords} if keywords else set()

    for line in wrapped_lines:
        if y + line_height > HEIGHT - SECTION_PADDING:
            break
        x = x_start
        for word in line.split():
            stripped = word.strip(".,;:!?\"'()[]{}").lower()
            color = KEYWORD_COLOR if stripped in kw_lower else TEXT_COLOR
            bbox = active_font.getbbox(word + " ")
            word_w = bbox[2] - bbox[0]
            if x + word_w > x_start + text_width:
                y += line_height
                x = x_start
                if y + line_height > HEIGHT - SECTION_PADDING:
                    break
            draw.text((x, y), word + " ", fill=color, font=active_font)
            x += word_w
        y += line_height


def _draw_onscreen_text(
    draw: ImageDraw.ImageDraw,
    onscreen_text: str,
) -> None:
    """Draw the onscreen_text overlay at the bottom of the frame."""
    if not onscreen_text:
        return
    font = _discover_font(24)
    bbox = font.getbbox(onscreen_text)
    tw = bbox[2] - bbox[0]
    x = (WIDTH - tw) // 2
    y = HEIGHT - SECTION_PADDING - 40
    draw.rectangle(
        [(x - 12, y - 6), (x + tw + 12, y + 30)],
        fill=(240, 240, 240),
    )
    draw.text((x, y), onscreen_text, fill=TEXT_COLOR, font=font)


LAYOUT_IMAGE_PLACERS = {
    "standard": _place_images_standard,
    "collage-3": _place_images_collage3,
    "collage-4": _place_images_collage4,
    "single-focus": _place_image_single_focus,
    "data-chart": _place_image_data_chart,
    "text-only": lambda _canvas, _imgs: None,
}


def compose_frame(
    section_title: str,
    narration: str,
    keywords: list[str],
    onscreen_text: str,
    layout: str,
    images: list[Image.Image],
    icon: Optional[Image.Image] = None,
) -> Image.Image:
    """Render a single 1920x1080 frame for a section.

    Returns a Pillow Image in RGB mode.
    """
    if not images and layout != "text-only":
        layout = "text-only"

    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    _draw_title_bar(canvas, draw, section_title, icon)

    placer = LAYOUT_IMAGE_PLACERS.get(layout, _place_images_standard)
    placer(canvas, images)

    _draw_narration_text(draw, narration, keywords, layout)
    _draw_onscreen_text(draw, onscreen_text)

    return canvas


# ── Video assembly ────────────────────────────────────────────────────

def _find_ad_clip(assets_dir: Path) -> Optional[Path]:
    """Return a random ad clip from assets/ad_clips/ if any exist."""
    ad_dir = assets_dir / "ad_clips"
    if not ad_dir.is_dir():
        return None
    clips = [
        f for f in ad_dir.iterdir()
        if f.suffix.lower() in (".mp4", ".mov", ".avi", ".mkv")
    ]
    if not clips:
        return None
    return random.choice(clips)


def _format_timestamp(seconds: float) -> str:
    """Convert seconds to MM:SS or HH:MM:SS."""
    seconds = int(seconds)
    if seconds >= 3600:
        h, remainder = divmod(seconds, 3600)
        m, s = divmod(remainder, 60)
        return f"{h}:{m:02d}:{s:02d}"
    m, s = divmod(seconds, 60)
    return f"{m:02d}:{s:02d}"


def _write_metadata(
    output_dir: Path,
    script_data: dict,
    section_timestamps: list[tuple[float, str]],
) -> Path:
    """Write _metadata.txt with copy-pasteable YouTube upload info."""
    meta_path = output_dir / "_metadata.txt"

    lines = [
        f"TITLE: {script_data['title']}",
        "\u2500" * 45,
        "DESCRIPTION:",
        script_data.get("description", ""),
        "",
        script_data.get("ai_disclosure", ""),
        "",
        "TIMESTAMPS:",
    ]
    for ts, title in section_timestamps:
        lines.append(f"{_format_timestamp(ts)} - {title}")

    lines.extend([
        "",
        "\u2500" * 45,
        "TAGS:",
        ", ".join(script_data.get("tags", [])),
    ])

    meta_path.write_text("\n".join(lines), encoding="utf-8")
    logger.info("Metadata written to %s", meta_path)
    return meta_path


def assemble_video(
    project_dir: Path,
    progress_callback=None,
) -> dict:
    """Assemble the final video for a project.

    Parameters
    ----------
    project_dir : Path
        Root directory of the project (e.g. projects/<id>/).
    progress_callback : callable, optional
        Called with (current_section: int, total_sections: int, message: str)
        for progress reporting.

    Returns
    -------
    dict with keys: video_path, metadata_path, duration_seconds, section_count
    """
    from moviepy import (
        ImageClip,
        AudioFileClip,
        VideoFileClip,
        concatenate_videoclips,
    )

    project_dir = Path(project_dir)

    # ── Load inputs ───────────────────────────────────────────────
    script_path = project_dir / "script" / "script.json"
    if not script_path.exists():
        script_path = project_dir / "script.json"
    if not script_path.exists():
        raise FileNotFoundError(f"No script.json found in {project_dir}")

    with open(script_path, "r", encoding="utf-8") as f:
        script_data = json.load(f)

    manifest_path = project_dir / "audio" / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"No audio manifest.json found in {project_dir / 'audio'}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # Index audio manifest by section number for quick lookup
    audio_by_section: dict[int, list[dict]] = {}
    for sec in manifest.get("sections", []):
        audio_by_section[sec["section_number"]] = sec.get("audio_files", [])

    failed_section_numbers = {
        s["section_number"] for s in manifest.get("failed_sections", [])
    }

    images_dir = project_dir / "images"
    audio_dir = project_dir / "audio"
    output_dir = project_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    sections = script_data.get("sections", [])
    total_sections = len(sections)

    # ── Build section clips ───────────────────────────────────────
    section_clips: list = []
    section_timestamps: list[tuple[float, str]] = []
    running_time = 0.0

    for idx, section in enumerate(sections):
        sec_num = section["section_number"]

        if sec_num in failed_section_numbers:
            logger.warning("Skipping section %d (audio failed)", sec_num)
            if progress_callback:
                progress_callback(idx + 1, total_sections, f"Skipped section {sec_num} (no audio)")
            continue

        audio_files = audio_by_section.get(sec_num, [])
        if not audio_files:
            logger.warning("No audio files for section %d, skipping", sec_num)
            if progress_callback:
                progress_callback(idx + 1, total_sections, f"Skipped section {sec_num} (no audio)")
            continue

        section_timestamps.append((running_time, section.get("section_title", f"Section {sec_num}")))

        if progress_callback:
            progress_callback(
                idx + 1, total_sections,
                f"Composing section {sec_num}: {section.get('section_title', '')[:30]}",
            )

        # Load images
        sec_dir = images_dir / f"section_{sec_num:02d}"
        images = _load_approved_images(sec_dir)
        icon = _load_icon(sec_dir)

        layout = section.get("layout", "standard")
        narration = section.get("narration", "")
        keywords = section.get("keywords_to_highlight", [])
        onscreen_text = section.get("onscreen_text", "")
        section_title = section.get("section_title", "")

        # Compose the visual frame
        frame_img = compose_frame(
            section_title=section_title,
            narration=narration,
            keywords=keywords,
            onscreen_text=onscreen_text,
            layout=layout,
            images=images,
            icon=icon,
        )

        frame_array = __import__("numpy").array(frame_img)

        # Calculate total section duration from all audio chunks
        section_duration = sum(af.get("duration_seconds", 0) for af in audio_files)
        if section_duration <= 0:
            logger.warning("Section %d has zero duration, skipping", sec_num)
            continue

        # Create the visual clip
        img_clip = ImageClip(frame_array, duration=section_duration)

        # Concatenate audio chunks for this section
        audio_chunks = []
        for af in audio_files:
            audio_path = audio_dir / af["filename"]
            if audio_path.exists():
                audio_chunks.append(AudioFileClip(str(audio_path)))
            else:
                logger.warning("Audio file missing: %s", audio_path)

        if audio_chunks:
            if len(audio_chunks) == 1:
                section_audio = audio_chunks[0]
            else:
                from moviepy import concatenate_audioclips
                section_audio = concatenate_audioclips(audio_chunks)

            img_clip = img_clip.with_audio(section_audio)

        section_clips.append(img_clip)
        running_time += section_duration

    if not section_clips:
        raise RuntimeError("No section clips were generated — nothing to render")

    # ── Concatenate with cross-fade transitions ───────────────────
    if progress_callback:
        progress_callback(total_sections, total_sections, "Concatenating sections...")

    if len(section_clips) > 1:
        from moviepy import CrossFadeIn, CrossFadeOut

        transition_clips = []
        for i, clip in enumerate(section_clips):
            if i == 0:
                clip = clip.with_effects([CrossFadeOut(FADE_DURATION)])
            elif i == len(section_clips) - 1:
                clip = clip.with_effects([CrossFadeIn(FADE_DURATION)])
            else:
                clip = clip.with_effects([
                    CrossFadeIn(FADE_DURATION),
                    CrossFadeOut(FADE_DURATION),
                ])
            transition_clips.append(clip)

        try:
            final = concatenate_videoclips(transition_clips, padding=-FADE_DURATION, method="compose")
        except Exception:
            logger.warning("Cross-fade concatenation failed, falling back to simple chain")
            final = concatenate_videoclips(section_clips, method="chain")
    else:
        final = section_clips[0]

    # ── Insert SaaS ad clip ───────────────────────────────────────
    saas_ad = script_data.get("saas_ad", {})
    if saas_ad.get("enabled", False):
        assets_root = project_dir.parent.parent / "assets"
        ad_path = _find_ad_clip(assets_root)
        if ad_path is None:
            # Also check project-level assets
            ad_path = _find_ad_clip(project_dir / "assets")

        if ad_path:
            insert_at = saas_ad.get("insert_at_seconds", 120)
            try:
                ad_clip = VideoFileClip(str(ad_path))
                if insert_at < final.duration:
                    before = final.subclipped(0, insert_at)
                    after = final.subclipped(insert_at, final.duration)
                    final = concatenate_videoclips([before, ad_clip, after], method="compose")
                    logger.info("Inserted ad clip at %ds from %s", insert_at, ad_path.name)
                else:
                    final = concatenate_videoclips([final, ad_clip], method="compose")
                    logger.info("Appended ad clip (insert point %ds past end)", insert_at)
            except Exception as exc:
                logger.warning("Failed to insert ad clip: %s", exc)
        else:
            logger.info("No ad clips available in assets/ad_clips/, skipping")

    # ── Render to MP4 ─────────────────────────────────────────────
    video_path = output_dir / "video.mp4"

    if progress_callback:
        progress_callback(total_sections, total_sections, "Rendering MP4 (this may take a while)...")

    render_kwargs = dict(
        codec="libx264",
        audio_codec="aac",
        fps=24,
        preset="medium",
        threads=4,
        logger=None,
    )

    try:
        final.write_videofile(str(video_path), **render_kwargs)
    except Exception as first_exc:
        logger.warning("First render attempt failed: %s — retrying", first_exc)
        try:
            final.write_videofile(str(video_path), **render_kwargs)
        except Exception as second_exc:
            raise RuntimeError(
                f"Video render failed after two attempts: {second_exc}"
            ) from second_exc

    # ── Sanity check ──────────────────────────────────────────────
    rendered_duration = final.duration
    if rendered_duration < MIN_VIDEO_SECONDS:
        logger.warning(
            "Rendered video is very short (%.0fs < %ds minimum)",
            rendered_duration, MIN_VIDEO_SECONDS,
        )
    elif rendered_duration > MAX_VIDEO_SECONDS:
        logger.warning(
            "Rendered video is very long (%.0fs > %ds maximum)",
            rendered_duration, MAX_VIDEO_SECONDS,
        )

    # ── Write metadata ────────────────────────────────────────────
    meta_path = _write_metadata(output_dir, script_data, section_timestamps)

    # ── Cleanup ───────────────────────────────────────────────────
    try:
        final.close()
    except Exception:
        pass

    result = {
        "video_path": str(video_path),
        "metadata_path": str(meta_path),
        "duration_seconds": round(rendered_duration, 1),
        "section_count": len(section_clips),
    }
    logger.info("Video assembly complete: %s", result)
    return result
