# Paso 1: recorta cada señal del anexo "Señales de tránsito verticales" (págs. 150-160) del
# Libro para la Conducción en Chile – Clase B (CONASET 2024) junto a su nombre oficial.
# Uso: python3 tools/extract_signs.py libro.pdf carpeta_salida   (requiere: pip install pymupdf)
import pymupdf, sys, json, os
doc = pymupdf.open(sys.argv[1]); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
res = []
for pno in range(150, 161):
    p = doc[pno-1]
    words = p.get_text("words")
    boxes = [pymupdf.Rect(i['bbox']) for i in p.get_image_info()]
    boxes = [b for b in boxes if 30 < b.width < 160 and 30 < b.height < 160]
    # dedupe
    uniq = []
    for b in boxes:
        if not any(abs(b.x0-u.x0)<3 and abs(b.y0-u.y0)<3 for u in uniq): uniq.append(b)
    for b in sorted(uniq, key=lambda r:(round(r.y0/20), r.x0)):
        below = [u.y0 for u in uniq if u.y0 > b.y1 and abs(u.x0-b.x0) < 60]
        lim = min(below + [b.y1 + 48])
        cap = [w for w in words if b.x0-14 <= (w[0]+w[2])/2 <= b.x1+14 and b.y1-2 <= w[1] < lim-2]
        cap.sort(key=lambda w:(round(w[1]), w[0]))
        text = " ".join(w[4] for w in cap).strip()
        name = f"p{pno}_{int(b.x0)}_{int(b.y0)}"
        pix = p.get_pixmap(clip=b, matrix=pymupdf.Matrix(3.2,3.2), alpha=False)
        pix.save(f"{out}/{name}.png")
        res.append({"file": name, "page": pno, "caption": text, "w": round(b.width), "h": round(b.height)})
json.dump(res, open(f"{out}/catalog.json","w"), ensure_ascii=False, indent=1)
print(len(res))
