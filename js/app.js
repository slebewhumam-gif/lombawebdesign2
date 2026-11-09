function cv(m, x) {
    return '<div class="th cv">' + (m.cover ? '<img src="' + esc(m.cover) + '" alt="" loading="lazy">' : '') + (x || '') + '</div>';
}
var KEY = 'edusmart', S = { done: {}, events: [], hasil: [], waktu: {}, nama: 'Pelajar' }, CLOUD = null, BOOT = [], FOTO = null, ADMIN = false;
function $(i) { return document.getElementById(i); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function detik() { return Object.keys(S.waktu).reduce(function (a, k) { return a + S.waktu[k]; }, 0); }
function menit() { return Math.floor(detik() / 60); }
function fmt(s) { s = Math.floor(s || 0); var j = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), d = s % 60; return j ? j + ' j ' + m + ' mnt' : m ? m + ' mnt ' + d + ' dtk' : d + ' dtk'; }
function rata() { return S.hasil.length ? Math.round(S.hasil.reduce(function (a, h) { return a + h.skor / h.total * 100; }, 0) / S.hasil.length) : 0; }
function toast(m) {
    var t = $('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = m;
    t.className = 's';
    clearTimeout(t.h);
    t.h = setTimeout(function () { t.className = ''; }, 2400);
}
function arr(v) { return Array.isArray(v) ? v : v && typeof v == 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []; }
function baca(k) {
    try {
        return JSON.parse(localStorage.getItem(k));
    }
    catch (e) {
        return null;
    }
}
function tulis(k, v) {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    }
    catch (e) { }
}
function sesi() {
    try {
        return localStorage.getItem('eduSesi') || sessionStorage.getItem('eduSesi');
    }
    catch (e) {
        return null;
    }
}
function bersih() {
    try {
        localStorage.removeItem('eduSesi');
        sessionStorage.removeItem('eduSesi');
    }
    catch (e) { }
}
function norm(o, nama) {
    o = o || {};
    var d = {};
    if (o.done && typeof o.done == 'object')
        Object.keys(o.done).forEach(function (k) {
            if (typeof o.done[k] == 'string')
                d[k] = o.done[k];
        });
    var w = {}, wk;
    if (o.waktu && typeof o.waktu == 'object')
        Object.keys(o.waktu).forEach(function (k) {
            var v = Math.floor(+o.waktu[k]);
            if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v > 0)
                w[k] = Math.min(86400, v);
        });
    wk = Object.keys(w).sort().slice(-366);
    w = wk.reduce(function (r, k) { r[k] = w[k]; return r; }, {});
    return {
        done: d,
        waktu: w,
        events: arr(o.events).filter(function (e) { return e && typeof e.judul == 'string' && typeof e.tgl == 'string'; })
            .map(function (e) { return { id: +e.id || Date.now(), judul: e.judul, tgl: e.tgl, jam: String(e.jam || '') }; }),
        hasil: arr(o.hasil).filter(function (h) { return h && +h.total > 0 && +h.skor >= 0; })
            .map(function (h) { return { skor: +h.skor, total: +h.total, tgl: +h.tgl || 0 }; }).slice(-200),
        nama: (typeof o.nama == 'string' && o.nama.trim()) || nama || 'Pelajar'
    };
}
function gabung(a, b, pakaiNama) {
    var r = norm(a);
    Object.keys(b.done).forEach(function (k) {
        if (!r.done[k])
            r.done[k] = b.done[k];
    });
    b.events.forEach(function (e) {
        if (!r.events.some(function (x) { return x.id == e.id; }))
            r.events.push(e);
    });
    b.hasil.forEach(function (h) {
        if (!r.hasil.some(function (x) { return x.tgl == h.tgl; }))
            r.hasil.push(h);
    });
    r.hasil.sort(function (x, y) { return x.tgl - y.tgl; });
    r.hasil = r.hasil.slice(-200);
    Object.keys(b.waktu || {}).forEach(function (k) {
        if ((b.waktu[k] || 0) > (r.waktu[k] || 0))
            r.waktu[k] = b.waktu[k];
    });
    if (pakaiNama && b.nama)
        r.nama = b.nama;
    return r;
}
function ada(d) { return Object.keys(d.done).length || d.events.length || d.hasil.length || Object.keys(d.waktu).length; }
function ambil() { return norm(S); }
/* Poin keaktifan: materi selesai 50, tiap kuis 20 + bonus skor (maks 30), 1 poin per menit belajar, jadwal 5 (maks 20 jadwal). */
function poinDari(d) {
    var m = Object.keys(d.done).length,
        h = d.hasil.slice(-50),
        bonus = h.reduce(function (a, x) { return a + Math.round(x.skor / x.total * 30); }, 0),
        mnt = Math.floor(Object.keys(d.waktu).reduce(function (a, k) { return a + d.waktu[k]; }, 0) / 60),
        j = Math.min(d.events.length, 20);
    return { poin: m * 50 + h.length * 20 + bonus + mnt + j * 5, materi: m, kuis: d.hasil.length, menit: mnt };
}
function dorongPapan() {
    var c = CLOUD;
    if (!c || !c.siap || !c.F || c.lbBan)
        return Promise.resolve(false);
    var p = poinDari(ambil());
    c.errPapan = null;
    var o = { nama: String(S.nama).slice(0, 60), poin: p.poin, materi: p.materi, kuis: p.kuis, menit: p.menit };
    if (typeof FOTO == 'string' && FOTO)
        o.foto = FOTO;
    var tg = 0;
    try { tg = parseInt(localStorage.getItem('eduTarget:' + c.uid), 10) || 0; } catch (e) { }
    if (tg > 0)
        o.target = tg;
    return c.F.set(c.F.ref(c.F.db, 'leaderboard/' + c.uid), o)
        .then(function () { return true; })
        .catch(function (e) { c.errPapan = e; return false; });
}
function isi(o, nama) { var d = norm(o, nama); S.done = d.done; S.events = d.events; S.hasil = d.hasil; S.waktu = d.waktu; S.nama = d.nama; }
function save() {
    setTimeout(function () { profilSb(); }, 0);
    var d = ambil();
    if (!CLOUD) {
        tulis(KEY, d);
        return;
    }
    d.kotor = true;
    tulis(KEY + ':' + CLOUD.uid, d);
    dorong();
}
function dorong(sny) {
    var c = CLOUD, d = ambil(), n;
    if (!c || !c.siap)
        return;
    n = ++c.n;
    c.F.update(c.F.ref(c.F.db, 'users/' + c.uid), { nama: d.nama, progres: { done: d.done, events: d.events, hasil: d.hasil, waktu: d.waktu } })
        .then(function () {
            if (n === c.n)
                tulis(KEY + ':' + c.uid, d);
        })
        .catch(function () { if (!sny) toast('Gagal menyimpan. Coba lagi.'); });
    dorongPapan();
}
addEventListener('online', function () { dorong(true); });
function hadir(F, uid) {
    var cr = F.ref(F.db, 'presence/' + uid), tr = F.ref(F.db, 'terakhir/' + uid), me = null;
    function diam(f) { try { var p = f(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }
    F.onValue(F.ref(F.db, '.info/connected'), function (s) {
        if (s.val() !== true)
            return;
        me = F.push(cr);
        diam(function () { return F.onDisconnect(me).remove(); });
        diam(function () { return F.onDisconnect(tr).set(F.serverTimestamp()); });
        if (!document.hidden)
            diam(function () { return F.set(me, true); });
    });
    document.addEventListener('visibilitychange', function () {
        if (!me)
            return;
        if (document.hidden) {
            diam(function () { return F.remove(me); });
            diam(function () { return F.set(tr, F.serverTimestamp()); });
        }
        else
            diam(function () { return F.set(me, true); });
    });
}
async function cloud() {
    var F = await import('./fb.js'), u = await F.userSiap();
    if (!u) {
        bersih();
        CLOUD = null;
        FOTO = null;
        isi(baca(KEY));
        return;
    }
    try {
        if ((await F.get(F.ref(F.db, 'blokir/' + u.uid))).val() === true) {
            await terpental(F);
            return;
        }
        F.onValue(F.ref(F.db, 'blokir/' + u.uid), function (snap) {
            if (snap.val() === true)
                terpental(F);
        });
    }
    catch (e) { }
    try { hadir(F, u.uid); } catch (e) { }
    try {
        ADMIN = (await F.get(F.ref(F.db, 'admins/' + u.uid))).val() === true;
        if (ADMIN)
            localStorage.setItem('eduAdmin:' + u.uid, '1');
        else
            localStorage.removeItem('eduAdmin:' + u.uid);
    }
    catch (e) { }
    var c = { F: F, uid: u.uid, siap: false, n: 0 }, ck = KEY + ':' + u.uid;
    CLOUD = c;
    var v = (await F.get(F.ref(F.db, 'users/' + u.uid))).val() || {}, p = v.progres || {};
    var h = norm({ nama: v.nama, done: p.done, events: p.events, hasil: p.hasil, waktu: p.waktu }, u.displayName || (u.email || '').split('@')[0]), cache = baca(ck), tamu = norm(baca(KEY)), ubah = false;
    if (cache && cache.kotor) {
        h = gabung(h, norm(cache), true);
        ubah = true;
    }
    if (ada(tamu)) {
        h = gabung(h, tamu, false);
        ubah = true;
    }
    try {
        localStorage.removeItem(KEY);
    }
    catch (e) { }
    FOTO = typeof v.foto == 'string' ? v.foto : null;
    try {
        if (FOTO)
            localStorage.setItem('edusmart:foto:' + u.uid, FOTO);
        else
            localStorage.removeItem('edusmart:foto:' + u.uid);
    }
    catch (e) { }
    Object.keys(S.waktu).forEach(function (k) {
        if ((S.waktu[k] || 0) > (h.waktu[k] || 0))
            h.waktu[k] = S.waktu[k];
    });
    isi(h);
    try {
        var tt = (await F.get(F.ref(F.db, 'leaderboard/' + u.uid + '/target'))).val();
        if (+tt > 0 && !localStorage.getItem('eduTarget:' + u.uid))
            localStorage.setItem('eduTarget:' + u.uid, String(Math.floor(+tt)));
    }
    catch (e) { }
    try { c.lbBan = (await F.get(F.ref(F.db, 'lbBan/' + u.uid))).val() === true; } catch (e) { }
    c.siap = true;
    if (ubah)
        save();
    else {
        tulis(ck, ambil());
        dorongPapan();
    }
    if (document.querySelector('.sb'))
        profilSb();
}
async function terpental(F) {
    var h = '1';
    try { if (!(await F.get(F.ref(F.db, 'users/' + F.auth.currentUser.uid))).exists()) h = '2'; } catch (e) { }
    try { await F.signOut(F.auth); } catch (e) { }
    location.replace('masuk.html?blokir=' + h);
}
if (!W.base)
    W.base = { umum: W.umum, materi: W.materi };
function bersihHtml(t) {
    return String(t == null ? '' : t).replace(/<\/?(script|iframe|object|embed|style|link|meta)[^>]*>/gi, '').replace(/\son\w+\s*=/gi, ' data-x=');
}
function soalK(q) { return [bersihHtml(q.q), arr(q.o).map(bersihHtml), +q.a || 0]; }
function terapkanKonten(k) {
    var ms = [];
    if (k && k.aktif)
        ms = arr(k.materi).filter(function (m) { return m && m.id && m.judul && arr(m.bab).length; }).map(function (m) {
            return {
                id: String(m.id).replace(/\W/g, ''), judul: bersihHtml(m.judul), kat: bersihHtml(m.kat), m: +m.m || 5, cover: (typeof m.cover == 'string' && /^data:image\/jpeg;base64,/.test(m.cover)) ? m.cover : '',
                bab: arr(m.bab).map(function (b) { return [bersihHtml(b.j), bersihHtml(b.t).replace(/\r?\n/g, '<br>')]; }),
                kuis: arr(m.kuis).map(soalK)
            };
        });
    if (ms.length) {
        W.materi = ms;
        W.umum = arr(k.umum).map(soalK);
    }
    else {
        W.materi = W.base.materi;
        W.umum = W.base.umum;
    }
    W.kuis = W.umum.concat.apply(W.umum, W.materi.map(function (m) { return m.kuis || []; }));
}
try { terapkanKonten(baca('eduKonten')); } catch (e) { }
var SIAP = (function () {
    var f = sesi(), p;
    try { ADMIN = !!f && localStorage.getItem('eduAdmin:' + f) == '1'; } catch (e) { }
    if (!f) {
        isi(baca(KEY));
        return Promise.resolve();
    }
    CLOUD = { F: null, uid: f, siap: false, n: 0 };
    isi(baca(KEY + ':' + f));
    try { FOTO = localStorage.getItem('edusmart:foto:' + f) || null; } catch (e) { }
    p = cloud().catch(function () { if (CLOUD) CLOUD.gagal = true; });
    return Promise.race([p, new Promise(function (r) { setTimeout(r, /profil\.html$/.test(location.pathname) ? 6000 : 2500); })]);
})();
function boot(fn) { BOOT.push(fn); }
var IC = {
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
    book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    bars: '<path d="M5 21V10M12 21V4M19 21v-8"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    bolt: '<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0M17 4.5a3.5 3.5 0 0 1 0 7M22 21a6 6 0 0 0-4-5.6"/>',
    circ: '<circle cx="12" cy="12" r="10"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
};
function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }
function grow(r) {
    (r || document).querySelectorAll('[data-w],[data-h]').forEach(function (e) {
        if (e.dataset.w)
            e.style.width = e.dataset.w + '%';
        if (e.dataset.h)
            e.style.height = e.dataset.h + '%';
    });
}
function setFoto(v) {
    if (!CLOUD || !CLOUD.F || !CLOUD.siap)
        return Promise.reject(new Error('belum siap'));
    return CLOUD.F.update(CLOUD.F.ref(CLOUD.F.db, 'users/' + CLOUD.uid), { foto: v }).then(function () {
        FOTO = v;
        try {
            if (v)
                localStorage.setItem('edusmart:foto:' + CLOUD.uid, v);
            else
                localStorage.removeItem('edusmart:foto:' + CLOUD.uid);
        }
        catch (e) { }
        profilSb();
        dorongPapan();
    });
}
var cp = location.pathname.split('/').pop().replace('.html', '') || 'index', PI = { index: 'cap', dashboard: 'grid', materi: 'book', kuis: 'bolt', jadwal: 'cal', progres: 'bars', tentang: 'users', leaderboard: 'trophy' }, P2 = [['index', 'Beranda'], ['dashboard', 'Dashboard'], ['materi', 'Materi'], ['kuis', 'Kuis'], ['jadwal', 'Jadwal'], ['progres', 'Progres'], ['leaderboard', 'Peringkat'], ['tentang', 'Tentang']];
document.body.classList.add('has-sb');
document.body.insertAdjacentHTML('afterbegin', '<header class="tb"><button type="button" class="sb-tg" id="sbtg" aria-label="Buka menu" aria-expanded="false" aria-controls="sbx">' + ic('menu') + '</button><div class="tb-brand">' + ic('cap') + '<span>EduSmart</span></div><button type="button" class="sb-tg tb-tema" id="temat" aria-label="Ganti tema"></button><button type="button" class="sb-tg tb-fs" id="fsb" aria-label="Layar penuh" hidden>' + ic('expand') + '</button></header><div class="sb-bg" id="sbbg"></div><aside class="sb" id="sbx"><button type="button" class="sb-x" aria-label="Tutup menu">' + ic('x') + '</button><div class="brand">' + ic('cap') + '<span>EduSmart</span><button type="button" class="sb-tema" id="temab" aria-label="Ganti tema"></button></div><nav>' + P2.map(function (p) { return '<a href="' + p[0] + '.html"' + (p[0] == cp ? ' class="on"' : '') + '>' + ic(PI[p[0]]) + '<span>' + p[1] + '</span></a>'; }).join('') + '</nav></aside>');
(function () {
    var sb = $('sbx'), bg = $('sbbg'), tg = $('sbtg'), x0 = null;
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
        if (e.target.closest('a[href]'))
            buka(false);
        if (e.detail && e.target.closest('a,button') && document.activeElement && document.activeElement.blur)
            document.activeElement.blur();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key == 'Escape' && sb.classList.contains('open'))
            buka(false);
    });
    sb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    sb.addEventListener('touchmove', function (e) {
        if (x0 !== null && e.touches[0].clientX - x0 < -70) {
            x0 = null;
            buka(false);
        }
    }, { passive: true });
    sb.addEventListener('touchend', function () { x0 = null; });
    matchMedia('(min-width:821px)').addEventListener('change', function (e) { if (e.matches) buka(false); });
    addEventListener('pageshow', function () { buka(false); });
})();
function profilSb() {
    var sb = document.querySelector('.sb'), on = !!CLOUD;
    sb.querySelectorAll('.me,.sbp').forEach(function (e) { e.remove(); });
    sb.querySelector('.brand').insertAdjacentHTML('afterend', '<a class="me" href="' + (on ? 'profil.html' : 'masuk.html') + '"><i class="av">' + (on && FOTO ? '<img src="' + FOTO + '" alt="">' : on ? esc(S.nama.charAt(0).toUpperCase()) : '→') + '</i><span><b>' + (on ? esc(S.nama) : 'Masuk / Daftar') + '</b>' + '<small>' + (on ? 'Lihat profil' : 'Simpan progresmu') + '</small>' + '</span></a>');
    var n = Object.keys(S.done).length, t = W.materi.length, p = t ? Math.round(n / t * 100) : 0;
    sb.querySelector('nav').insertAdjacentHTML('afterend', '<a class="sbp" href="progres.html"><small>Progres belajar</small><b>' + p + '%</b><i><u style="width:' + p + '%"></u></i><small>' + n + ' dari ' + t + ' materi</small><small id="sbw">Belajar hari ini · ' + fmt(S.waktu[iso(new Date())] || 0) + '</small></a>');
}
(function () {
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    var tirai = document.createElement('div');
    tirai.id = 'cur';
    tirai.innerHTML = ic('cap');
    document.body.appendChild(tirai);
    tirai.className = reduce ? '' : 'hold';
    addEventListener('pageshow', function (e) {
        if (e.persisted)
            tirai.className = '';
    });
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/\.html(\?|$)/.test(a.getAttribute('href')))
            return;
        e.preventDefault();
        var tuju = new URL(a.href, location.href);
        if (halaman(tuju) === halaman(location))
            return;
        if (spa(tuju)) {
            ke(tuju.href, true);
            return;
        }
        if (reduce) {
            location.href = a.href;
            return;
        }
        tirai.className = 'in';
        setTimeout(function () { location.href = a.href; }, 220);
    });
    function halaman(u) {
        return u.pathname.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/$/, '') + u.search;
    }
    document.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('.btn');
        if (!b)
            return;
        var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, d = document.createElement('i');
        d.className = 'rp';
        d.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
        b.appendChild(d);
        setTimeout(function () { d.remove(); }, 650);
    });
    var LSN = [], EKSTRA = [], NAV = 0,
        PSTYLE = Array.prototype.slice.call(document.head.querySelectorAll('style:not([data-keep])'));
    function jalankan() {
        var fns = BOOT.splice(0), ae = document.addEventListener, awal = Array.prototype.slice.call(document.body.children);
        document.addEventListener = function (t, f, o) {
            LSN.push([t, f, o]);
            return ae.call(document, t, f, o);
        };
        fns.forEach(function (f) {
            try {
                f();
            }
            catch (e) {
                console.error(e);
            }
        });
        delete document.addEventListener;
        EKSTRA = Array.prototype.slice.call(document.body.children).filter(function (x) { return awal.indexOf(x) < 0 && x.id != 'toast'; });
    }
    function lepas() {
        LSN.forEach(function (l) { document.removeEventListener(l[0], l[1], l[2]); });
        LSN = [];
        EKSTRA.forEach(function (x) { x.remove(); });
        EKSTRA = [];
        PSTYLE.forEach(function (x) { x.remove(); });
        PSTYLE = [];
    }
    function spa(u) {
        return !!(window.fetch && history.pushState) && u.origin === location.origin && /\.html$/.test(u.pathname) && !/\/(masuk|admin)\.html$/.test(u.pathname);
    }
    function ke(href, dorong) {
        var u = new URL(href, location.href), id = ++NAV;
        if (!reduce)
            tirai.className = 'in';
        Promise.all([
            fetch(u.href, { credentials: 'same-origin' }).then(function (r) {
                if (!r.ok)
                    throw new Error('http');
                return r.text();
            }),
            new Promise(function (ok) { setTimeout(ok, reduce ? 0 : 220); })
        ]).then(function (h) {
            if (id !== NAV)
                return;
            var doc = new DOMParser().parseFromString(h[0], 'text/html'), nm = doc.querySelector('main');
            if (!nm || !doc.querySelector('script[src*="app.js"]'))
                throw new Error('bukan halaman');
            lepas();
            document.title = doc.title;
            document.querySelector('main').replaceWith(document.importNode(nm, true));
            doc.head.querySelectorAll('style:not([data-keep])').forEach(function (st) {
                var c = document.createElement('style');
                c.textContent = st.textContent;
                document.head.appendChild(c);
                PSTYLE.push(c);
            });
            cp = u.pathname.split('/').pop().replace('.html', '') || 'index';
            document.querySelectorAll('.sb nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') == cp + '.html'); });
            if (dorong)
                history.pushState(null, '', u.href);
            window.scrollTo(0, 0);
            doc.querySelectorAll('body script:not([src])').forEach(function (sc) {
                var n = document.createElement('script');
                n.textContent = sc.textContent;
                document.body.appendChild(n);
                n.remove();
            });
            terapkanKonten(baca('eduKonten'));
            jalankan();
            mulai();
            if (!ADMIN)
                jejak(cp);
        }).catch(function () {
            if (id === NAV)
                location.href = u.href;
        });
    }
    addEventListener('popstate', function () { ke(location.href, false); });
    function mulai() {
        var main = document.querySelector('main');
        profilSb();
        document.querySelectorAll('[data-i]').forEach(function (e) { e.innerHTML = ic(e.dataset.i); });
        document.querySelectorAll('main h1').forEach(function (h) {
            var i = 0;
            h.innerHTML = h.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w"><span style="--i:' + (i++) + '">' + esc(w) + '</span></span>'; }).join(' ');
        });
        main.querySelectorAll('.lead,.card,.tile,.mcard,.art').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i * 60, 600) + 'ms'); });
        main.classList.add('boot');
        setTimeout(function () { main.classList.remove('boot'); }, 1200);
        tirai.className = reduce ? '' : 'out';
        setTimeout(function () { grow(); }, reduce ? 0 : 250);
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var to = +el.dataset.count, s = el.dataset.suf || '', t0 = performance.now();
            if (reduce || !to) {
                el.textContent = to + s;
                return;
            }
            (function f(t) {
                var p = Math.min(1, (t - t0 - 100) / 700);
                if (p > 0)
                    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + s;
                if (p < 1)
                    requestAnimationFrame(f);
            })(t0);
        });
        if (CLOUD && !CLOUD.siap && !navigator.onLine)
            toast('Tidak ada koneksi internet.');
        else if (CLOUD && CLOUD.gagal)
            toast('Tidak dapat terhubung ke server. Data disimpan sementara di perangkat.');
    }
    function jalan() {
        SIAP.then(function () {
            jalankan();
            mulai();
            if (!ADMIN)
                jejak(cp);
        });
    }
    if (document.readyState == 'loading')
        document.addEventListener('DOMContentLoaded', jalan);
    else
        jalan();
})();

