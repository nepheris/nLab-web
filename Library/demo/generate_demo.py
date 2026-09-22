#!/usr/bin/env python3
"""Generate the public nLab synthetic demo corpus.
All records are intentionally synthetic. No real personal data is used.
"""
from pathlib import Path
import argparse, csv, hashlib, io, json, random, shutil, zipfile
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.worksheet.datavalidation import DataValidation

REG = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"]
ITALIC = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", "/usr/share/fonts/truetype/liberation2/LiberationSans-Italic.ttf"]
BOLD = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"]

def find_font(names, size):
    for p in names:
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()

def fnt(which, size):
    return find_font({"reg":REG,"italic":ITALIC,"bold":BOLD}[which], size)

def ensure_dirs(root):
    for d in [
        "demo-input/PDF", "demo-input/OCR", "demo-input/Images", "demo-input/Office",
        "demo-input/Data", "demo-input/Code", "demo-input/QR-Barcode", "demo-input/File-Rename", "demo-input/Zip", "demo-input/Compare/tree-A/docs",
        "demo-input/Compare/tree-A/data", "demo-input/Compare/tree-B/docs",
        "demo-input/Compare/tree-B/data", "demo-output", "docs", "manifests"]:
        (root/d).mkdir(parents=True, exist_ok=True)

def save_svg(path):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="#ffffff"/><rect x="30" y="30" width="840" height="540" rx="24" fill="#f5f7fa" stroke="#1f2933" stroke-width="4"/><circle cx="220" cy="300" r="120" fill="#dbeafe" stroke="#0057b8" stroke-width="8"/><rect x="430" y="190" width="300" height="220" rx="18" fill="#dcfce7" stroke="#15803d" stroke-width="8"/><text x="80" y="90" font-family="Arial" font-size="34" font-weight="700" fill="#1f2933">nLab DEMO SVG</text><text x="80" y="135" font-family="Arial" font-size="22" fill="#52616e">Fichier vectoriel synthetique</text></svg>'
    path.write_text(svg, encoding="utf-8")

def make_text_image(path, *, handwritten=False, angle=0, low_contrast=False, noisy=False, fmt=None):
    W,H=1200,1680
    bg=246 if low_contrast else 255
    img=Image.new("L",(W,H),bg); d=ImageDraw.Draw(img)
    title=fnt("italic" if handwritten else "bold",48)
    body=fnt("italic" if handwritten else "reg",32)
    ink=112 if low_contrast else 28
    d.text((90,80),"nLab OCR DEMO - contenu synthetique",font=title,fill=ink)
    lines=[
        "Reference DEMO-OCR-001",
        "Le renard brun saute au-dessus du chien paresseux.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Montant fictif : 123,45 EUR - Date : 18/09/2026",
        "Contact fictif : demo.user@example.test",
        "Adresse fictive : 10 rue de la Demo, 00000 Ville-Test",
    ]
    y=215; rnd=random.Random(42 if handwritten else 7)
    for line in lines:
        x=90+(rnd.randint(-12,12) if handwritten else 0); yy=y+(rnd.randint(-6,6) if handwritten else 0)
        d.text((x,yy),line,font=body,fill=ink); y+=112 if handwritten else 98
    y+=25; d.rectangle((80,y,1120,y+330),outline=90 if low_contrast else 35,width=2)
    for ry in range(1,4): d.line((80,y+ry*82,1120,y+ry*82),fill=100 if low_contrast else 45,width=2)
    for cx in [300,590,860]: d.line((cx,y,cx,y+330),fill=100 if low_contrast else 45,width=2)
    for xx,txt in zip([105,330,620,890],["ID","Libelle","Valeur","Statut"]): d.text((xx,y+18),txt,font=body,fill=ink)
    for r,row in enumerate([("001","Alpha","10","OK"),("002","Beta","20","TEST"),("003","Gamma","30","OK")]):
        yy=y+82*(r+1)+18
        for xx,txt in zip([105,330,620,890],row): d.text((xx,yy),txt,font=body,fill=ink)
    if noisy:
        noise=Image.effect_noise((W,H),22).convert("L")
        img=Image.blend(img,noise,0.07).filter(ImageFilter.GaussianBlur(0.45))
        dd=ImageDraw.Draw(img); rr=random.Random(3)
        for _ in range(400):
            x,y0=rr.randrange(W),rr.randrange(H); dd.point((x,y0),fill=rr.choice([70,110,160,200]))
    if angle: img=img.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True,fillcolor=255)
    ext=(fmt or path.suffix.lower().lstrip('.')).lower()
    if ext in ("jpg","jpeg"): img.save(path,"JPEG",quality=78,optimize=True)
    else: img.save(path)

