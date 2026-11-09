(function () {
  var st = document.createElement('style');
  st.setAttribute('data-keep', '1');
  st.textContent = '*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    'input,textarea{-webkit-user-select:text;user-select:text}' +
    'img,svg{-webkit-user-drag:none;user-drag:none}';
  (document.head || document.documentElement).appendChild(st);

  function isi(t) {
    if (t && t.nodeType === 3) t = t.parentElement;
    return !!(t && t.closest && t.closest('input,textarea,[contenteditable="true"]'));
  }

  ['contextmenu', 'selectstart', 'dragstart', 'copy', 'cut'].forEach(function (n) {
    document.addEventListener(n, function (e) {
      if (isi(e.target)) return;
      e.preventDefault();
    }, true);
  });

  document.addEventListener('keydown', function (e) {
    var c = e.ctrlKey || e.metaKey, k = e.code, blok = false;
    if (k === 'F12') blok = true;
    else if (c && e.shiftKey && (k === 'KeyI' || k === 'KeyJ' || k === 'KeyC' || k === 'KeyK')) blok = true;
    else if (c && e.altKey && (k === 'KeyI' || k === 'KeyJ' || k === 'KeyC' || k === 'KeyU')) blok = true;
    else if (c && !e.shiftKey && !e.altKey && (k === 'KeyU' || k === 'KeyS')) blok = true;
    else if (c && (k === 'KeyA' || k === 'KeyC' || k === 'KeyX') && !isi(e.target)) blok = true;
    if (blok) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
