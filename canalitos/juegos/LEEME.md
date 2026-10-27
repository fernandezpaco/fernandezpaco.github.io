# Juegos de Canalitos

Cada juego vive en su carpeta (`juegos/<id>/`) y se apunta en la lista `JUEGOS` de `../index.html`.
La app lo abre en un marco sin `allow-same-origin`: el juego no puede leer la clave de YouTube ni el
PIN que guarda la app, y si intenta guardar algo (récords) lo pierde al cerrar.

Antes de meter uno: licencia libre comprobada en su LICENSE, sin peticiones a fuera (anuncios,
analítica, CDN), jugable con el dedo, y sin nombres ni dibujos de juegos con marca.

| Carpeta | Juego | De dónde | Licencia | Cambios |
|---|---|---|---|---|
| `2048/` | 2048 | github.com/gabrielecirulli/2048 @ 478b6ec3 (24-oct-2024) | MIT (LICENSE.txt) | index.html sin enlaces a fuera, ni iconos de app, y la explicación dice «swipe» en vez de las flechas del teclado |
