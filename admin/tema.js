(function () {
  var K = 'adminTema', r = document.documentElement,
    mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function simpanan() {
    try { return localStorage.getItem(K); } catch (e) { return null; }
  }
  function warna() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', r.getAttribute('data-theme') == 'dark' ? '#181b22' : '#1b2a4a');
  }
  function pakai() {
    var t = simpanan(), g = t == 'dark' || (t != 'light' && !!(mq && mq.matches));
    r.setAttribute('data-theme', g ? 'dark' : 'light');
    warna();
  }
  var jeda;
  function halus() {
    r.classList.add('tr-tema');
    clearTimeout(jeda);
    jeda = setTimeout(function () { r.classList.remove('tr-tema'); }, 500);
  }
  function kabar() { document.dispatchEvent(new Event('tema')); }
  window.temaGelap = function () { return r.getAttribute('data-theme') == 'dark'; };
  window.setTema = function (t) {
    try {
      if (t) localStorage.setItem(K, t);
      else localStorage.removeItem(K);
    } catch (e) { }
    halus();
    pakai();
    kabar();
  };
  window.toggleTema = function () { window.setTema(window.temaGelap() ? 'light' : 'dark'); };
  pakai();
  document.addEventListener('DOMContentLoaded', warna);
  if (mq && mq.addEventListener)
    mq.addEventListener('change', function () { if (!simpanan()) { pakai(); kabar(); } });
  addEventListener('storage', function (e) { if (e.key == K) { pakai(); kabar(); } });
})();