(function () {
    var HALAMAN = { materi: 1, kuis: 1 }, IDLE = 90000, akt = Date.now(), last = Date.now(), pecah = 0, sLokal = 0, sCloud = 0, siap = false;
    ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (e) {
        addEventListener(e, function () { akt = Date.now(); }, { capture: true, passive: true });
    });
    SIAP.then(function () { siap = true; last = Date.now(); });
    function aktif() {
        if (!siap || !HALAMAN[cp] || document.hidden || Date.now() - akt > IDLE)
            return false;
        if (cp == 'materi') {
            var d = $('dlg');
            return !!(d && d.open);
        }
        return true;
    }
    function simpan(push) {
        var d = ambil();
        sLokal = 0;
        if (!CLOUD) {
            tulis(KEY, d);
            return;
        }
        d.kotor = true;
        tulis(KEY + ':' + CLOUD.uid, d);
        if (push) {
            sCloud = 0;
            dorong(true);
        }
    }
    setInterval(function () {
        var now = Date.now(), dt = Math.min(now - last, 2000);
        last = now;
        if (!aktif())
            return;
        pecah += dt;
        if (pecah < 1000)
            return;
        var n = Math.floor(pecah / 1000), k = iso(new Date()), e = $('sbw');
        pecah -= n * 1000;
        S.waktu[k] = Math.min(86400, (S.waktu[k] || 0) + n);
        sLokal += n;
        sCloud += n;
        if (e)
            e.textContent = 'Belajar hari ini · ' + fmt(S.waktu[k]);
        if (sLokal >= 10)
            simpan(sCloud >= 60);
    }, 1000);
    function tutup() {
        if (sLokal || sCloud)
            simpan(true);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) tutup(); });
    addEventListener('pagehide', tutup);
})();

