"""
Pillow-based YouTube thumbnail generator for Adam's Axiom.

Reads the ``thumbnail`` key from ``script.json``, loads per-section icons,
and composites a 1280x720 grid-style thumbnail with circular icons, labels,
a bold headline, and a sub-headline.
"""

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────

THUMB_WIDTH = 1280
THUMB_HEIGHT = 720
BG_COLOR = (245, 245, 245)  # very light gray
ICON_DIAMETER = 120
ICON_BORDER_COLOR = (200, 200, 200)
ICON_BORDER_WIDTH = 2
ICON_SHADOW_OFFSET = 3
ICON_SHADOW_COLOR = (210, 210, 210)

HEADLINE_COLOR = (20, 20, 20)
SUBTEXT_COLOR = (80, 80, 80)
LABEL_COLOR = (30, 30, 30)

HEADLINE_MAX_SIZE = 56
HEADLINE_MIN_SIZE = 28
SUBTEXT_SIZE = 26
LABEL_SIZE = 15
LABEL_MAX_CHARS = 15

ROW_TOP_Y = 90
ROW_BOTTOM_Y = 520
LABEL_GAP = 8
ICON_H_PADDING = 80

FALLBACK_ACCENT = (41, 98, 255)  # blue accent for text-only thumbnail


# ── Font Discovery ────────────────────────────────────────────────────

_FONT_SEARCH_PATHS = [
    # macOS
    "/Library/Fonts",
    os.path.expanduser("~/Library/Fonts"),
    "/System/Library/Fonts",
    "/System/Library/Fonts/Supplemental",
    # Linux
    "/usr/share/fonts/truetype",
    "/usr/share/fonts/truetype/dejavu",
    "/usr/share/fonts/truetype/liberation",
    "/usr/local/share/fonts",
    # Windows
    r"C:\Windows\Fonts",
]

_FONT_PREFERENCES_BOLD = [
    "Montserrat-Bold.ttf",
    "Montserrat-ExtraBold.ttf",
    "Montserrat-SemiBold.ttf",
    "DejaVuSans-Bold.ttf",
    "LiberationSans-Bold.ttf",
    "Arial Bold.ttf",
    "arialbd.ttf",
    "Helvetica-Bold.ttf",
]

_FONT_PREFERENCES_REGULAR = [
    "Montserrat-Medium.ttf",
    "Montserrat-Regular.ttf",
    "DejaVuSans.ttf",
    "LiberationSans-Regular.ttf",
    "Arial.ttf",
    "arial.ttf",
    "Helvetica.ttf",
]


def _find_font(preferences: List[str]) -> Optional[str]:
    """Walk common font directories looking for a preferred font file."""
    for font_name in preferences:
        for search_dir in _FONT_SEARCH_PATHS:
            candidate = Path(search_dir) / font_name
            if candidate.is_file():
                return str(candidate)
            for sub in Path(search_dir).rglob(font_name) if Path(search_dir).is_dir() else []:
                if sub.is_file():
                    return str(sub)
    return None


def _load_font(size: int, bold: bool = True) -> Union[ImageFont.FreeTypeFont, ImageFont.ImageFont]:
    """Load a TrueType font at *size*, falling back gracefully."""
    prefs = _FONT_PREFERENCES_BOLD if bold else _FONT_PREFERENCES_REGULAR
    path = _find_font(prefs)
    if path:
        try:
            return ImageFont.truetype(path, size)
        except Exception as exc:
            logger.warning("Failed to load font %s: %s", path, exc)
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", size)
    except Exception:
        pass
    logger.warning("No TrueType font found — using PIL default bitmap font")
    return ImageFont.load_default()


# ── Circular Icon Rendering ──────────────────────────────────────────

def _make_circular_icon(image_path: Path, size: int = ICON_DIAMETER) -> Image.Image:
    """Open *image_path*, resize to *size*×*size*, and mask to a circle."""
    img = Image.open(image_path).convert("RGBA").resize(
        (size, size), Image.LANCZOS,
    )
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)

    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(img, mask=mask)

    border_draw = ImageDraw.Draw(result)
    border_draw.ellipse(
        (0, 0, size - 1, size - 1),
        outline=ICON_BORDER_COLOR,
        width=ICON_BORDER_WIDTH,
    )
    return result


def _draw_shadow_circle(
    canvas: Image.Image,
    center_x: int,
    center_y: int,
    radius: int,
) -> None:
    """Draw a subtle drop-shadow behind where the icon will be pasted."""
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse(
        (
            center_x - radius + ICON_SHADOW_OFFSET,
            center_y - radius + ICON_SHADOW_OFFSET,
            center_x + radius + ICON_SHADOW_OFFSET,
            center_y + radius + ICON_SHADOW_OFFSET,
        ),
        fill=(*ICON_SHADOW_COLOR, 60),
    )
    canvas.paste(Image.alpha_composite(
        Image.new("RGBA", canvas.size, (0, 0, 0, 0)), shadow,
    ), mask=shadow)


# ── Layout Calculation ───────────────────────────────────────────────

