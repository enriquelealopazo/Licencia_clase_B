/* Señales de tránsito dibujadas en SVG (sin imágenes externas).
   Representaciones didácticas simplificadas, no planos oficiales. */
(function(){
  const R = '#C8102E', Y = '#F6C21C', K = '#111', W = '#fff', B = '#1E4FA3';
  const svg = (body, label) =>
    `<svg viewBox="0 0 100 100" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const ring = inner => `<circle cx="50" cy="50" r="46" fill="${W}" stroke="${R}" stroke-width="9"/>${inner}`;
  const slash = `<line x1="20" y1="80" x2="80" y2="20" stroke="${R}" stroke-width="8" stroke-linecap="round"/>`;
  const diamond = inner => `<rect x="17" y="17" width="66" height="66" rx="5" transform="rotate(45 50 50)" fill="${Y}" stroke="${K}" stroke-width="3.5"/>${inner}`;
  const car = (x, y, c) => `<g transform="translate(${x} ${y})"><rect x="0" y="6" width="16" height="22" rx="4" fill="${c}"/><rect x="3" y="0" width="10" height="10" rx="3" fill="${c}"/></g>`;
  const kid = (x, s) => `<g transform="translate(${x} 0) scale(${s})" fill="${K}"><circle cx="0" cy="34" r="5"/><path d="M-5 41h10l2 16h-4l-1 14h-4l-1-14h-4z"/></g>`;

  window.SIGNS = {
    pare: svg(`<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="${R}" stroke="${W}" stroke-width="4"/>
      <text x="50" y="60" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="27" fill="${W}" text-anchor="middle">PARE</text>`, 'Señal PARE'),
    ceda: svg(`<polygon points="6,10 94,10 50,92" fill="${W}" stroke="${R}" stroke-width="9" stroke-linejoin="round"/>
      <text x="50" y="34" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="10" fill="${K}" text-anchor="middle">CEDA EL</text>
      <text x="50" y="46" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="10" fill="${K}" text-anchor="middle">PASO</text>`, 'Señal Ceda el paso'),
    noEntrar: svg(`<circle cx="50" cy="50" r="46" fill="${R}"/><rect x="18" y="42" width="64" height="16" rx="2" fill="${W}"/>`, 'Señal No entrar'),
    vel50: svg(ring(`<text x="50" y="63" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="38" fill="${K}" text-anchor="middle">50</text>`), 'Velocidad máxima 50'),
    vel30: svg(ring(`<text x="50" y="63" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="38" fill="${K}" text-anchor="middle">30</text>`), 'Velocidad máxima 30'),
    noAdelantar: svg(ring(`${car(27, 34, R)}${car(56, 34, K)}`), 'No adelantar'),
    noVirarIzq: svg(ring(`<path d="M62 76V48a10 10 0 0 0-10-10H34" fill="none" stroke="${K}" stroke-width="8"/><polygon points="22,38 38,26 38,50" fill="${K}"/>${slash}`), 'No virar a la izquierda'),
    noEstacionar: svg(ring(`<text x="50" y="66" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="44" fill="${K}" text-anchor="middle">E</text>${slash}`), 'No estacionar'),
    curvaDer: svg(diamond(`<path d="M42 72V52q0-14 12-20" fill="none" stroke="${K}" stroke-width="7"/><polygon points="50,24 66,28 56,40" fill="${K}"/>`), 'Curva a la derecha'),
    peatones: svg(diamond(`<g fill="${K}"><circle cx="50" cy="29" r="5.5"/><path d="M46 37h8l5 16-4 1-4-9-2 10 7 15h-5l-6-12-5 12h-5l6-17 1-11-5 6-3-2z"/></g>`), 'Cruce de peatones'),
    escolares: svg(diamond(`${kid(41, 1)}${kid(58, .85)}`), 'Zona de escolares'),
    resalto: svg(diamond(`<path d="M24 62h14q12-16 24 0h14" fill="none" stroke="${K}" stroke-width="6"/>`), 'Resalto'),
    semaforo: svg(diamond(`<rect x="41" y="25" width="18" height="50" rx="4" fill="${K}"/><circle cx="50" cy="35" r="5" fill="${R}"/><circle cx="50" cy="50" r="5" fill="${Y}"/><circle cx="50" cy="65" r="5" fill="#1F9D55"/>`), 'Semáforo adelante'),
    pareAdelante: svg(diamond(`<polygon points="43,30 57,30 67,40 67,54 57,64 43,64 33,54 33,40" fill="${R}"/><text x="50" y="51" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="9" fill="${W}" text-anchor="middle">PARE</text>`), 'Pare adelante'),
    ferrocarril: svg(`<g transform="rotate(35 50 50)"><rect x="12" y="42" width="76" height="16" fill="${W}" stroke="${R}" stroke-width="4"/></g>
      <g transform="rotate(-35 50 50)"><rect x="12" y="42" width="76" height="16" fill="${W}" stroke="${R}" stroke-width="4"/></g>`, 'Cruce ferroviario'),
    hospital: svg(`<rect x="8" y="8" width="84" height="84" rx="8" fill="${B}"/><rect x="24" y="24" width="52" height="52" rx="4" fill="${W}"/>
      <text x="50" y="66" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="40" fill="${R}" text-anchor="middle">H</text>`, 'Hospital')
  };
})();
