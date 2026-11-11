# Paso 2: selecciona las señales relevantes, genera assets/img/senales/*.webp y assets/js/signs-official.js.
# Uso: python3 tools/build_signs.py carpeta_salida_paso1 .   (requiere: pip install pillow)
# Si cambia la edición del libro, revisa los índices de SEL: dependen del orden de extracción.
import json, sys, os, re, unicodedata
from PIL import Image
src, repo = sys.argv[1], sys.argv[2]
r = json.load(open(f"{src}/catalog.json"))
# índice -> (nombre legible, grupo de confusión)
SEL = {
 'reglamentaria': {0:('Pare','pare'),1:('Ceda el paso','pare'),2:('Pare niños','pare'),3:('No entrar','giro'),4:('No virar a la izquierda','giro'),
  5:('No virar a la derecha','giro'),6:('No virar en U','giro'),7:('No adelantar','pista'),8:('No cambiar de pista','pista'),
  9:('Preferencia a ciclistas al virar a la derecha','pista'),13:('Prohibida la circulación de vehículos de carga','circ'),
  14:('Prohibida la circulación de vehículos motorizados','circ'),16:('Prohibida la circulación de buses','circ'),
  17:('Prohibida la circulación de bicicletas','circ'),18:('Prohibida la circulación de motocicletas','circ'),21:('Silencio (prohibido tocar la bocina)','circ'),
  22:('No bloquear el cruce','est'),23:('Prohibido estacionar y detenerse','est'),24:('Prohibido estacionar','est'),26:('Prohibido el tránsito de peatones','circ'),
  27:('Velocidad máxima','vel'),28:('Velocidad mínima','vel'),29:('Velocidad máxima en zona 30','vel'),31:('Peso máximo permitido','dim'),
  33:('Altura máxima','dim'),35:('Fin de la prohibición o restricción','vel'),39:('Mantenga su derecha','dir'),41:('Dirección obligada','dir'),
  42:('Preferencia al sentido contrario','dir'),43:('Minirrotonda','dir'),44:('Paso obligado por la derecha','dir'),46:('Paso por ambos lados (vértice)','dir'),
  47:('Circulación en ambos sentidos','dir'),49:('Uso obligatorio de cadenas','luz'),50:('Luces encendidas obligatorias','luz'),52:('Vía segregada para buses','circ'),
  58:('Permitido virar a la derecha con luz roja, con precaución','giro')},
 'preventiva': {60:('Curva a la derecha','curva'),61:('Curva a la izquierda','curva'),62:('Curva cerrada a la derecha','curva'),64:('Zona de curvas','curva'),
  66:('Curva y contracurva','curva'),70:('Curva muy cerrada a la derecha','curva'),72:('Pendiente fuerte en bajada','pend'),74:('Proximidad de túnel','pend'),
  75:('Pendiente fuerte en subida','pend'),79:('Viento lateral','pend'),80:('Angostamiento a ambos lados','ancho'),83:('Puente angosto','ancho'),
  84:('Ensanchamiento a ambos lados','ancho'),93:('Resalto','res'),95:('Resaltos sucesivos','res'),96:('Badén','res'),97:('Proyección de gravilla','res'),
  99:('Peligro','res'),101:('Cruce ferroviario a nivel sin barreras','tren'),102:('Cruce ferroviario a nivel con barreras','tren'),103:('Cruz de San Andrés (cruce ferroviario)','tren'),
  104:('Proximidad de rotonda','cruce'),105:('Cruce de caminos','cruce'),114:('Dos sentidos de tránsito','cruce'),115:('Ciclistas en la vía','anim'),
  116:('Maquinaria agrícola en la vía','anim'),118:('Animales en la vía','anim'),120:('Zona de peatones','peat'),121:('Proximidad de paso de cebra','peat'),
  122:('Zona de escuela','peat'),123:('Niños jugando','peat'),124:('Proximidad de semáforo','prox'),125:('Proximidad de señal Ceda el paso','prox'),
  126:('Proximidad de señal Pare','prox'),127:('Cruce de ciclistas','anim'),128:('Zona de derrumbes','res'),129:('Pavimento resbaladizo','res')},
 'informativa': {141:('Aeropuerto','serv'),142:('Restaurante','serv'),145:('Primeros auxilios u hospital','serv'),153:('Salida lateral derecha','auto'),
  154:('Inicio de autopista','auto'),155:('Fin de autopista','auto'),157:('Teléfono de emergencia (SOS)','serv'),159:('Estacionamiento permitido','serv'),
  160:('Plaza de peaje','auto'),163:('Zona de control fotográfico','auto'),169:('Zona 30','ciclo'),170:('Fin de zona 30','ciclo'),171:('Solo bicicletas','ciclo'),
  174:('Fin de ciclovía','ciclo'),175:('Ciclocalle','ciclo')},
 'transitoria': {180:('Fin de trabajos en la vía','obra'),181:('Trabajos en la vía','obra'),182:('Banderero','obra'),191:('Proximidad de desvío','obra')},
}
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')[:48]
out = f"{repo}/assets/img/senales"; os.makedirs(out, exist_ok=True)
data, total = [], 0
for cls, items in SEL.items():
    for i, (name, grp) in items.items():
        s = slug(name); im = Image.open(f"{src}/{r[i]['file']}.png").convert('RGB')
        im.thumbnail((200, 200), Image.LANCZOS)
        p = f"{out}/{s}.webp"; im.save(p, 'WEBP', quality=82, method=6); total += os.path.getsize(p)
        data.append({"id": s, "name": name, "cls": cls, "grp": grp, "src": f"assets/img/senales/{s}.webp", "page": r[i]['page']})
js = ("/* Señales oficiales tomadas del Libro para la Conducción en Chile – Clase B (CONASET, julio 2024),\n"
      "   anexo 'Señales de tránsito verticales'. Reproducidas con la autorización que declara el propio libro.\n"
      "   Fuente: https://mejoresconductores.conaset.cl  (generado por tools/build_signs.py) */\n"
      "self.OFFICIAL_SIGNS = " + json.dumps(data, ensure_ascii=False, indent=0) + ";\n")
open(f"{repo}/assets/js/signs-official.js","w").write(js)
print(len(data), "signs,", round(total/1024), "KB")
