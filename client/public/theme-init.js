// Applies stored theme before first paint to prevent flash.
// Loaded synchronously in <head> via <script src="/theme-init.js"></script>.
(function () {
  try {
    var t = localStorage.getItem('avi-theme');
    if (t && t !== 'orchid') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) { /* localStorage blocked */ }
})();