(function () {
    var btn = $('fsb'), el = document.documentElement, KF = 'eduFs', pergi = false;
    if (!btn)
        return;
    var bisa = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
        pwa = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true,
        ios = /iPhone|iPod/.test(navigator.userAgent);
    function aktifFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function masuk() {
        var f = el.requestFullscreen || el.webkitRequestFullscreen, r;
        if (!f)
            return;
        try { r = f.call(el, { navigationUI: 'hide' }); } catch (e) { }
        if (r && r.catch)
            r.catch(function () { });
    }
    function keluar() {
        var f = document.exitFullscreen || document.webkitExitFullscreen, r;
        if (!f)
            return;
        try { r = f.call(document); } catch (e) { }
        if (r && r.catch)
            r.catch(function () { });
    }
    function pref(v) {
        try {
            if (v)
                sessionStorage.setItem(KF, '1');
            else
                sessionStorage.removeItem(KF);
        }
        catch (e) { }
    }
    function ingin() {
        try { return sessionStorage.getItem(KF) == '1'; } catch (e) { return false; }
    }
    function ikon() {
        var on = aktifFs();
        btn.innerHTML = ic(on ? 'shrink' : 'expand');
        btn.setAttribute('aria-label', on ? 'Keluar layar penuh' : 'Layar penuh');
    }
    if (pwa || (!bisa && !ios))
        return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
        if (!bisa) {
            toast('Di iPhone: Bagikan → Tambah ke Layar Utama');
            return;
        }
        if (aktifFs()) {
            pref(false);
            keluar();
        }
        else {
            pref(true);
            masuk();
        }
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (n) {
        document.addEventListener(n, function () {
            ikon();
            if (!aktifFs() && !pergi)
                pref(false);
        });
    });
    addEventListener('pagehide', function () { pergi = true; });
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a[href]')) {
            pergi = true;
            setTimeout(function () { pergi = false; }, 1000);
        }
    }, true);
    if (bisa && ingin() && !aktifFs()) {
        var EV = ['touchend', 'pointerup', 'click'];
        var ulang = function (e) {
            if (e.target.closest && e.target.closest('a[href]'))
                return;
            EV.forEach(function (n) { document.removeEventListener(n, ulang, true); });
            if (!aktifFs())
                masuk();
        };
        EV.forEach(function (n) { document.addEventListener(n, ulang, true); });
    }
})();

