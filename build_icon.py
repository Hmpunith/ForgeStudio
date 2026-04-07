"""
Renders the ForgeLogo SVG (matching the home page logo exactly) to a 512x512 PNG
for use as the Electron app icon.
"""
import struct, zlib, base64, os

# The logo: indigo→violet gradient rounded square + white stacked layers SVG
SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6366f1"/>
      <stop offset="60%"  stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background rounded square -->
  <rect width="512" height="512" rx="96" ry="96" fill="url(#g)"/>

  <!-- Glow behind icon -->
  <ellipse cx="256" cy="260" rx="140" ry="80" fill="white" fill-opacity="0.12"/>

  <!-- Stacked layers icon (scaled up from 24x24 viewBox to ~280x280 centered) -->
  <g transform="translate(116, 130) scale(11.67)">
    <!-- Top layer (solid fill) -->
    <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" fill-opacity="0.95"/>
    <!-- Middle layer -->
    <path d="M2 13l10 5 10-5" stroke="white" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round"
          fill="none" stroke-opacity="0.75"/>
    <!-- Bottom layer -->
    <path d="M2 18l10 5 10-5" stroke="white" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round"
          fill="none" stroke-opacity="0.45"/>
  </g>
</svg>'''

out_path = r"c:\Users\Hmpun\Desktop\New\New folder\ai-web-builder-studio\electron\icon.png"

# Write the SVG first, then convert using cairosvg or inkscape if available,
# otherwise use PIL to paint from scratch matching the design.
svg_path = out_path.replace("icon.png", "icon_src.svg")
with open(svg_path, "wb") as f:
    f.write(SVG)

print("SVG written to", svg_path)

# Try cairosvg
try:
    import cairosvg
    cairosvg.svg2png(bytestring=SVG, write_to=out_path, output_width=512, output_height=512)
    print("✅ Icon saved via cairosvg:", out_path)
    exit(0)
except ImportError:
    print("cairosvg not available, trying PIL...")

# Fallback: draw with PIL
try:
    from PIL import Image, ImageDraw, ImageFont
    import math

    SIZE = 512
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw gradient rounded rectangle background
    radius = 96
    # Gradient from top-left (#6366f1) to bottom-right (#a78bfa)
    for y in range(SIZE):
        for x in range(SIZE):
            t = (x + y) / (2 * SIZE)
            r = int(0x63 + t * (0xa7 - 0x63))
            g = int(0x66 + t * (0x8b - 0x66))
            b = int(0xf1 + t * (0xfa - 0xf1))
            img.putpixel((x, y), (r, g, b, 255))

    # Mask to rounded rectangle
    mask = Image.new("L", (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=radius, fill=255)
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(img, mask=mask)

    # Draw stacked layers in white
    draw2 = ImageDraw.Draw(out)
    cx, cy = SIZE // 2, SIZE // 2
    W, H = 280, 200  # bounding box of the icon

    def hex_points(cx, cy, w, h):
        """Points for a flat hexagon / diamond shape."""
        hw, hh = w // 2, h // 2
        return [(cx, cy - hh), (cx + hw, cy - hh//2),
                (cx + hw, cy + hh//2), (cx, cy + hh),
                (cx - hw, cy + hh//2), (cx - hw, cy - hh//2)]

    # Top layer (filled polygon — top face)
    top_y = cy - 80
    top_pts = [(cx, top_y - 40), (cx + 120, top_y),
               (cx, top_y + 40), (cx - 120, top_y)]
    draw2.polygon(top_pts, fill=(255, 255, 255, 240))

    # Middle stroke layer
    mid_y = top_y + 80
    mid_pts = [(cx - 120, mid_y - 40), (cx + 120, mid_y - 40),
               (cx, mid_y + 40), (cx - 120, mid_y - 40)]
    mid_line = [(cx - 120, mid_y), (cx, mid_y + 40), (cx + 120, mid_y)]
    draw2.line(mid_line, fill=(255, 255, 255, 190), width=14)

    # Bottom stroke layer
    bot_y = mid_y + 60
    bot_line = [(cx - 120, bot_y), (cx, bot_y + 40), (cx + 120, bot_y)]
    draw2.line(bot_line, fill=(255, 255, 255, 115), width=14)

    out.save(out_path, "PNG")
    print("✅ Icon saved via PIL:", out_path)
    exit(0)
except Exception as e:
    print("PIL failed:", e)
    exit(1)
