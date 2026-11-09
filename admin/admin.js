
var F, U, A, C = {}, MOD = {};
var KAT = ['Teknologi', 'Sains', 'Sosial', 'Bahasa', 'Matematika'];

function $(i) { return document.getElementById(i); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function arr(v) { return Array.isArray(v) ? v : v && typeof v == 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []; }
function R(p) { return F.ref(F.db, p); }
function tgl(ms) { return ms ? new Date(+ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
function lalu(ms) {
  var s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return 'baru saja';
  var m = Math.floor(s / 60);
  if (m < 60) return m + ' menit lalu';
  var j = Math.floor(m / 60);
  if (j < 24) return j + ' jam lalu';
  var h = Math.floor(j / 24);
  return h < 30 ? h + ' hari lalu' : tgl(ms);
}
function toast(m) {
  var t = $('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = m;
  t.className = 's';
  clearTimeout(t.h);
  t.h = setTimeout(function () { t.className = ''; }, 2400);
}

var IC = {
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  bars: '<path d="M5 21V10M12 21V4M19 21v-8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  doc: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h7M9 17h7"/>',
  quiz: '<path d="M4 4h16v16H4z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0M17 4.5a3.5 3.5 0 0 1 0 7M22 21a6 6 0 0 0-4-5.6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
  bolt: '<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17-5-5 5-5M5 12h12"/>'
};
function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }
function grow(r) {
  (r || document).querySelectorAll('[data-w],[data-h]').forEach(function (e) {
    if (e.dataset.w) e.style.width = e.dataset.w + '%';
    if (e.dataset.h) e.style.height = e.dataset.h + '%';
  });
}

function dasar(B) {
  function soal(s) { return { q: s[0], o: s[1].slice(), a: s[2] }; }
  return {
    umum: (B.umum || []).map(soal),
    materi: B.materi.map(function (m) {
      return {
        id: m.id, judul: m.judul, kat: m.kat, m: m.m,
        bab: m.bab.map(function (b) { return { j: b[0], t: String(b[1]).replace(/<br\s*\/?>/gi, '\n') }; }),
        kuis: (m.kuis || []).map(soal)
      };
    })
  };
}
function daridb(k) {
  function soal(s) { return { q: s.q, o: arr(s.o), a: +s.a || 0 }; }
  return {
    umum: arr(k.umum).map(soal),
    materi: arr(k.materi).map(function (m) {
      var o = { id: m.id, judul: m.judul, kat: m.kat, m: +m.m || 5, bab: arr(m.bab).map(function (b) { return { j: b.j, t: b.t }; }), kuis: arr(m.kuis).map(soal) };
      if (typeof m.cover == 'string' && /^data:image\/jpeg;base64,/.test(m.cover)) o.cover = m.cover;
      return o;
    })
  };
}
async function muatKonten() {
  var k = (await F.get(R('konten'))).val();
  A = k && k.aktif ? daridb(k) : dasar(W.base || W);
}
function paket() {
  return JSON.parse(JSON.stringify({
    aktif: true, diubah: Date.now(), umum: A.umum,
    materi: A.materi.map(function (m) { var o = { id: m.id, judul: m.judul, kat: m.kat, m: m.m, bab: m.bab, kuis: m.kuis }; if (m.cover) o.cover = m.cover; return o; })
  }));
}
async function simpan(pesan) {
  try {
    var d = paket();
    await F.set(R('konten'), d);
    toast(pesan || 'Tersimpan');
    return true;
  }
  catch (e) {
    toast('Gagal menyimpan. Pastikan aturan database sudah dipasang.');
    try { await muatKonten(); } catch (x) { }
    return false;
  }
}

function modal(h) { $('mb').innerHTML = h; $('md').hidden = false; document.body.style.overflow = 'hidden'; }
function tutup() { $('md').hidden = true; document.body.style.overflow = ''; }

function grafikGaris(L, V) {
  var w = 560, h = 250, pl = 46, pr = 16, pt = 14, pb = 32, mx = Math.max.apply(null, V.concat([4])), n = L.length;
  var steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000], st = steps.filter(function (s) { return s * 4 >= mx; })[0] || 100000, top = st * 4;
  function X(i) { return pl + (w - pl - pr) * (n < 2 ? .5 : i / (n - 1)); }
  function Y(v) { return pt + (h - pt - pb) * (1 - v / top); }
  var g = '', p = '', i;
  for (i = 0; i <= 4; i++)
    g += '<line class="gl" x1="' + pl + '" x2="' + (w - pr) + '" y1="' + Y(st * i) + '" y2="' + Y(st * i) + '"/><text class="tx" x="' + (pl - 8) + '" y="' + (Y(st * i) + 4) + '" text-anchor="end">' + (st * i >= 1000 ? (st * i / 1000) + 'K' : st * i) + '</text>';
  p = 'M' + X(0) + ' ' + Y(V[0]);
  for (i = 1; i < n; i++) {
    var cx = (X(i - 1) + X(i)) / 2;
    p += ' C' + cx + ' ' + Y(V[i - 1]) + ',' + cx + ' ' + Y(V[i]) + ',' + X(i) + ' ' + Y(V[i]);
  }
  var ar = p + ' L' + X(n - 1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + ' Z';
  var lb = L.map(function (t, k) { return '<text class="tx" x="' + X(k) + '" y="' + (h - 10) + '" text-anchor="middle">' + esc(t) + '</text>'; }).join('');
  var dt = V.map(function (v, k) { return '<circle class="dt" cx="' + X(k) + '" cy="' + Y(v) + '" r="3.6"><title>' + esc(L[k]) + ': ' + v + '</title></circle>'; }).join('');
  return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + g + '<path class="ar" d="' + ar + '"/><path class="ln" d="' + p + '"/>' + dt + lb + '</svg>';
}

var NAV = [
  ['dashboard', 'Dashboard', 'grid'],
  ['materi', 'Materi', 'book'],
  ['kuis', 'Kuis', 'bolt'],
  ['pengguna', 'Pengguna', 'users'],
  ['peringkat', 'Peringkat', 'trophy'],
  ['laporan', 'Laporan', 'bars']
];

function tolak(j, p) {
  if ($('cur')) $('cur').className = 'out';
  $('ak').innerHTML = '<section class="card" style="max-width:540px"><h2>' + j + '</h2><p class="mut">' + p + '</p></section>';
}

function adminStart(o) {
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.body.classList.add('has-sb');
  document.body.insertAdjacentHTML('afterbegin',
    '<header class="tb"><button type="button" class="sb-tg" id="sbtg" aria-label="Buka menu" aria-expanded="false" aria-controls="sbx">' + ic('menu') + '</button><div class="tb-brand">' + ic('cap') + '<span>EduSmart</span></div><button type="button" class="sb-tg tb-tema" id="temat" aria-label="Ganti tema"></button></header>' +
    '<div class="sb-bg" id="sbbg"></div>' +
    '<aside class="sb" id="sbx"><button type="button" class="sb-x" aria-label="Tutup menu">' + ic('x') + '</button>' +
    '<div class="brand">' + ic('cap') + '<span>EduSmart</span><button type="button" class="sb-tema" id="temab" aria-label="Ganti tema"></button></div>' +
    '<div class="me"><i class="av">A</i><span><b>Admin</b><small>Panel pengelola</small></span></div>' +
    '<nav>' + NAV.map(function (n) { return '<a href="' + n[0] + '.html"' + (n[0] == o.page ? ' class="on"' : '') + '>' + ic(n[2]) + '<span>' + n[1] + '</span></a>'; }).join('') + '</nav></aside>' +
    '<main id="mn" class="boot"><h1 id="jd"></h1><p class="lead">' + o.sub + '</p>' + (o.actions ? '<div class="pa">' + o.actions + '</div>' : '') +
    '<div id="ak"></div><div id="body" hidden></div></main>' +
    '<div class="md" id="md" hidden><div class="md-box" id="mb" role="dialog" aria-modal="true"></div></div>' +
    '<div id="cur">' + ic('cap') + '</div>');

  var i = 0, jd = $('jd'), tirai = $('cur'), sb = $('sbx'), bg = $('sbbg'), tg = $('sbtg');
  jd.innerHTML = String(o.title).trim().split(/\s+/).map(function (w) { return '<span class="w"><span style="--i:' + (i++) + '">' + esc(w) + '</span></span>'; }).join(' ');
  document.title = o.title + ' – EduSmart';
  tirai.className = reduce ? '' : 'hold';
  addEventListener('pageshow', function (e) { if (e.persisted) tirai.className = ''; });

  function buka(b) {
    sb.classList.toggle('open', b);
    bg.classList.toggle('on', b);
    document.body.classList.toggle('sb-lock', b);
    tg.setAttribute('aria-expanded', b ? 'true' : 'false');
    tg.setAttribute('aria-label', b ? 'Tutup menu' : 'Buka menu');
  }
  tg.addEventListener('click', function () { buka(!sb.classList.contains('open')); });
  bg.addEventListener('click', function () { buka(false); });
  sb.querySelector('.sb-x').addEventListener('click', function () { buka(false); });
  sb.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) buka(false);
    if (e.detail && e.target.closest('a,button') && document.activeElement && document.activeElement.blur) document.activeElement.blur();
  });
  var x0 = null;
  sb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  sb.addEventListener('touchmove', function (e) { if (x0 !== null && e.touches[0].clientX - x0 < -70) { x0 = null; buka(false); } }, { passive: true });
  sb.addEventListener('touchend', function () { x0 = null; });
  matchMedia('(min-width:821px)').addEventListener('change', function (e) { if (e.matches) buka(false); });
  addEventListener('pageshow', function () { buka(false); });

  function ikon() {
    var g = window.temaGelap && temaGelap();
    ['temab', 'temat'].forEach(function (id) {
      var t = $(id);
      if (t) { t.innerHTML = ic(g ? 'sun' : 'moon'); t.setAttribute('aria-label', g ? 'Mode terang' : 'Mode gelap'); }
    });
  }
  ikon();
  document.addEventListener('tema', ikon);
  document.addEventListener('click', function (e) {
    if (e.target.closest('#temab,#temat')) { e.preventDefault(); if (window.toggleTema) toggleTema(); }
    if (e.target.closest('[data-mc]') || e.target.id == 'md') tutup();
  });
  document.addEventListener('keydown', function (e) { if (e.key == 'Escape' && !$('md').hidden) tutup(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/\.html(\?|$)/.test(a.getAttribute('href'))) return;
    var u = new URL(a.href, location.href);
    if (u.pathname == location.pathname) { e.preventDefault(); return; }
    if (reduce) return;
    e.preventDefault();
    tirai.className = 'in';
    setTimeout(function () { location.href = a.href; }, 220);
  });

  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn');
    if (!b) return;
    var r = b.getBoundingClientRect(), z = Math.max(r.width, r.height) * 2, d = document.createElement('i');
    d.className = 'rp';
    d.style.cssText = 'width:' + z + 'px;height:' + z + 'px;left:' + (e.clientX - r.left - z / 2) + 'px;top:' + (e.clientY - r.top - z / 2) + 'px';
    b.appendChild(d);
    setTimeout(function () { d.remove(); }, 650);
  });

  $('ak').innerHTML = '<p class="mut">Memuat…</p>';
  (async function () {
    if (location.protocol == 'file:') {
      tolak('Buka lewat server', 'Halaman ini tidak bisa jalan kalau file-nya diklik dua kali (alamat berawalan file://). Buka lewat Live Server atau hosting situsmu.');
      return;
    }
    try {
      var G = 'https://www.gstatic.com/firebasejs/10.12.2/';
      var M = await Promise.all([import(G + 'firebase-app.js'), import(G + 'firebase-auth.js'), import(G + 'firebase-database.js'), import(new URL('../js/firebase-config.js', location.href).href)]);
      MOD = { app: M[0], auth: M[1], cfg: M[3].firebaseConfig };
      var app0 = M[0].initializeApp(M[3].firebaseConfig, 'admin'), auth = M[1].getAuth(app0);
      F = { app: app0, auth: auth, db: M[2].getDatabase(app0), ref: M[2].ref, get: M[2].get, set: M[2].set, remove: M[2].remove, onValue: M[2].onValue };
      U = await new Promise(function (ok) { var off = M[1].onAuthStateChanged(auth, function (u) { off(); ok(u); }); });
    }
    catch (e) {
      var c = String(e && e.code || '');
      if (/operation-not-allowed|admin-restricted/.test(c))
        tolak('Aktifkan login Email/Password dulu', 'Buka Firebase Console → Authentication → Sign-in method → Email/Password → Enable, lalu muat ulang halaman ini.');
      else
        tolak('Gagal memuat', 'Periksa koneksi internet, lalu muat ulang halaman.<br><small>Detail: ' + esc(String(e && e.message || e)) + '</small>');
      return;
    }
    try { if (U) await MOD.auth.signOut(F.auth); } catch (e) { }
    U = { uid: '', email: '' };
    mulai(o);
  })();
}

async function mulai(o) {
  try { await muatKonten(); }
  catch (e) { tolak('Gagal memuat', 'Periksa koneksi internet dan pastikan aturan database terbaru sudah dipublikasikan, lalu muat ulang halaman.<br><small>Detail: ' + esc(String(e && e.message || e)) + '</small>'); return; }
  $('ak').innerHTML = '';
  $('body').hidden = false;
  await o.init($('body'));
  siap();
}

function siap() {
  var mn = $('mn'), reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  mn.querySelectorAll('.lead,.card,.tile').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i * 60, 600) + 'ms'); });
  mn.classList.add('boot');
  setTimeout(function () { mn.classList.remove('boot'); }, 1200);
  $('cur').className = reduce ? '' : 'out';
  setTimeout(function () { grow(); }, reduce ? 0 : 250);
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.dataset.count, t0 = performance.now();
    if (reduce || !to) { el.textContent = to; return; }
    (function f(t) {
      var p = Math.min(1, (t - t0 - 100) / 700);
      if (p > 0) el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  });
}
