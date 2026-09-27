from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image, ImageDraw

def make_pdf(path, count, label):
    c = canvas.Canvas(path, pagesize=A4)
    for i in range(1, count + 1):
        c.setFont("Helvetica", 18)
        c.drawString(72, 780, f"{label} — page {i}/{count}")
        c.setFont("Helvetica", 10)
        c.drawString(72, 752, "Synthetic nLab PDF Studio 1.0 acceptance fixture")
        c.showPage()
    c.save()

make_pdf("/tmp/pdf-studio-v1.pdf", 12, "Fixture A")
make_pdf("/tmp/pdf-studio-v1-b.pdf", 3, "Fixture B")

img = Image.new("RGBA", (500, 180), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)
draw.line((30, 120, 130, 45, 250, 125, 430, 55), fill=(30, 65, 105, 255), width=8)
img.save("/tmp/pdf-studio-v1-signature.png")

Path("/tmp/pdf-studio-v1-config.json").write_text(json.dumps({
    "schema": "nlab-pdf-studio/v1",
    "variables": {"values": {"INITIALS": "CI", "DATE_A": "2026-09-27"}},
    "naming": {"prefix": "CI_", "template": "{FILENAME}", "suffix": "_TEST"}
}, indent=2))
