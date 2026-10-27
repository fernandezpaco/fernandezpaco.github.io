// Canalitos — quiz de 3 preguntas entre vídeo y vídeo (10 en la pestaña Quiz). Lo usan index.html y la página de prueba.
// Las preguntas se montan con los datos de preguntas.json (los genera server/scripts/canalitos_preguntas.py);
// las multiplicaciones y las restas, aquí mismo.
'use strict';
window.Quiz = (() => {
  const TEMAS = ['banderas', 'capitales', 'multiplicaciones', 'restas', 'rascacielos', 'futbol', 'coches'];
  const K_QUIZ = 'canalitos.quiz';   // tema que toca y preguntas ya salidas, para no repetirlas
  const TXT = {
    en: {
      temas: { banderas: 'Flags', capitales: 'Capitals', multiplicaciones: 'Times tables', restas: 'Subtraction', rascacielos: 'Skyscrapers', futbol: 'Soccer', coches: 'Car brands' },
      bandera: 'Which country has this flag?',
      capital: p => `What is the capital of ${p}?`,
      mult: (a, b) => [`What is ${a} × ${b}?`, `What is ${a} times ${b}?`],
      resta: (a, b) => [`What is ${a} − ${b}?`, `What is ${a} minus ${b}?`],
      edificio: 'Which building is this?',
      ciudad: 'In which city is it?',
      deDonde: () => 'Which country is this player from?',
      quien: () => 'Who is this player?',
      estadio: 'Which team plays at this stadium?',
      marca: 'Which brand makes this car?',
      marcaPais: m => `Which country is ${m} from?`,
      bien: ['Great!', 'Well done!', 'Yes!', 'Brilliant!'],
      mal: 'Try again!',
      fin: n => ['Good try!', 'Well done!', 'Great job!', 'Perfect!'][n],
      de: (a, n) => `${a} out of ${n}`,
      seguir: 'Watch the video',
      leer: 'Read it again',
      voz: 'en-GB',
    },
    es: {
      temas: { banderas: 'Banderas', capitales: 'Capitales', multiplicaciones: 'Multiplicaciones', restas: 'Restas', rascacielos: 'Rascacielos', futbol: 'Fútbol', coches: 'Marcas de coches' },
      bandera: '¿De qué país es esta bandera?',
      capital: p => `¿Cuál es la capital de ${p}?`,
      mult: (a, b) => [`¿Cuánto es ${a} × ${b}?`, `¿Cuánto es ${a} por ${b}?`],
      resta: (a, b) => [`¿Cuánto es ${a} − ${b}?`, `¿Cuánto es ${a} menos ${b}?`],
      edificio: '¿Qué edificio es este?',
      ciudad: '¿En qué ciudad está?',
      deDonde: m => m ? '¿De qué país es esta jugadora?' : '¿De qué país es este jugador?',
      quien: m => m ? '¿Quién es esta jugadora?' : '¿Quién es este jugador?',
      estadio: '¿Qué equipo juega en este estadio?',
      marca: '¿De qué marca es este coche?',
      marcaPais: m => `¿De qué país es la marca ${m}?`,
      bien: ['¡Muy bien!', '¡Genial!', '¡Sí!', '¡Bravo!'],
      mal: '¡Prueba otra vez!',
      fin: n => ['¡Buen intento!', '¡Bien hecho!', '¡Muy bien!', '¡Perfecto!'][n],
      de: (a, n) => `${a} de ${n}`,
      seguir: 'Ver el vídeo',
      leer: 'Leer otra vez',
      voz: 'es-ES',
    },
  };
  const VOZ = '<svg viewBox="0 0 24 24"><path d="M3.5 9h4l5-4v14l-5-4h-4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  const lee = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const guarda = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  function azar(xs) {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function el(tag, props, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'svg') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const h of hijos) if (h != null && h !== false) n.append(h);
    return n;
  }

  // La buena y dos falsas distintas, en orden al azar
  function elige(buena, todas) {
    const falsas = azar(new Set(todas)).filter(x => x && x !== buena).slice(0, 2);
    return { buena, opciones: azar([buena, ...falsas]) };
  }
  // La multiplicación dibujada: a filas de b puntos
  function puntos(a, b) {
    const ns = 'http://www.w3.org/2000/svg', c = 26, svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${b * c} ${a * c}`);
    svg.style.maxWidth = b * 34 + 'px';   // que 2 × 1 no salga con puntos enormes
    svg.style.maxHeight = a * 34 + 'px';
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
      const p = document.createElementNS(ns, 'circle');
      p.setAttribute('cx', j * c + c / 2);
      p.setAttribute('cy', i * c + c / 2);
      p.setAttribute('r', 9);
      if (i % 2) p.setAttribute('class', 'otra');
      svg.append(p);
    }
    return svg;
  }

  // Restas llevando, de 2 y 3 cifras: el número de cifras de cada uno y que al menos una columna obligue a llevar
  const TIPOS_RESTA = [[2, 2], [3, 2], [3, 3]];
  const cifras = n => String(n).split('').reverse().map(Number);   // las unidades primero
  const entre = (lo, hi) => lo + (Math.random() * (hi - lo + 1) | 0);
  function resta([ca, cb]) {
    for (;;) {
      const a = entre(ca === cb ? 2 * 10 ** (ca - 1) : 10 ** (ca - 1), 10 ** ca - 1);
      const b = entre(10 ** (cb - 1), Math.min(10 ** cb - 1, a - 2));
      const x = cifras(a), y = cifras(b);
      if (y.some((d, k) => d > x[k])) return [a, b];
    }
  }
  // Las falsas salen de los errores de verdad: restar en cada columna la cifra pequeña de la grande (sin llevar),
  // o llevar y no devolverlo (10 o 100 de más); y si no, ±1 o ±10
  function eligeResta(a, b) {
    const r = a - b, x = cifras(a), y = cifras(b), tope = 10 ** String(a).length;
    const sinLlevar = +x.map((d, k) => Math.abs(d - (y[k] || 0))).reverse().join('');
    const malas = [...new Set([sinLlevar, r + 10, r + 100, r - 10, r + 1, r - 1])].filter(n => n > 0 && n < tope && n !== r);
    const falsas = malas[0] === sinLlevar ? [sinLlevar, azar(malas.slice(1))[0]] : azar(malas).slice(0, 2);
    return { buena: String(r), opciones: azar([r, ...falsas]).map(String) };
  }
  // La cuenta en columna, como en el cuaderno
  function columna(a, b) {
    return el('div', { class: 'qz-resta', 'aria-hidden': 'true' },
      el('span'), el('span', {}, String(a)),
      el('span', { class: 'signo' }, '−'), el('span', {}, String(b)),
      el('i'),
      el('span'), el('span', { class: 'hueco' }, '?'));
  }

  // Todas las preguntas posibles de un tema: una clave (para no repetirlas) y cómo montarla
  function catalogo(tema, d, L, tabla) {
    const t = TXT[L];
    const nom = x => x[L], cap = p => L === 'en' ? p.capEn : p.capEs;
    const pais = iso => (d.paises.find(p => p.iso === iso) || d.selecciones[iso] || {})[L] || iso;
    const ciudad = e => L === 'en' ? e.ciudadEn : e.ciudadEs, equipo = s => L === 'en' ? s.equipoEn : s.equipoEs;
    const bandera = iso => (d.banderas || 'https://flagcdn.com/{iso}.svg').replace('{iso}', iso);
    switch (tema) {
      case 'banderas':
        return d.paises.map(p => ({ k: 'b-' + p.iso, crea: () => ({ texto: t.bandera, img: bandera(p.iso), bandera: true, ...elige(nom(p), d.paises.map(nom)) }) }));
      case 'capitales':
        return d.paises.map(p => ({ k: 'c-' + p.iso, crea: () => ({ texto: t.capital(nom(p)), img: p.img, ...elige(cap(p), d.paises.map(cap)) }) }));
      case 'multiplicaciones': {
        const out = [];
        for (let a = 1; a <= tabla; a++) for (let b = 1; b <= tabla; b++) out.push({ k: `m-${a}x${b}`, crea: () => {
          const [texto, dice] = t.mult(a, b), r = a * b;
          const cerca = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, r + 1, r - 1, r + 2, r + 10].filter(n => n > 0 && n !== r);
          return { texto, dice, svg: puntos(a, b), ...elige(String(r), cerca.map(String)) };
        } });
        return out;
      }
      // La cuenta sale al azar cada vez; las 120 claves solo reparten por igual los tres tipos
      case 'restas':
        return TIPOS_RESTA.flatMap(tipo => Array.from({ length: 40 }, (_, i) => ({ k: `r-${tipo.join('')}-${i}`, crea: () => {
          const [a, b] = resta(tipo), [texto, dice] = t.resta(a, b);
          return { texto, dice, svg: columna(a, b), ...eligeResta(a, b) };
        } })));
      case 'rascacielos':
        return d.edificios.flatMap((e, i) => [
          // Sin edificios de la misma ciudad entre las falsas: la foto puede sacar a los vecinos
          { k: 'e-' + i, crea: () => ({ texto: t.edificio, img: e.img, ...elige(nom(e), d.edificios.filter(x => x.ciudadEn !== e.ciudadEn).map(nom)) }) },
          { k: 'ec-' + i, crea: () => ({ texto: t.ciudad, pie: nom(e), img: e.img, ...elige(ciudad(e), d.edificios.map(ciudad)) }) },
        ]);
      case 'futbol':
        return [
          ...d.jugadores.map((j, i) => ({ k: 'j-' + i, crea: () => ({ texto: t.deDonde(j.mujer), pie: j.nombre, img: j.img, ...elige(pais(j.pais), d.jugadores.map(x => pais(x.pais))) }) })),
          ...d.jugadores.flatMap((j, i) => j.top ? [{ k: 'q-' + i, crea: () => ({ texto: t.quien(j.mujer), img: j.img,
            ...elige(j.nombre, d.jugadores.filter(x => !x.mujer === !j.mujer && (x.top || x.mujer)).map(x => x.nombre)) }) }] : []),
          ...d.estadios.map((s, i) => ({ k: 's-' + i, crea: () => ({ texto: t.estadio, pie: nom(s), img: s.img, ...elige(equipo(s), d.estadios.map(equipo)) }) })),
        ];
      case 'coches':
        return [
          ...d.coches.map((c, i) => ({ k: 'co-' + i, crea: () => ({ texto: t.marca, img: c.img, ...elige(c.marca, Object.keys(d.marcas)) }) })),
          ...Object.keys(d.marcas).map(m => ({ k: 'ma-' + m, crea: () => {
            const c = azar(d.coches.filter(x => x.marca === m))[0] || {};
            return { texto: t.marcaPais(m), pie: c.modelo, img: c.img, ...elige(pais(d.marcas[m]), Object.values(d.marcas).map(pais)) };
          } })),
        ];
    }
    return [];
  }

  let datos = null, siguiente = null, alAcabar = null, temporizador = null, audio = null;

  async function carga(url) {
    if (!datos) datos = await fetch(url).then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)));
    return datos;
  }
  const cuantas = (tema, tabla) => datos ? catalogo(tema, datos, 'en', tabla).length : 0;

  // El tema que toca (van por turnos) y `o.n` preguntas (3 si no se dice) que no hayan salido; cuando se acaban,
  // vuelta a empezar
  function monta(o) {
    const activos = TEMAS.filter(t => o.temas.includes(t)), n = o.n || 3;
    if (!datos || !activos.length) return null;
    const st = Object.assign({ turno: 0, vistas: {} }, lee(K_QUIZ, {}));
    const tema = activos[st.turno % activos.length], todas = catalogo(tema, datos, o.idioma, o.tabla);
    let vistas = new Set(st.vistas[tema] || []), libres = todas.filter(x => !vistas.has(x.k));
    if (libres.length < n) { vistas = new Set(); libres = todas; }
    const elegidas = azar(libres).slice(0, n);
    for (const x of elegidas) vistas.add(x.k);
    st.vistas[tema] = [...vistas];
    st.turno++;
    guarda(K_QUIZ, st);
    const preguntas = elegidas.map(x => x.crea());
    for (const p of preguntas) if (p.img) new Image().src = p.img;   // que las fotos estén al llegar
    return { tema, preguntas, o };
  }
  // Se llama mientras se ve un vídeo, para que el quiz siguiente salga sin esperas
  function prepara(o) { if (!siguiente) siguiente = monta(o); }
  function descarta() { siguiente = null; }

  function di(texto, o) {
    if (!o.voz || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto), lang = TXT[o.idioma].voz, voces = speechSynthesis.getVoices();
      u.lang = lang;
      u.voice = voces.find(v => v.lang.replace('_', '-') === lang) || voces.find(v => v.lang.startsWith(lang.slice(0, 2))) || null;
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch {}
  }
  function suena(bien) {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      (bien ? [660, 880] : [220, 165]).forEach((f, k) => {
        const osc = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + k * 0.12;
        osc.type = bien ? 'triangle' : 'square';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(bien ? 0.25 : 0.08, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.connect(g).connect(audio.destination);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      });
    } catch {}
  }

  // Pinta el quiz en `caja` y llama a `fin` cuando se pulsa el botón final. Sin preguntas, devuelve false.
  function lanza(caja, o, fin) {
    cierra();
    // El preparado vale si se hizo con los mismos ajustes; si es de otro tamaño (el de 3 y la ronda de 10), se guarda
    const mismo = siguiente && (siguiente.o.n || 3) === (o.n || 3);
    const q = mismo && o.temas.includes(siguiente.tema) && siguiente.o.idioma === o.idioma && siguiente.o.tabla === o.tabla
      ? siguiente : monta(o);
    if (mismo) siguiente = null;
    if (!q) return false;
    estilos();
    alAcabar = fin;
    const t = TXT[o.idioma];
    let i = 0, aciertos = 0;

    function pregunta() {
      const p = q.preguntas[i], aviso = el('p', { class: 'qz-aviso', 'aria-live': 'polite' });
      let fallos = 0;
      const botones = p.opciones.map(op => el('button', { class: 'qz-op', onclick: e => responde(e.currentTarget, op) }, op));
      function responde(b, op) {
        if (op === p.buena) {
          b.classList.add('bien');
          for (const x of botones) x.disabled = true;
          if (!fallos) aciertos++;
          aviso.textContent = azar(t.bien)[0];
          suena(true);
          temporizador = setTimeout(() => { i++; if (i < q.preguntas.length) pregunta(); else final(); }, 1100);
        } else {
          fallos++;
          b.classList.add('mal');
          b.disabled = true;
          aviso.textContent = t.mal;
          suena(false);
        }
      }
      const foto = p.svg ? el('div', { class: 'qz-foto dibujo' }, p.svg)
        : p.img ? el('div', { class: 'qz-foto' + (p.bandera ? ' dibujo' : '') }, el('img', { src: p.img, alt: '', onerror: e => { e.target.parentNode.hidden = true; } }))
        : null;
      caja.replaceChildren(el('div', { class: 'qz' },
        el('div', { class: 'qz-cab' },
          el('span', { class: 'qz-tema' }, t.temas[q.tema]),
          el('span', { class: 'qz-prog' + (q.preguntas.length > 5 ? ' muchas' : ''), 'aria-label': `${i + 1} / ${q.preguntas.length}` },
            ...q.preguntas.map((_, k) => el('i', { class: k < i ? 'hecha' : k === i ? 'ahora' : null }))),
          o.voz ? el('button', { class: 'qz-voz', 'aria-label': t.leer, svg: VOZ, onclick: () => di(p.dice || p.texto, o) }) : null),
        el('div', { class: 'qz-cuerpo' }, foto,
          el('div', { class: 'qz-lado' },
            p.pie ? el('p', { class: 'qz-pie' }, p.pie) : null,
            el('h2', { class: 'qz-pregunta' }, p.texto),
            el('div', { class: 'qz-ops' }, ...botones),
            aviso))));
      caja.scrollTop = 0;
      di(p.dice || p.texto, o);
    }
    // Tres estrellas solo con todas bien; con 3 preguntas, una estrella por acierto. Con más, también la nota
    function final() {
      const n = q.preguntas.length, estrellas = aciertos === n ? 3 : Math.min(2, Math.round(aciertos * 3 / n));
      caja.replaceChildren(el('div', { class: 'qz qz-final' },
        el('div', { class: 'qz-estrellas', 'aria-label': `${aciertos} / ${n}` }, ...[0, 1, 2].map(k => el('span', { class: k < estrellas ? 'on' : null }, '★'))),
        n > 3 ? el('p', { class: 'qz-nota' }, `${aciertos} / ${n}`) : null,
        el('h2', { class: 'qz-pregunta' }, t.fin(estrellas)),
        el('button', { class: 'qz-seguir', onclick: () => { const f = alAcabar; cierra(); f?.(); } }, o.boton || t.seguir + ' ▶')));
      di((n > 3 ? t.de(aciertos, n) + '. ' : '') + t.fin(estrellas), o);
    }
    pregunta();
    return true;
  }
  function cierra() {
    clearTimeout(temporizador);
    alAcabar = null;
    try { window.speechSynthesis?.cancel(); } catch {}
  }

  // Los colores salen de los tokens de la página que lo usa (--fondo, --tarjeta, --tinta, --acento…)
  function estilos() {
    if (document.getElementById('qz-estilos')) return;
    document.head.append(el('style', { id: 'qz-estilos' }, `
.qz { box-sizing: border-box; min-height: 100%; max-width: 1000px; margin: 0 auto; padding: 14px 16px 28px; display: flex; flex-direction: column; gap: 14px; }
.qz *, .qz *::before { box-sizing: border-box; }
.qz-cab { display: flex; align-items: center; gap: 12px; min-height: 44px; }
.qz-tema { font-weight: 800; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--acento); }
.qz-prog { display: flex; gap: 7px; margin-left: auto; }
.qz-prog i { width: 12px; height: 12px; border-radius: 50%; background: var(--borde); }
.qz-prog i.hecha { background: var(--acento); }
.qz-prog i.ahora { background: var(--acento); outline: 3px solid color-mix(in srgb, var(--acento) 35%, transparent); }
.qz-prog.muchas { gap: 5px; }
.qz-prog.muchas i { width: 9px; height: 9px; }
.qz-voz { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--tarjeta); color: var(--tinta); box-shadow: var(--sombra); }
.qz-voz svg { width: 22px; height: 22px; }
.qz-cuerpo, .qz-lado { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.qz-foto { height: min(36vh, 340px); border-radius: 18px; overflow: hidden; background: var(--borde); display: grid; place-items: center; }
.qz-foto img { width: 100%; height: 100%; object-fit: contain; display: block; }
.qz-foto.dibujo { background: var(--tarjeta); box-shadow: var(--sombra); padding: 18px; }
.qz-foto.dibujo img { filter: drop-shadow(0 1px 4px rgba(0,0,0,.25)); }
.qz-foto svg { width: 100%; height: 100%; fill: var(--acento); }
.qz-foto svg .otra { fill: color-mix(in srgb, var(--acento) 55%, var(--tinta)); }
.qz-resta { display: grid; grid-template-columns: auto auto; column-gap: .3em; justify-items: end; align-items: center; color: var(--tinta);
            font-size: clamp(44px, 12vw, 72px); font-weight: 800; line-height: 1.15; font-variant-numeric: tabular-nums; letter-spacing: .1em; }
.qz-resta i { grid-column: 1 / -1; justify-self: stretch; height: 5px; margin: 4px 0 6px; border-radius: 3px; background: var(--tinta); }
.qz-resta .signo, .qz-resta .hueco { color: var(--acento); }
.qz-pie { margin: 0; font-weight: 800; font-size: 17px; color: var(--suave); }
.qz-pregunta { margin: 0; font-size: clamp(22px, 5.6vw, 30px); line-height: 1.2; font-weight: 800; text-wrap: balance; }
.qz-ops { display: grid; gap: 10px; }
.qz-op { min-height: 58px; padding: 12px 16px; border-radius: 16px; border: 3px solid transparent; background: var(--tarjeta); color: var(--tinta);
         box-shadow: var(--sombra); font: inherit; font-size: 19px; font-weight: 800; line-height: 1.2; cursor: pointer; transition: transform .1s; }
.qz-op:active { transform: scale(.98); }
.qz-op:disabled { cursor: default; }
.qz-op.bien { border-color: var(--bien, #2f9e5b); background: color-mix(in srgb, var(--bien, #2f9e5b) 22%, var(--tarjeta)); }
.qz-op.mal { border-color: var(--error-tinta); background: var(--error-fondo); color: var(--error-tinta); opacity: .7; animation: qz-sacude .35s; }
.qz-aviso { margin: 0; min-height: 1.4em; text-align: center; font-weight: 800; font-size: 19px; }
.qz-final { justify-content: center; align-items: center; text-align: center; gap: 18px; }
.qz-estrellas { display: flex; gap: 6px; font-size: 64px; line-height: 1; color: var(--borde); }
.qz-estrellas .on { color: #f5b301; }
.qz-nota { margin: 0; font-size: 44px; font-weight: 800; font-variant-numeric: tabular-nums; }
.qz-seguir { background: var(--acento); color: #fff; border: 0; border-radius: 999px; padding: 16px 32px; font: inherit; font-size: 20px; font-weight: 800; cursor: pointer; }
.qz button:focus-visible { outline: 3px solid var(--acento); outline-offset: 2px; }
@keyframes qz-sacude { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
@media (prefers-reduced-motion: reduce) { .qz-op.mal { animation: none; } }
/* En horizontal (tablet o móvil girado): la foto a la izquierda y la pregunta a la derecha */
@media (orientation: landscape) and (min-width: 560px) {
  .qz-cuerpo { flex-direction: row; align-items: center; }
  .qz-foto { flex: 1.25; height: min(calc(100dvh - 110px), 560px); }
  .qz-lado { flex: 1; }
}`));
  }

  return { TEMAS, nombres: L => TXT[L].temas, carga, cuantas, prepara, descarta, lanza, cierra };
})();