(function () {
    function gelap() { return document.documentElement.getAttribute('data-theme') == 'dark'; }
    function ikon() {
        var g = gelap(), a = $('temab'), t = $('temat');
        if (a) {
            a.innerHTML = ic(g ? 'sun' : 'moon');
            a.setAttribute('aria-label', g ? 'Mode terang' : 'Mode gelap');
        }
        if (t) {
            t.innerHTML = ic(g ? 'sun' : 'moon');
            t.setAttribute('aria-label', g ? 'Mode terang' : 'Mode gelap');
        }
    }
    ikon();
    document.addEventListener('click', function (e) {
        var x = e.target.closest && e.target.closest('#temab,#temat');
        if (!x)
            return;
        e.preventDefault();
        e.stopPropagation();
        if (window.toggleTema)
            window.toggleTema();
    }, true);
    document.addEventListener('tema', ikon);
})();

function jejak(hal) {
    if (!/^[a-z]{3,12}$/.test(hal) || hal == 'admin')
        return;
    var t = iso(new Date()), baru = false;
    try { baru = localStorage.getItem('eduUnik') != t; } catch (e) { }
    import('./fb.js').then(function (F) {
        var u = {};
        u['halaman/' + hal] = F.increment(1);
        u['harian/' + t + '/total'] = F.increment(1);
        if (baru)
            u['harian/' + t + '/unik'] = F.increment(1);
        return F.update(F.ref(F.db, 'statistik'), u).then(function () {
            if (baru)
                try { localStorage.setItem('eduUnik', t); } catch (e) { }
        });
    }).catch(function () { });
}
setTimeout(function () {
    import('./fb.js').then(function (F) { return F.get(F.ref(F.db, 'konten')); }).then(function (snap) {
        var k = snap.val() || null;
        if (JSON.stringify(k) !== JSON.stringify(baca('eduKonten'))) {
            tulis('eduKonten', k);
            terapkanKonten(k);
        }
    }).catch(function () { });
}, 1500);