def make_images(root):
    out=root/"demo-input/Images"; img=Image.new("RGB",(1000,680),"white"); d=ImageDraw.Draw(img)
    d.rectangle((35,35,965,645),outline="black",width=5); d.text((70,70),"nLab PDF Studio - IMAGE DEMO",font=fnt("bold",44),fill="black")
    d.text((70,140),"Rotation / recadrage / conversion / annotation",font=fnt("reg",28),fill="#334155")
    d.rectangle((140,250,420,520),outline="#0057b8",width=10); d.ellipse((585,245,855,515),outline="#15803d",width=10); d.line((80,590,920,590),fill="#b91c1c",width=8)
    img.save(out/"demo-image-color.png",optimize=True); img.save(out/"demo-image-color.jpg",quality=82,optimize=True); img.save(out/"demo-image-color.webp",quality=82); img.save(out/"demo-image-color.bmp")
    f2=img.copy(); ImageDraw.Draw(f2).text((70,195),"FRAME 2",font=fnt("bold",34),fill="#7c3aed"); img.save(out/"demo-image-anime.gif",save_all=True,append_images=[f2],duration=650,loop=0)
    save_svg(out/"demo-vector.svg"); make_calibration_image(root)


def make_calibration_image(root):
    out=root/"demo-input/Images"
    W,H=1800,1300
    img=Image.new("RGB",(W,H),"white"); d=ImageDraw.Draw(img)
    d.text((80,55),"nLab DEMO - CALIBRATION SCANNER 300 x 150 mm",font=fnt("bold",38),fill="#111827")
    d.text((80,105),"Repères synthétiques destinés au module Mesure & Calibration",font=fnt("reg",24),fill="#475569")
    ox,oy=180,260; pxmm_x=4.6; pxmm_y=4.52
    # rulers
    d.line((ox,oy,ox+int(300*pxmm_x),oy),fill="#111",width=4)
    for mm in range(0,301,10):
        x=ox+int(mm*pxmm_x); h=42 if mm%50==0 else 24
        d.line((x,oy-h,x,oy+h),fill="#111",width=3 if mm%50==0 else 1)
        if mm%50==0: d.text((x-18,oy-82),str(mm),font=fnt("reg",20),fill="#111")
    d.text((ox+560,oy-120),"RÈGLE X : 0–300 mm",font=fnt("bold",24),fill="#0057b8")
    d.line((ox,oy,ox,oy+int(150*pxmm_y)),fill="#111",width=4)
    for mm in range(0,151,10):
        y=oy+int(mm*pxmm_y); w=42 if mm%50==0 else 24
        d.line((ox-w,y,ox+w,y),fill="#111",width=3 if mm%50==0 else 1)
        if mm%50==0: d.text((ox-105,y-12),str(mm),font=fnt("reg",20),fill="#111")
    d.text((40,oy+320),"RÈGLE Y : 0–150 mm",font=fnt("bold",24),fill="#15803d")
    # measurable shapes
    d.rectangle((520,470,1120,870),outline="#0057b8",width=8)
    d.ellipse((1240,500,1540,800),outline="#15803d",width=8)
    d.line((560,1010,1450,930),fill="#b91c1c",width=8)
    d.text((540,890),"Objet synthétique 600 x 400 px",font=fnt("reg",22),fill="#334155")
    img.save(out/"calibration-regles-300x150.png",optimize=True)