def _split_into_rows(count: int) -> Tuple[int, int]:
    """Decide how many icons go in each row (top, bottom)."""
    if count <= 0:
        return (0, 0)
    if count <= 3:
        return (count, 0)
    half = count // 2
    return (count - half, half)


def _row_x_positions(icon_count: int) -> List[int]:
    """Return center-x positions for *icon_count* icons, evenly distributed."""
    if icon_count <= 0:
        return []
    usable = THUMB_WIDTH - 2 * ICON_H_PADDING
    spacing = usable / (icon_count + 1)
    return [int(ICON_H_PADDING + spacing * (i + 1)) for i in range(icon_count)]


# ── Text Helpers ─────────────────────────────────────────────────────

def _fit_text_size(
    text: str,
    max_width: int,
    max_size: int,
    min_size: int,
    bold: bool = True,
) -> Tuple[Union[ImageFont.FreeTypeFont, ImageFont.ImageFont], int, int]:
    """Find the largest font size in [min_size, max_size] that fits *max_width*."""
    for size in range(max_size, min_size - 1, -2):
        font = _load_font(size, bold=bold)
        bbox = font.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        if tw <= max_width:
            return font, tw, th
    font = _load_font(min_size, bold=bold)
    bbox = font.getbbox(text)
    return font, bbox[2] - bbox[0], bbox[3] - bbox[1]


def _truncate_label(title: str, max_chars: int = LABEL_MAX_CHARS) -> str:
    if len(title) <= max_chars:
        return title
    return title[: max_chars - 1].rstrip() + "\u2026"


# ── Text-Only Fallback ───────────────────────────────────────────────

