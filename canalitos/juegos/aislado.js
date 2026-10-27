// Canalitos abre cada juego en un marco aislado (sin allow-same-origin), y ahí localStorage,
// sessionStorage y las cookies lanzan error. Los juegos que los usan sin protegerse se romperían:
// este arreglo pone en su lugar unos de memoria (se pierden al cerrar el juego). Va el primero.
(function () {
  try { window.localStorage.length; return; } catch (e) {}
  function almacen() {
    var datos = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(datos, k) ? datos[k] : null; },
      setItem: function (k, v) { datos[k] = String(v); },
      removeItem: function (k) { delete datos[k]; },
      clear: function () { datos = {}; },
      key: function (i) { return Object.keys(datos)[i] || null; },
      get length() { return Object.keys(datos).length; }
    };
  }
  ['localStorage', 'sessionStorage'].forEach(function (n) {
    try { Object.defineProperty(window, n, { value: almacen(), configurable: true }); } catch (e) {}
  });
  var galletas = '';
  try { Object.defineProperty(document, 'cookie', { get: function () { return galletas; }, set: function (v) { galletas = String(v).split(';')[0]; }, configurable: true }); } catch (e) {}
})();