def make_code_samples(root):
    out=root/"demo-input/Code"
    (out/"demo-script.js").write_text("""// nLab DATASET DE TEST\\nconst rows=[{id:'TEST-001',label:'Alpha',active:true},{id:'TEST-002',label:'Beta',active:false}];\\nconsole.table(rows);\\n""",encoding="utf-8")
    (out/"demo-script.py").write_text("""# nLab DATASET DE TEST\\nrows=[{'id':'TEST-001','value':12.345},{'id':'TEST-002','value':98.765}]\\nprint(sum(x['value'] for x in rows))\\n""",encoding="utf-8")
    (out/"demo-structure.json").write_text(json.dumps({"dataset":"nLab TEST DATASET","records":[{"id":"TEST-001","nom":"Alpha","tags":["demo","json"],"active":True},{"id":"TEST-002","nom":"Beta","tags":["test"],"active":False}]},ensure_ascii=False,indent=2),encoding="utf-8")

def make_qr_barcode(root):
    out=root/"demo-input/QR-Barcode"
    from reportlab.graphics.barcode import createBarcodeDrawing
    from reportlab.graphics import renderPM, renderSVG
    samples=[
      ("qr-url-public","QR","https://example.com/nlab-demo"),
      ("qr-email-demo","QR","mailto:demo.contact@example.test?subject=nLab%20TEST"),
      ("datamatrix-demo","ECC200DataMatrix","NLAB-DEMO-DATAMATRIX-001"),
      ("code128-demo","Code128","NLAB-TEST-001"),
      ("ean13-demo","EAN13","123456789012")
    ]
    for stem,kind,value in samples:
        dr=createBarcodeDrawing(kind,value=value,humanReadable=True)
        renderPM.drawToFile(dr,str(out/f"{stem}.png"),fmt="PNG")
        renderSVG.drawToFile(dr,str(out/f"{stem}.svg"))
    (out/"payloads.json").write_text(json.dumps([
      {"id":"QR-URL","type":"QR","value":"https://example.com/nlab-demo","note":"URL example réservée"},
      {"id":"QR-MAIL","type":"QR","value":"mailto:demo.contact@example.test","note":"adresse .test fictive"},
      {"id":"DM-001","type":"DataMatrix","value":"NLAB-DEMO-DATAMATRIX-001"},
      {"id":"C128-001","type":"Code128","value":"NLAB-TEST-001"}
    ],ensure_ascii=False,indent=2),encoding="utf-8")

def make_file_samples(root):
    out=root/"demo-input/File-Rename"
    names=["IMG_0001.JPG","IMG_0002.JPG","scan final 01.pdf","facture-test(1).pdf","DATA export.csv","photo meuble bleu.png"]
    for i,n in enumerate(names,1):
        (out/n).write_text(f"nLab TEST FILE {i}\\nNom volontairement varié pour les tests de renommage.\\n",encoding="utf-8")

def make_ocr(root):
    out=root/"demo-input/OCR"
    make_text_image(out/"ocr-imprime-propre.png")
    make_text_image(out/"ocr-imprime-faible-contraste.jpg",low_contrast=True,fmt="jpg")
    make_text_image(out/"ocr-scan-incline-bruite.jpg",angle=2.4,noisy=True,fmt="jpg")
    make_text_image(out/"ocr-pseudo-manuscrit.png",handwritten=True)
    make_text_image(out/"ocr-pseudo-manuscrit-incline.jpg",handwritten=True,angle=-3.0,noisy=True,fmt="jpg")

