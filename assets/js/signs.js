/* Ilustraciones propias en SVG: la señal de 30 km/h (no incluida en el catálogo oficial)
   y diagramas de situaciones. Las señales oficiales están en signs-official.js. */
(function(){
  const R = '#C8102E', K = '#111', W = '#fff';
  const svg = (body, label) =>
    `<svg viewBox="0 0 100 100" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const ring = inner => `<circle cx="50" cy="50" r="46" fill="${W}" stroke="${R}" stroke-width="9"/>${inner}`;

  window.SIGNS = {
    vel30: svg(ring(`<text x="50" y="63" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="38" fill="${K}" text-anchor="middle">30</text>`), 'Velocidad máxima 30')
  };

  /* ---------- Diagramas de situaciones (ilustraciones propias) ---------- */
  const dia = (body, label) =>
    `<svg class="dia" viewBox="0 0 240 150" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><clipPath id="dclip"><rect width="240" height="150" rx="10"/></clipPath><g clip-path="url(#dclip)"><rect width="240" height="150" fill="#8FB573"/>${body}</g></svg>`;
  const auto = (x, y, rot, c, t) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-9" y="-15" width="18" height="30" rx="5" fill="${c}" stroke="#111" stroke-width="1.2"/><rect x="-6.5" y="-9" width="13" height="7" rx="2" fill="#cfe3f5"/>${t ? `<text x="0" y="10" font-family="Arial" font-weight="700" font-size="9" fill="#fff" text-anchor="middle" transform="rotate(${-rot} 0 6)">${t}</text>` : ''}</g>`;
  const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="2" stroke-dasharray="8 7"/>`;
  const arrow = (d, c = '#111') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.5" marker-end="url(#ah)"/>`;
  const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#111"/></marker></defs>`;
  const ASF = '#5B6068';

  Object.assign(window.SIGNS, {
    dia_cruce: dia(`${defs}<rect x="95" y="0" width="50" height="150" fill="${ASF}"/><rect x="0" y="50" width="240" height="50" fill="${ASF}"/>
      ${dash(120,0,120,46)}${dash(120,104,120,150)}${dash(0,75,91,75)}${dash(149,75,240,75)}
      ${auto(132,122,0,'#2563EB','A')}${arrow('M132 104 V88')}
      ${auto(170,63,-90,'#DC2626','B')}${arrow('M152 63 H138')}
      <rect width="240" height="24" fill="#fff" fill-opacity=".9"/><text x="8" y="16" font-family="Arial" font-size="11" font-weight="700" fill="#111">Cruce sin señales ni semáforo</text>`, 'Diagrama: dos autos llegan a la vez a un cruce sin señales; A viene desde abajo y B desde la derecha de A'),
    dia_rotonda: dia(`${defs}<rect x="0" y="52" width="240" height="46" fill="${ASF}"/><rect x="97" y="0" width="46" height="150" fill="${ASF}"/>
      <circle cx="120" cy="75" r="52" fill="${ASF}"/><circle cx="120" cy="75" r="22" fill="#8FB573" stroke="#fff" stroke-width="2"/>
      <circle cx="120" cy="75" r="37" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 6"/>
      ${auto(156,64,-20,'#DC2626','B')}${arrow('M150 44 Q138 36 124 36')}
      ${auto(131,138,0,'#2563EB','A')}${arrow('M131 122 V112')}
      <rect width="240" height="24" fill="#fff" fill-opacity=".9"/><text x="8" y="16" font-family="Arial" font-size="11" font-weight="700" fill="#111">A quiere entrar · B ya circula</text>`, 'Diagrama: auto A esperando entrar a una rotonda y auto B circulando dentro de ella'),
    dia_ciclista: dia(`${defs}<rect x="0" y="30" width="240" height="90" fill="${ASF}"/>${dash(0,75,240,75)}<rect x="0" y="118" width="240" height="6" fill="#BDBDBD"/>
      <g transform="translate(150 104)"><circle cx="-8" cy="4" r="6" fill="none" stroke="#FACC15" stroke-width="2.2"/><circle cx="8" cy="4" r="6" fill="none" stroke="#FACC15" stroke-width="2.2"/><path d="M-8 4L0 -6 8 4M0 -6V-12" stroke="#FACC15" stroke-width="2.2" fill="none"/><circle cx="0" cy="-16" r="3.5" fill="#FACC15"/></g>
      ${auto(120,62,90,'#2563EB','')}
      <path d="M118 77V96" stroke="#fff" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/><rect x="74" y="80" width="40" height="15" rx="3" fill="#111"/><text x="94" y="91" font-family="Arial" font-weight="700" font-size="10" fill="#FACC15" text-anchor="middle">1,5 m</text>
      <rect width="240" height="24" fill="#fff" fill-opacity=".9"/><text x="8" y="16" font-family="Arial" font-size="11" font-weight="700" fill="#111">Adelantar a un ciclista: mínimo 1,5 m</text>`, 'Diagrama: auto adelantando a un ciclista con una separación lateral de 1,5 metros'),
    dia_pendiente: dia(`${defs}<path d="M0 40 L240 120 V150 H0z" fill="${ASF}"/><path d="M0 40 L240 120" stroke="#BDBDBD" stroke-width="5"/>
      <g transform="translate(120 98) rotate(18.4)"><rect x="-28" y="-14" width="56" height="20" rx="6" fill="#2563EB" stroke="#111"/><rect x="-12" y="-26" width="28" height="14" rx="4" fill="#2563EB" stroke="#111"/><circle cx="-16" cy="7" r="7" fill="#111"/><circle cx="16" cy="7" r="7" fill="#111"/></g>
      <g transform="translate(200 64)"><rect x="-26" y="-22" width="52" height="46" rx="6" fill="#fff" stroke="#111"/><line x1="18" y1="-22" x2="18" y2="24" stroke="#888" stroke-width="4"/><rect x="-6" y="-6" width="7" height="14" rx="2" fill="#111" transform="rotate(30 -2 1)"/><text x="-4" y="-13" font-family="Arial" font-size="6.5" fill="#111" text-anchor="middle">vista superior</text><text x="-4" y="19" font-family="Arial" font-size="7" fill="#111" text-anchor="middle">→ vereda</text></g>
      <rect width="240" height="24" fill="#fff" fill-opacity=".9"/><text x="8" y="16" font-family="Arial" font-size="11" font-weight="700" fill="#111">Cuesta abajo: ruedas hacia la vereda</text>`, 'Diagrama: auto estacionado en bajada con las ruedas delanteras giradas hacia la vereda'),
    dia_distancia: dia(`${defs}<rect x="0" y="50" width="240" height="56" fill="${ASF}"/>${dash(0,78,240,78)}
      <rect x="150" y="34" width="5" height="22" fill="#111"/>${auto(182,66,90,'#DC2626','')}${auto(52,66,90,'#2563EB','')}
      <path d="M68 92 H150" stroke="#FACC15" stroke-width="2" marker-end="url(#ah)"/><text x="108" y="124" font-family="Arial" font-weight="700" font-size="11" fill="#111" text-anchor="middle">Desde el poste: "mil uno, mil dos…"</text>
      <rect width="240" height="24" fill="#fff" fill-opacity=".9"/><text x="8" y="16" font-family="Arial" font-size="11" font-weight="700" fill="#111">Distancia segura: 2 a 3 segundos</text>`, 'Diagrama: regla de los 2 a 3 segundos de distancia usando un poste como referencia')
  });
})();
