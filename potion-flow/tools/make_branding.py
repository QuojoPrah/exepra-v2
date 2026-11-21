#!/usr/bin/env python3
"""Renders Potion Flow's app icon, adaptive-icon layers and splash image.

    python3 tools/make_branding.py

Outputs into assets/branding/. The bottle silhouette follows
scripts/game/bottle_shape.gd ("round" style) so branding matches the game.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "branding"
SS = 4  # supersampling factor

BG_TOP = (44, 22, 86)
BG_BOTTOM = (16, 11, 32)
LIQUIDS = [(56, 217, 245), (139, 92, 246), (255, 143, 200)]  # bottom -> top


def bottle_half(hw=42.0, r=22.0, shoulder=-170.0, neck=16.0, neck_top=-224.0, inset=0.0):
    pts = [(0.0, -inset)]
    hw -= inset
    r = max(2.0, r - inset)
    neck -= inset
    cx, cy = hw - r, -inset - r
    for k in range(9):
        a = math.pi / 2 - (math.pi / 2) * k / 8
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    pts.append((hw, shoulder))
    p0, c1, p2 = (hw, shoulder), (hw, shoulder - 30), (neck, shoulder - 34 + inset * 0.5)
    for k in range(1, 11):
        t = k / 10
        a = (p0[0] + (c1[0] - p0[0]) * t, p0[1] + (c1[1] - p0[1]) * t)
        b = (c1[0] + (p2[0] - c1[0]) * t, c1[1] + (p2[1] - c1[1]) * t)
        pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    pts.append((neck, neck_top))
    return pts


def mirror(half):
    return half + [(-x, y) for x, y in reversed(half) if abs(x) > 0.01]


def gradient(size, top, bottom):
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return img


def draw_bottle(img, cx, base_y, scale):
    """Draws the bottle with liquid onto an RGBA image."""
    tf = lambda pts: [(cx + x * scale, base_y + y * scale) for x, y in pts]
    outer_half = bottle_half()
    lip = outer_half + [(22, -225), (22, -236), (15, -236)]
    outer = mirror(lip)
    inner = mirror(bottle_half(inset=5))

    # Glow.
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).polygon(tf(outer), fill=(168, 85, 247, 150))
    glow = glow.filter(ImageFilter.GaussianBlur(28 * scale))
    img.alpha_composite(glow)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon(tf(outer), fill=(200, 210, 255, 40))
    d.polygon(tf(inner), fill=(10, 5, 25, 110))
    # Liquid: clip bands to the interior with a mask.
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(tf(inner), fill=255)
    liquid = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(liquid)
    unit = (166 - 5) / 4
    for i, col in enumerate(LIQUIDS):
        y0 = -5 - (i + 1) * unit
        y1 = -5 - i * unit + (0 if i else 60)
        ld.rectangle(tf([(-60, y0), (60, y1)]), fill=col + (255,))
        ld.rectangle(tf([(15, y0), (60, y1)]), fill=tuple(int(c * 0.78) for c in col) + (255,))
        ld.rectangle(tf([(-60, y0), (60, y0 + 4)]), fill=tuple(min(255, int(c * 1.25 + 40)) for c in col) + (255,))
    clipped = Image.new("RGBA", img.size, (0, 0, 0, 0))
    clipped.paste(liquid, (0, 0), mask)
    layer.alpha_composite(clipped)
    # Reflection and rim.
    refl = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(refl).polygon(tf([(-33, -26), (-27, -30), (-27, -164), (-33, -158)]), fill=(255, 255, 255, 90))
    rc = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rc.paste(refl, (0, 0), mask)
    layer.alpha_composite(rc)
    d = ImageDraw.Draw(layer)
    w = max(2, int(3 * scale))
    d.line(tf(lip), fill=(255, 255, 255, 190), width=w, joint="curve")
    d.line(tf([(-x, y) for x, y in lip]), fill=(255, 255, 255, 190), width=w, joint="curve")
    d.ellipse(tf([(-21, -240), (21, -232)]), outline=(255, 255, 255, 170), width=w)
    # Gold cork.
    d.rectangle(tf([(-14, -250), (14, -226)]), fill=(140, 90, 50, 255))
    d.rectangle(tf([(-14, -250), (14, -244)]), fill=(185, 128, 76, 255))
    d.ellipse(tf([(-5, -252), (5, -242)]), fill=(245, 198, 106, 255))
    img.alpha_composite(layer)


def sparkles(img, n, seed, area):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = area
    for _ in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        r = rnd.uniform(1.5, 5) * SS
        a = rnd.randint(90, 230)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 240, 210, a))
        d.line([(x - r * 2.5, y), (x + r * 2.5, y)], fill=(255, 240, 210, a // 2), width=SS)
        d.line([(x, y - r * 2.5), (x, y + r * 2.5)], fill=(255, 240, 210, a // 2), width=SS)


def icon(size, rounded=True, with_bg=True, bottle_scale=1.0):
    s = size * SS
    img = gradient(s, BG_TOP, BG_BOTTOM).convert("RGBA") if with_bg else Image.new("RGBA", (s, s), (0, 0, 0, 0))
    if with_bg:
        sparkles(img, 26, size, (0, 0, s, s))
    sc = s / 330 * bottle_scale
    draw_bottle(img, s / 2, s / 2 + 128 * sc, sc)
    if rounded:
        m = Image.new("L", (s, s), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255)
        img.putalpha(m)
    return img.resize((size, size), Image.LANCZOS)


def splash(w=720, h=1280):
    s = (w * SS, h * SS)
    img = Image.new("RGBA", s, (0, 0, 0, 0))
    sc = s[0] / 720 * 1.1
    draw_bottle(img, s[0] / 2, s[1] * 0.56, sc)
    sparkles(img, 18, 7, (s[0] * 0.25, s[1] * 0.28, s[0] * 0.75, s[1] * 0.6))
    return img.resize((w, h), Image.LANCZOS)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    icon(1024).save(OUT / "icon_1024.png")
    icon(512).save(OUT / "icon_512.png")
    icon(192).save(OUT / "icon_192.png")
    # Android adaptive icon layers (432x432; content inside the 66% safe zone).
    icon(432, rounded=False, with_bg=False, bottle_scale=0.62).save(OUT / "adaptive_foreground.png")
    icon(432, rounded=False, with_bg=True, bottle_scale=0.0001).save(OUT / "adaptive_background.png")
    splash().save(OUT / "splash.png")
    print("wrote", sorted(p.name for p in OUT.iterdir()))


if __name__ == "__main__":
    main()