def make_pdfs(root):
    out=root/"demo-input/PDF"; W,H=A4
    c=canvas.Canvas(str(out/"pdf-texte-actif.pdf"),pagesize=A4)
    for pg in range(1,4):
        c.setFont("Helvetica-Bold",18); c.drawString(55,H-65,f"nLab PDF Studio - texte natif - page {pg}")
        c.setFont("Helvetica",11); c.drawString(55,H-95,"Texte natif selectionnable : surlignage, copie, recherche et comparaison.")
        for i in range(14): c.drawString(55,H-130-i*34,f"DEMO-{pg:02d}-{i+1:02d}  Valeur synthetique {100+pg*10+i}  Statut TEST")
        c.showPage()
    c.save()
    c=canvas.Canvas(str(out/"pdf-multipage-orientations.pdf"),pagesize=A4); c.setFont("Helvetica-Bold",18); c.drawString(55,H-70,"Portrait - page 1"); c.showPage(); LW,LH=landscape(A4); c.setPageSize((LW,LH)); c.drawString(55,LH-70,"Paysage - page 2"); c.showPage(); c.setPageSize(A4); c.drawString(55,H-70,"Portrait - page 3"); c.showPage(); c.save()
    c=canvas.Canvas(str(out/"pdf-formulaire-acroform.pdf"),pagesize=A4); form=c.acroForm; c.setFont("Helvetica-Bold",16); c.drawString(55,H-65,"Formulaire PDF AcroForm - DEMO"); c.setFont("Helvetica",10)
    c.drawString(55,H-105,"Identifiant synthetique :"); form.textfield(name="identifiant_demo",x=190,y=H-118,width=260,height=22,borderWidth=1)
    c.drawString(55,H-150,"Activer option :"); form.checkbox(name="option_demo",x=190,y=H-160,size=14,buttonStyle="check")
    c.drawString(55,H-195,"Categorie :"); form.choice(name="categorie_demo",x=190,y=H-208,width=190,height=22,options=["Option A","Option B","Option C"],value="Option A")
    c.drawString(55,H-245,"Commentaire :"); form.textfield(name="commentaire_demo",x=190,y=H-310,width=300,height=70,borderWidth=1,fieldFlags="multiline"); c.save()
    for src_name,out_name in [("ocr-imprime-propre.png","pdf-scan-image-only-propre.pdf"),("ocr-scan-incline-bruite.jpg","pdf-scan-image-only-incline-bruite.pdf"),("ocr-pseudo-manuscrit.png","pdf-scan-pseudo-manuscrit.pdf")]:
        im=Image.open(root/"demo-input/OCR"/src_name).convert("RGB"); im.save(out/out_name,"PDF",resolution=145)

def make_office(root):
    out=root/"demo-input/Office"; doc=Document(); title=doc.add_heading("nLab - Document Word de demonstration",level=1); title.alignment=WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("Document entierement synthetique. Aucun nom, adresse ou identifiant reel."); doc.add_heading("1. Texte et styles",level=2)
    p=doc.add_paragraph(); r=p.add_run("Gras "); r.bold=True; r=p.add_run("Italique "); r.italic=True; r=p.add_run("Souligne"); r.underline=True
    doc.add_paragraph("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Reference DEMO-DOCX-001."); doc.add_heading("2. Tableau",level=2)
    t=doc.add_table(rows=1,cols=4)
    for i,h in enumerate(["Reference","Date","Valeur","Statut"]): t.rows[0].cells[i].text=h
    for i in range(1,7):
        cells=t.add_row().cells; cells[0].text=f"DEMO-{i:03d}"; cells[1].text=f"2026-09-{i:02d}"; cells[2].text=str(i*12.5); cells[3].text=["Nouveau","En cours","Termine"][i%3]
    doc.add_heading("3. Liste",level=2)
    for v in ["Import DOCX","Conversion PDF","Extraction texte","Tests de styles"]: doc.add_paragraph(v,style="List Bullet")
    doc.save(out/"document-demo.docx")
    (out/"document-demo.rtf").write_text(r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Arial;}} \fs28 nLab RTF DEMO\par \fs22 Contenu synthetique sans donnee personnelle.\par DEMO-RTF-001\par}",encoding="latin-1")
    odt=out/"document-demo.odt"
    content = '<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2"><office:body><office:text><text:h text:outline-level="1">nLab ODT DEMO</text:h><text:p>Contenu synthetique sans donnee personnelle.</text:p><text:p>DEMO-ODT-001</text:p></office:text></office:body></office:document-content>'
    manifest = '<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>'
    with zipfile.ZipFile(odt,"w") as z:
        zi=zipfile.ZipInfo("mimetype"); zi.compress_type=zipfile.ZIP_STORED; z.writestr(zi,"application/vnd.oasis.opendocument.text")
        z.writestr("content.xml",content); z.writestr("META-INF/manifest.xml",manifest)

