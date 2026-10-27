# Juegos de Canalitos

Cada juego vive en su carpeta (`juegos/<id>/`) y se apunta en la lista `JUEGOS` de `../index.html`.
La app lo abre en un marco sin `allow-same-origin`: el juego no puede leer la clave de YouTube ni el
PIN que guarda la app, y si intenta guardar algo (récords) lo pierde al cerrar. Ahí `localStorage`,
`sessionStorage` y las cookies lanzan error, y `alert`/`confirm` no salen: los juegos que los usan
cargan antes `../aislado.js`, que pone unos de memoria.

Antes de meter uno: licencia libre comprobada en su LICENSE, sin peticiones a fuera (anuncios,
analítica, CDN), jugable con el dedo, y sin nombres ni dibujos de juegos con marca.

| Carpeta | Juego | De dónde | Licencia | Cambios |
|---|---|---|---|---|
| `parejas/` | Fruit Matcher | github.com/mmenavas/memory-game @ 7da33da | MIT (LICENSE.txt) | las fotos de frutas (sin autor conocido) son emoji con el nombre en inglés |
| `topos/` | Atrapa los topos | propio de Canalitos (27-oct-2026) | — | — |
| `tresenraya/` | Tres en raya | propio de Canalitos (27-oct-2026) | — | — |
| `serie/` | Copy the Colours | propio de Canalitos (27-oct-2026) | — | — |
| `sopa/` | Word Search | github.com/bunkat/wordfind @ 579ef5a + jQuery 2.1.0 (de la copia de 0h h1) | MIT (LICENSE; jQuery MIT) | página y listas de palabras nuestras (Week 6 del cole y vocabulario); `touchMove` usa clientX/Y |
| `2048/` | 2048 | github.com/gabrielecirulli/2048 @ 478b6ec3 (24-oct-2024) | MIT (LICENSE.txt) | index.html sin enlaces a fuera, ni iconos de app, y la explicación dice «swipe» en vez de las flechas del teclado |
| `puzzle15/` | 15 Puzzle | github.com/arnisritins/15-Puzzle @ 47c82f1 | MIT (LICENSE) | sin enlace a fuera, empieza desordenado, mensaje al ganar en vez de `confirm()` |
| `0hh1/` | 0h h1 (Q42) | github.com/florisluiten/0hh1 @ 25910e5 (copia; el repo de Q42 ya no está) | MIT (LICENSE) | `aislado.js`, sin iconos de app, `tweet: false` |
| `factores/` | Factors Game | github.com/mnito/factors-game @ aba7558 | MIT (LICENSE) | `aislado.js`, sin enlaces a fuera ni etiquetas de redes sociales |
| `agujero/` | Black Hole Square | github.com/Quinten/black-hole-square @ 4a760a0 (`public/index.html`) | MIT (LICENSE) | `aislado.js`, sin Web Monetization, manifest, iconos ni service worker |