def _render_text_only(
    headline: str,
    sub_text: str,
) -> Image.Image:
    """Generate a text-only thumbnail when no icon images are available."""
    canvas = Image.new("RGBA", (THUMB_WIDTH, THUMB_HEIGHT), (*BG_COLOR, 255))
    draw = ImageDraw.Draw(canvas)

    accent_bar_h = 8
    draw.rectangle(
        (0, THUMB_HEIGHT // 2 - 80 - accent_bar_h, THUMB_WIDTH, THUMB_HEIGHT // 2 - 80),
        fill=(*FALLBACK_ACCENT, 255),
    )

    max_w = THUMB_WIDTH - 120
    h_font, h_tw, h_th = _fit_text_size(headline, max_w, 64, 32)
    h_x = (THUMB_WIDTH - h_tw) // 2
    h_y = THUMB_HEIGHT // 2 - h_th // 2 - 20
    draw.text((h_x, h_y), headline, fill=(*HEADLINE_COLOR, 255), font=h_font)

    if sub_text:
        s_font, s_tw, s_th = _fit_text_size(sub_text, max_w, 30, 18, bold=False)
        s_x = (THUMB_WIDTH - s_tw) // 2
        s_y = h_y + h_th + 16
        draw.text((s_x, s_y), sub_text, fill=(*SUBTEXT_COLOR, 255), font=s_font)

    return canvas


# ── Main Composition ─────────────────────────────────────────────────

def _compose_thumbnail(
    headline: str,
    sub_text: str,
    icons: List[Tuple[Image.Image, str]],
) -> Image.Image:
    """
    Build the full thumbnail image.

    *icons* is a list of (circular_RGBA_image, label_string) tuples.
    """
    if not icons:
        return _render_text_only(headline, sub_text)

    canvas = Image.new("RGBA", (THUMB_WIDTH, THUMB_HEIGHT), (*BG_COLOR, 255))
    draw = ImageDraw.Draw(canvas)
    label_font = _load_font(LABEL_SIZE, bold=True)
    radius = ICON_DIAMETER // 2

    top_count, bottom_count = _split_into_rows(len(icons))
    top_icons = icons[:top_count]
    bottom_icons = icons[top_count:]

    # ── Row 1 (top) ──
    top_xs = _row_x_positions(top_count)
    for (icon_img, label), cx in zip(top_icons, top_xs):
        cy = ROW_TOP_Y + radius
        _draw_shadow_circle(canvas, cx, cy, radius)
        paste_x = cx - radius
        paste_y = cy - radius
        canvas.paste(icon_img, (paste_x, paste_y), icon_img)

        lbl = _truncate_label(label)
        bbox = label_font.getbbox(lbl)
        lw = bbox[2] - bbox[0]
        lx = cx - lw // 2
        ly = cy + radius + LABEL_GAP
        draw.text((lx, ly), lbl, fill=(*LABEL_COLOR, 255), font=label_font)

    # ── Row 2 (bottom) ──
    if bottom_icons:
        bot_xs = _row_x_positions(bottom_count)
        for (icon_img, label), cx in zip(bottom_icons, bot_xs):
            cy = ROW_BOTTOM_Y + radius
            _draw_shadow_circle(canvas, cx, cy, radius)
            paste_x = cx - radius
            paste_y = cy - radius
            canvas.paste(icon_img, (paste_x, paste_y), icon_img)

            lbl = _truncate_label(label)
            bbox = label_font.getbbox(lbl)
            lw = bbox[2] - bbox[0]
            lx = cx - lw // 2
            ly = cy + radius + LABEL_GAP
            draw.text((lx, ly), lbl, fill=(*LABEL_COLOR, 255), font=label_font)

    # ── Headline (centred between the two rows) ──
    text_zone_top = ROW_TOP_Y + ICON_DIAMETER + LABEL_GAP + LABEL_SIZE + 20
    text_zone_bottom = ROW_BOTTOM_Y - 20
    if not bottom_icons:
        text_zone_bottom = THUMB_HEIGHT - 80
    text_zone_center = (text_zone_top + text_zone_bottom) // 2

    max_text_w = THUMB_WIDTH - 100
    h_font, h_tw, h_th = _fit_text_size(headline, max_text_w, HEADLINE_MAX_SIZE, HEADLINE_MIN_SIZE)
    h_x = (THUMB_WIDTH - h_tw) // 2
    h_y = text_zone_center - h_th - 6
    draw.text((h_x, h_y), headline, fill=(*HEADLINE_COLOR, 255), font=h_font)

    if sub_text:
        s_font, s_tw, s_th = _fit_text_size(sub_text, max_text_w, SUBTEXT_SIZE, 16, bold=False)
        s_x = (THUMB_WIDTH - s_tw) // 2
        s_y = h_y + h_th + 10
        draw.text((s_x, s_y), sub_text, fill=(*SUBTEXT_COLOR, 255), font=s_font)

    return canvas


# ── Icon Loading ─────────────────────────────────────────────────────

def _load_icons(
    section_numbers: List[int],
    sections: List[Dict[str, Any]],
    images_dir: Path,
) -> List[Tuple[Image.Image, str]]:
    """
    Load and circularise icons for *section_numbers*.

    Tries ``images/thumbnail/icon_section_NN.jpg`` first, then falls back
    to ``images/section_NN/icon.jpg``.
    """
    title_map: Dict[int, str] = {}
    for s in sections:
        title_map[s.get("section_number", -1)] = s.get("section_title", "")

    icons: List[Tuple[Image.Image, str]] = []
    for sec_num in section_numbers:
        thumb_icon = images_dir / "thumbnail" / f"icon_section_{sec_num:02d}.jpg"
        section_icon = images_dir / f"section_{sec_num:02d}" / "icon.jpg"

        icon_path: Optional[Path] = None
        if thumb_icon.is_file():
            icon_path = thumb_icon
        elif section_icon.is_file():
            icon_path = section_icon

        if icon_path is None:
            logger.warning("No icon found for section %d — skipping", sec_num)
            continue

        try:
            circular = _make_circular_icon(icon_path)
            label = title_map.get(sec_num, f"Section {sec_num}")
            icons.append((circular, label))
        except Exception as exc:
            logger.warning("Failed to process icon for section %d: %s", sec_num, exc)

    return icons


# ── Public API ───────────────────────────────────────────────────────

def generate_thumbnail(project_dir: Path) -> Dict[str, Any]:
    """
    Generate a YouTube thumbnail for the project at *project_dir*.

    Reads ``script/script.json``, loads section icons, composites the
    thumbnail, and saves it to ``output/thumbnail.jpg``.

    Returns:
        Dict with ``path``, ``width``, ``height``, ``icon_count``, and any
        ``warnings``.
    """
    script_path = project_dir / "script" / "script.json"
    if not script_path.exists():
        raise FileNotFoundError(f"script.json not found at {script_path}")

    with open(script_path, "r", encoding="utf-8") as f:
        script_data = json.load(f)

    sections = script_data.get("sections", [])

    # Extract thumbnail spec (fall back to title-derived headline)
    thumb_spec = script_data.get("thumbnail", {})
    headline = thumb_spec.get("headline", "")
    sub_text = thumb_spec.get("sub_text", "")
    grid_sections: List[int] = thumb_spec.get("grid_images_from_sections", [])

    if not headline:
        headline = script_data.get("title", script_data.get("video_title", ""))
    if not headline:
        headline = "Adam's Axiom"

    warnings: List[str] = []

    # Load icon images
    images_dir = project_dir / "images"
    icons: List[Tuple[Image.Image, str]] = []
    if grid_sections and images_dir.is_dir():
        icons = _load_icons(grid_sections, sections, images_dir)
        missing = len(grid_sections) - len(icons)
        if missing > 0:
            warnings.append(f"{missing} icon(s) were unavailable and skipped")
    elif not grid_sections:
        warnings.append("No grid_images_from_sections specified — text-only thumbnail")

    # Compose
    thumbnail = _compose_thumbnail(headline, sub_text, icons)

    # Save
    output_dir = project_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "thumbnail.jpg"
    thumbnail.convert("RGB").save(output_path, "JPEG", quality=95)

    logger.info("Thumbnail saved to %s (%dx%d, %d icons)", output_path, THUMB_WIDTH, THUMB_HEIGHT, len(icons))

    return {
        "path": str(output_path),
        "width": THUMB_WIDTH,
        "height": THUMB_HEIGHT,
        "icon_count": len(icons),
        "headline": headline,
        "sub_text": sub_text,
        "warnings": warnings,
    }