def make_xlsx(path):
    wb=Workbook(); ws=wb.active; ws.title="Clients"
    ws.append(["Client_ID","Nom","Prenom","Email","Telephone","Ville","Statut","Montant","Date"])
    for i in range(1,31):
        ws.append([
            f"DEMO-C{i:03d}", f"NomDemo{i:03d}", f"PrenomDemo{i:03d}",
            f"client{i:03d}@example.test", f"060000{i:04d}", f"Ville-Test-{(i%5)+1}",
            ["Nouveau","Actif","Archive"][i%3], round(i*17.35,2),
            datetime(2026,9,1+((i-1)%20))
        ])
    for cell in ws[1]:
        cell.font=Font(bold=True,color="FFFFFF")
        cell.fill=PatternFill("solid",fgColor="1F2933")
        cell.alignment=Alignment(horizontal="center")
    for row in ws.iter_rows(min_row=2,max_row=31,min_col=8,max_col=8):
        row[0].number_format='#,##0.00 "EUR"'
    for row in ws.iter_rows(min_row=2,max_row=31,min_col=9,max_col=9):
        row[0].number_format="yyyy-mm-dd"
    widths=[16,16,18,28,16,18,14,14,14]
    for idx,w in enumerate(widths,1):
        ws.column_dimensions[chr(64+idx)].width=w
    ws.freeze_panes="A2"
    tab=Table(displayName="ClientsDemo",ref="A1:I31")
    tab.tableStyleInfo=TableStyleInfo(name="TableStyleMedium2",showRowStripes=True,showFirstColumn=False,showLastColumn=False,showColumnStripes=False)
    ws.add_table(tab)
    dv=DataValidation(type="list",formula1='"Nouveau,Actif,Archive"',allow_blank=True)
    ws.add_data_validation(dv); dv.add("G2:G31")
    rs=wb.create_sheet("Resume")
    rs.append(["Indicateur","Valeur"]); rs.append(["Nombre de clients",30])
    rs.append(["Somme montants",sum(round(i*17.35,2) for i in range(1,31))])
    rs.append(["Date min",datetime(2026,9,1)]); rs.append(["Date max",datetime(2026,9,20)])
    for cell in rs[1]:
        cell.font=Font(bold=True,color="FFFFFF")
        cell.fill=PatternFill("solid",fgColor="0057B8")
    rs["B3"].number_format='#,##0.00 "EUR"'
    rs["B4"].number_format="yyyy-mm-dd"; rs["B5"].number_format="yyyy-mm-dd"
    rs.column_dimensions["A"].width=24; rs.column_dimensions["B"].width=18
    wb.save(path)

