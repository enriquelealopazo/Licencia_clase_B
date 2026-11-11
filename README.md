# Examen Clase B · Simulador teórico

Simulador gratuito del examen teórico de licencia **Clase B** (Chile), enfocado 100 % en practicar el examen.
Sitio estático: no necesita servidor, base de datos ni compilación (build).

## Qué incluye
- **Examen simulado** con el formato del examen real: 35 preguntas, 45 minutos, 3 de doble puntaje (máximo 38) y aprobación con 33 puntos.
  No muestra si acertaste hasta entregar. Puedes marcar preguntas, volver atrás y navegar con el mapa del examen.
- **Mis fallos**: repetición espaciada simple. Una pregunta sale del repaso al acertarla 2 veces seguidas.
- **Señales visuales**: reconocimiento de señales dibujadas en SVG.
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
assets/js/signs.js       Señales en SVG
assets/js/app.js         Lógica del simulador
sw.js                    Service worker (caché sin conexión)
manifest.webmanifest     Metadatos para instalar como app
```

## Agregar preguntas
En `assets/js/questions.js`, agrega un objeto con un `id` único:
```js
{id:"velocidad-10", cat:"velocidad", q:"Texto", opts:["A","B","C"], correct:1, exp:"Explicación"}
```
Para una pregunta con imagen, usa `img:"pare"` (claves disponibles en `signs.js`).
Después de cambiar archivos, sube `VERSION` en `sw.js` para que los usuarios reciban la versión nueva.

## Publicar
GitHub → Settings → Pages → *Deploy from a branch* → rama y carpeta `/ (root)`.

## Aviso
Las preguntas son de redacción propia, basadas en el Libro del Nuevo Conductor (CONASET) y la Ley 18.290.
No reproducen el banco oficial del examen ni tienen afiliación con CONASET ni con municipalidades.
