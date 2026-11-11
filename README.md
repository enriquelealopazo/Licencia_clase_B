# Examen Clase B · Simulador teórico

Simulador gratuito del examen teórico de licencia **Clase B** (Chile), enfocado 100 % en practicar el examen.
Sitio estático: no necesita servidor, base de datos ni compilación (build).

## Qué incluye
- **Examen simulado** con el formato del examen real: 35 preguntas, 45 minutos, 3 de doble puntaje (máximo 38) y aprobación con 33 puntos.
  No muestra si acertaste hasta entregar. Puedes marcar preguntas, volver atrás y navegar con el mapa del examen.
- **Mis fallos**: repetición espaciada simple. Una pregunta sale del repaso al acertarla 2 veces seguidas.
- **Señales visuales**: 94 preguntas con las imágenes oficiales de señales del libro CONASET 2024. Las opciones incorrectas son señales parecidas (por ejemplo, curva vs. curva cerrada). Cada examen incluye 5.
- **Catálogo de señales**: 93 señales oficiales por tipo, con modo tarjetas para memorizarlas.
- **Diagramas de situaciones** (ilustraciones propias): cruce sin señales, rotonda, adelantar a un ciclista, estacionar en pendiente y distancia de seguimiento.
- **Áreas débiles**: 15 preguntas de tus 3 áreas con menos aciertos.
- **Ronda rápida**: 10 preguntas con explicación inmediata.
- **Estudio por área**: 16 áreas, cada una con su barra de cobertura y porcentaje de aciertos.
- **Índice de preparación**: promedio de tus últimos 3 exámenes e historial con gráfico.
- Modo claro y oscuro automáticos, atajos de teclado e instalable como app (PWA) con funcionamiento sin conexión.

## Estructura
```
index.html               Pantallas (inicio, pregunta, resultado)
assets/css/app.css       Estilos
assets/js/questions.js   Banco de preguntas (CATS + QUESTIONS)
assets/js/signs-official.js  Datos de las señales oficiales (generado)
assets/js/signs.js       Ilustraciones propias en SVG (diagramas)
assets/img/senales/      Imágenes oficiales de señales (WebP)
tools/                   Scripts para regenerar las señales desde el PDF del libro
assets/js/app.js         Lógica del simulador
sw.js                    Service worker (caché sin conexión)
manifest.webmanifest     Metadatos para instalar como app
```

## Agregar preguntas
En `assets/js/questions.js`, agrega un objeto con un `id` único:
```js
{id:"velocidad-10", cat:"velocidad", q:"Texto", opts:["A","B","C"], correct:1, exp:"Explicación"}
```
Para una pregunta con imagen, usa `img:"<id>"` con el id de una señal de `signs-official.js` o de un diagrama de `signs.js`.
Para mostrar un diagrama solo después de responder (cuando la imagen revelaría la respuesta), usa `fig:"<id>"`.
Después de cambiar archivos, sube `VERSION` en `sw.js` para que los usuarios reciban la versión nueva.

## Publicar
GitHub → Settings → Pages → *Deploy from a branch* → rama y carpeta `/ (root)`.

## Fuentes y derechos
- **Imágenes de señales**: *Libro para la Conducción en Chile – Automovilistas, Licencia Clase B* (CONASET, julio 2024), anexo "Señales de tránsito verticales".
  El libro declara: *"La reproducción, transmisión o el almacenamiento de este texto, incluido el diseño de la portada [...] cuenta con la autorización de la Comisión Nacional de Seguridad de Tránsito."*
  Fuente oficial: https://mejoresconductores.conaset.cl
- **Diagramas de situaciones**: ilustraciones propias.
- **Preguntas**: redacción propia basada en el libro y la Ley 18.290. No reproducen el banco oficial del examen.
- Sitio independiente, sin afiliación con CONASET ni con municipalidades.