def make_data(root):
    out=root/"demo-input/Data"
    colors=[("Rouge","#E53935"),("Bleu","#1E88E5"),("Vert","#43A047"),("Orange","#FB8C00"),("Violet","#8E24AA")]
    public_urls=["https://www.google.com/","https://www.youtube.com/","https://www.lemonde.fr/","https://www.wikipedia.org/","https://www.python.org/"]
    rows=[]
    for i in range(1,41):
        cname,hexv=colors[(i-1)%len(colors)]
        base=Decimal("10.005") + Decimal(i)/Decimal("7")
        rows.append({
          "id_unique":f"TEST-{i:04d}",
          "cle_non_unique":f"GROUPE-{(i%5)+1}",
          "nom":f"NomTest{i:03d}",
          "prenom":f"PrenomTest{i:03d}",
          "couleur_nom":cname,
          "couleur_hex":hexv,
          "categorie":["A","B","C"][i%3],
          "liste_tags":"demo|test|"+(["alpha","beta","gamma"][i%3]),
          "variable_discrete":i%7,
          "variable_continue":round(3.14159*i/7,5),
          "pourcentage":round(((i*7)%101)/100,4),
          "montant_ht":float(base.quantize(Decimal("0.001"))),
          "tva":0.20,
          "montant_ttc":float((base*Decimal("1.20")).quantize(Decimal("0.001"))),
          "arrondi_2_dec":float((base*Decimal("1.20")).quantize(Decimal("0.01"),rounding=ROUND_HALF_UP)),
          "telephone":f"+33 6 00 00 {i:02d} {((i*3)%100):02d}",
          "siret_test_invalide":f"9999999999{i:04d}"[-14:],
          "email_standard":f"utilisateur{i:03d}@example.test",
          "email_plus":f"prenom.nom+tag{i:03d}@example.test",
          "email_sous_domaine":f"contact{i:03d}@demo.example.com",
          "url_publique":public_urls[(i-1)%len(public_urls)],
          "image_url":"../../Library/demo/demo-input/Images/demo-image-color.png",
          "adresse":f"{i} rue du Dataset de Test",
          "code_postal":"00000",
          "ville":f"Ville-Test-{(i%5)+1}",
          "booleen":bool(i%2),
          "date":f"2026-09-{((i-1)%22)+1:02d}",
          "datetime":f"2026-09-{((i-1)%22)+1:02d}T{(8+i)%24:02d}:15:00+02:00",
          "texte_court":"Lorem ipsum dolor sit amet.",
          "texte_long":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dataset synthétique nLab destiné aux tests de tri, filtre, recherche, affichage et export.",
          "nullable":None if i%6==0 else f"VAL-{i:02d}"
        })
    headers=list(rows[0].keys())
    with open(out/"dataset-mixte-test.csv","w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=headers); w.writeheader(); w.writerows(rows)
    (out/"dataset-mixte-test.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
    (out/"dataset-mixte-test.ndjson").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in rows)+"\n",encoding="utf-8")
    with open(out/"clients-demo.csv","w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=headers); w.writeheader(); w.writerows(rows[:15])
    (out/"clients-demo.json").write_text(json.dumps(rows[:15],ensure_ascii=False,indent=2),encoding="utf-8")
    (out/"clients-demo.ndjson").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in rows[:15])+"\n",encoding="utf-8")
    (out/"clients-demo.yaml").write_text("dataset: nLab-TEST-DATASET\nrecords:\n"+"".join(f"  - id_unique: {r['id_unique']}\n    nom: {r['nom']}\n    categorie: {r['categorie']}\n" for r in rows[:6]),encoding="utf-8")
    xml=['<?xml version="1.0" encoding="UTF-8"?>','<records dataset="nLab-TEST-DATASET">']
    for r in rows[:8]: xml += [f'  <record id="{r["id_unique"]}">',f'    <nom>{r["nom"]}</nom>',f'    <categorie>{r["categorie"]}</categorie>','  </record>']
    xml.append('</records>'); (out/"clients-demo.xml").write_text("\n".join(xml),encoding="utf-8")
    (out/"notes-demo.txt").write_text("nLab TEST DATASET\n100 % synthétique.\nLorem ipsum dolor sit amet.\n",encoding="utf-8")
    wb=Workbook(); ws=wb.active; ws.title="Dataset mixte"
    ws.append(headers)
    for r in rows: ws.append([r[h] for h in headers])
    for cell in ws[1]:
        cell.font=Font(bold=True,color="FFFFFF"); cell.fill=PatternFill("solid",fgColor="1F2933")
    ws.freeze_panes="A2"; ws.auto_filter.ref=ws.dimensions
    col={h:i+1 for i,h in enumerate(headers)}
    for rr in range(2,2+len(rows)):
        ws.cell(rr,col["pourcentage"]).number_format="0.00%"
        for h in ["montant_ht","montant_ttc","arrondi_2_dec"]:
            ws.cell(rr,col[h]).number_format='#,##0.00 "EUR"'
        ws.cell(rr,col["url_publique"]).hyperlink=ws.cell(rr,col["url_publique"]).value; ws.cell(rr,col["url_publique"]).style="Hyperlink"
        ws.cell(rr,col["image_url"]).hyperlink=ws.cell(rr,col["image_url"]).value; ws.cell(rr,col["image_url"]).style="Hyperlink"
    wb.save(out/"dataset-mixte-test.xlsx")
def make_compare(root):
    a=root/"demo-input/Compare/tree-A"; b=root/"demo-input/Compare/tree-B"
    (a/"docs/commun.txt").write_text("Meme contenu dans A et B.\n",encoding="utf-8"); (b/"docs/commun.txt").write_text("Meme contenu dans A et B.\n",encoding="utf-8")
    (a/"docs/modifie.txt").write_text("Version A - contenu initial.\n",encoding="utf-8"); (b/"docs/modifie.txt").write_text("Version B - contenu modifie.\n",encoding="utf-8")
    (a/"docs/seulement-A.txt").write_text("Present uniquement dans A.\n",encoding="utf-8"); (b/"docs/seulement-B.txt").write_text("Present uniquement dans B.\n",encoding="utf-8")
    (a/"data/liste.csv").write_text("id,valeur\n1,10\n2,20\n",encoding="utf-8"); (b/"data/liste.csv").write_text("id,valeur\n1,10\n2,21\n",encoding="utf-8")

def make_nested_zip(root):
    out=root/"demo-input/Zip/archive-imbriquee-demo.zip"; tiny=io.BytesIO(); Image.new("RGB",(320,180),"white").save(tiny,"PNG")
    with zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED) as z:
        z.writestr("sous-dossier/readme.txt","Archive imbriquee de demonstration.\n"); z.writestr("sous-dossier/data.json",json.dumps({"demo":True,"id":"DEMO-ZIP-001"},indent=2)); z.writestr("racine.csv","cle,valeur\nalpha,1\nbeta,2\n"); z.writestr("sous-dossier/image-demo.png",tiny.getvalue())

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for ch in iter(lambda:f.read(1024*1024),b""): h.update(ch)
    return h.hexdigest()

def make_docs(root):
    (root/"demo-output/README.txt").write_text("Dossier de sortie logique de demonstration. Sur le web, les resultats utilisent les Telechargements du navigateur. Le navigateur ne peut pas imposer silencieusement un dossier local precis.\n",encoding="utf-8")
    (root/"README-DEMO.md").write_text("# nLab DEMO CORPUS v2\n\nJeu de fichiers 100 % synthetiques destine aux tests de nLab PDF Studio et des autres applications nLab.\n\n- demo-input/ : corpus a charger ;\n- demo-output/ : destination logique ;\n- docs/expected-results.json : cas de test.\n",encoding="utf-8")
    expected={"schema":"nlab-demo-corpus/v2","version":"2.0","privacy":"100% synthetic","defaultOutputMode":"browser-downloads","tests":[{"file":"demo-input/PDF/pdf-texte-actif.pdf","expect":"native text selectable"},{"file":"demo-input/PDF/pdf-formulaire-acroform.pdf","expect":"detect/fill/flatten form fields"},{"file":"demo-input/PDF/pdf-scan-image-only-incline-bruite.pdf","expect":"OCR challenge; no native text"},{"file":"demo-input/OCR/ocr-pseudo-manuscrit.png","expect":"handwriting-like OCR challenge"},{"file":"demo-input/Images/demo-image-color.webp","expect":"open image; rotate; convert to PDF"},{"file":"demo-input/Zip/archive-imbriquee-demo.zip","expect":"nested ZIP expansion test"}]}
    (root/"docs/expected-results.json").write_text(json.dumps(expected,ensure_ascii=False,indent=2),encoding="utf-8")


def make_studio_manifests(output_dir, work, catalog):
    groups={
      "pdf":{"label":"PDF Studio","include":["demo-input/PDF/","demo-input/OCR/","demo-input/Images/","demo-input/Office/","demo-input/Zip/"]},
      "image":{"label":"Image Studio","include":["demo-input/Images/"],"scenarios":["rotation","mirror","resize","format-conversion","calibration-x-y","measurement"]},
      "ocr":{"label":"OCR Studio","include":["demo-input/OCR/","demo-input/PDF/pdf-scan-"],"scenarios":["clean-print","low-contrast","deskew","noisy-scan","pseudo-handwriting"]},
      "code-json":{"label":"Code + JSON Studios","include":["demo-input/Code/","demo-input/Data/dataset-mixte-test.json","demo-input/Data/dataset-mixte-test.ndjson"]},
      "data":{"label":"Data Studio","include":["demo-input/Data/"],"scenarios":["types","unique-vs-nonunique","nulls","currency-rounding","percentages","urls","emails","phones","synthetic-siret","images-in-table"]},
      "qr-barcode":{"label":"QR & Barcode Studio","include":["demo-input/QR-Barcode/"]},
      "file":{"label":"File Studio","include":["demo-input/File-Rename/","demo-input/Compare/","demo-input/Zip/"],"demoNames":["IMG_0001.JPG","IMG_0002.JPG","scan final 01.pdf","facture-test(1).pdf","DATA export.csv","photo meuble bleu.png"]}
    }
    idx={"schema":"nlab-demo-manifest-index/v1","version":"3.0","manifests":[]}
    for key,g in groups.items():
        selected=[x for x in catalog if any(x["path"].startswith(p) for p in g["include"])]
        zipname=f"nLab-DEMO-{key}-v3.zip"
        with zipfile.ZipFile(output_dir/zipname,"w",zipfile.ZIP_DEFLATED,compresslevel=7) as z:
            for rec in selected:
                p=work/rec["path"]
                if p.exists(): z.write(p,rec["path"])
        m={"schema":"nlab-studio-demo/v1","version":"3.0","studio":key,"label":g["label"],"privacy":"synthetic-only","archive":f"../{zipname}","files":[x["path"] for x in selected],"catalogCount":len(selected),"scenarios":g.get("scenarios",[])}
        if "demoNames" in g:m["demoNames"]=g["demoNames"]
        (output_dir/"manifests"/f"{key}.json").write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
        idx["manifests"].append({"studio":key,"label":g["label"],"href":f"{key}.json","archive":f"../{zipname}"})
    (output_dir/"manifests"/"index.json").write_text(json.dumps(idx,ensure_ascii=False,indent=2),encoding="utf-8")

def build(output_dir):
    output_dir=Path(output_dir); output_dir.mkdir(parents=True,exist_ok=True); work=output_dir/"_build-demo-v2"
    if work.exists(): shutil.rmtree(work)
    ensure_dirs(work); make_images(work); make_ocr(work); make_pdfs(work); make_office(work); make_data(work); make_code_samples(work); make_qr_barcode(work); make_file_samples(work); make_compare(work); make_nested_zip(work); make_docs(work)
    files=[p for p in sorted(work.rglob("*")) if p.is_file()]
    catalog=[]
    for p in files:
        rel=p.relative_to(work).as_posix(); cat=(rel.split('/')[1] if rel.startswith('demo-input/') else ('Output' if rel.startswith('demo-output/') else 'Documentation'))
        catalog.append({"path":rel,"category":cat,"size":p.stat().st_size,"sha256":sha256(p)})
    archive=output_dir/"nLab-DEMO-CORPUS-v2.zip"
    if archive.exists(): archive.unlink()
    with zipfile.ZipFile(archive,"w",zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for p in files: z.write(p,p.relative_to(work).as_posix())
    manifest={"schema":"nlab-demo-manifest/v3","version":"3.0","label":"nLab DEMO CORPUS v3","privacy":"synthetic-only","archive":"../../Library/demo/nLab-DEMO-CORPUS-v2.zip","loadRoot":"demo-input/","pdfStudioExtensions":["pdf","png","jpg","jpeg","webp","gif","bmp","docx","zip"],"defaultOutputMode":"download","fileCount":len(files),"catalog":"../../Library/demo/demo-catalog-v2.json"}
    (output_dir/"demo-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    (output_dir/"demo-catalog-v2.json").write_text(json.dumps({"version":"3.0","files":catalog},ensure_ascii=False,indent=2),encoding="utf-8")\n    make_studio_manifests(output_dir, work, catalog)
    # Expose generated synthetic files for the web preview and Studio-specific demo packs.
    for name in ["demo-input","demo-output","docs"]:
        target=output_dir/name
        if target.exists(): shutil.rmtree(target)
        shutil.copytree(work/name,target)
    shutil.rmtree(work)
    print(f"Generated {archive} ({archive.stat().st_size} bytes, {len(files)} files)")

if __name__ == "__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--output",default="Library/demo"); args=ap.parse_args(); build(args.output)
