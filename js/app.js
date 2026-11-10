/* haithamhattan.sa — render + i18n (ar/en/zh) + theme + small interactions */
(function () {
  'use strict';
  var S = window.SITE, A = window.ASCII, doc = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var lang = S.ui[doc.lang] ? doc.lang : 'en';
  function t(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.en || ''); }
  function u(k) { return S.ui[lang][k] || S.ui.en[k] || ''; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var ARROW = '<span class="arrow" aria-hidden="true">↗</span>';

  function render() {
    $$('[data-i]').forEach(function (el) { var v = u(el.getAttribute('data-i')); if (v) el.textContent = v; });
    document.title = u('__title');
    $('#theme').setAttribute('aria-label', doc.dataset.theme === 'light' ? u('theme.dark') : u('theme.light'));
    $$('.controls [data-lang]').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });

    $('#shipped').innerHTML = S.shipped.map(function (p) {
      return '<li class="row link" data-preview="' + p.img + '"><a class="cover" href="' + p.url + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + '"></a>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(p.name) + '</span><span class="ar">' + esc(p.native) + '</span>' + ARROW + '</span><span class="d">' + esc(t(p.line)) + '</span></div>' +
        '<span class="m">' + esc(p.host) + '</span></li>';
    }).join('');

    $('#work').innerHTML = S.work.map(function (w, i) {
      return '<li class="row x' + (i === 0 ? ' open' : '') + '" tabindex="0" role="button" aria-expanded="' + (i === 0) + '">' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(t(w.role)) + '</span><span class="plus" aria-hidden="true">+</span></span><span class="d">' + esc(w.org) + '</span></div>' +
        '<span class="m">' + esc(t(w.period).replace(/ — /, '–')) + '</span>' +
        '<div class="more"><div><ul>' + t(w.pts).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div></li>';
    }).join('');

    $('#projects').innerHTML = S.projects.map(function (p) {
      return '<li class="row link"><a class="cover" href="' + p.url + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + '"></a>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(p.name) + '</span>' + ARROW + '</span><span class="d">' + esc(t(p.line)) + '</span></div>' +
        '<span class="m">' + esc(p.tags.slice(0, 2).join(' · ')) + '</span></li>';
    }).join('');
    $('#more').innerHTML = S.more.map(function (m) {
      return (m.url ? '<a href="' + m.url + '" target="_blank" rel="noopener" title="' + esc(t(m.line)) + '">' + esc(m.name) + '</a>' : '<span class="it" title="' + esc(t(m.line)) + '">' + esc(m.name) + '</span>');
    }).join(' <span class="c">/</span> ');

    $('#awards').innerHTML = S.awards.map(function (a) {
      return '<li class="row"><div class="row-main"><span class="t"><span class="rank' + (a.cls === 'gold' ? ' top' : '') + '">' + esc(a.rank) + '</span>' + esc(t(a.ev)) + '</span></div><span class="m">' + esc(a.y) + '</span></li>';
    }).join('');
    $('#certs').innerHTML = S.certs.map(function (c) {
      var label = c.n.indexOf(c.by.split(' ')[0]) === 0 ? c.n : c.by + ' ' + c.n;
      return '<span class="it">' + esc(label) + '</span>';
    }).join(' <span class="c">/</span> ');

    $('#vol').innerHTML = S.vol.map(function (v) {
      return '<li class="row"><div class="row-main"><span class="t">' + esc(t(v.n)) + '</span></div><span class="m">' + v.h + 'h</span></li>';
    }).join('');
    $('#videos').innerHTML = S.videos.map(function (v) {
      return '<a class="vid" href="https://youtu.be/' + v.id + '" target="_blank" rel="noopener"><img src="' + v.img + '" alt="" loading="lazy" width="320" height="180" /><span>' + esc(t(v.t)) + '</span></a>';
    }).join('');

    $('#moments').innerHTML = S.gallery.slice(0, 9).map(function (g, i) {
      return '<button data-k="' + i + '" aria-label="' + esc(t(g.c)) + '"><img src="' + g.img + '" alt="' + esc(t(g.c)) + '" loading="lazy" /></button>';
    }).join('');

    $('#stack').innerHTML = Object.keys(S.stack).map(function (k) {
      return '<dt>' + k.replace('_', ' / ') + '</dt><dd>' + S.stack[k].map(esc).join(', ') + '</dd>';
    }).join('');

    bindRows();
  }

  function bindRows() {
    $$('.row.x').forEach(function (r) {
      function toggle() { var o = !r.classList.contains('open'); r.classList.toggle('open', o); r.setAttribute('aria-expanded', o); }
      r.addEventListener('click', toggle);
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    $$('#moments button').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = S.gallery[+b.dataset.k], lb = $('#lightbox');
        lb.querySelector('img').src = g.img; lb.querySelector('img').alt = t(g.c); lb.querySelector('figcaption').textContent = t(g.c);
        lb.hidden = false;
      });
    });
    bindPreview();
    $$('.row').forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        var el = r.querySelector('.tx');
        if (!el) { el = r.querySelector('.t'); if (!el || el.children.length) return; }
        var txt = el.dataset.orig || (el.dataset.orig = el.textContent);
        if (/^[\x20-\x7E\u00B7\u2013\u2014\u2019]+$/.test(txt)) A.scramble(el, txt, 380);
      });
    });
  }

  // floating screenshot that follows the cursor over product rows
  var pv = $('#preview'), pvImg = pv.querySelector('img'), px = 0, py = 0, tx = 0, ty = 0, pvOn = false, pvRaf = 0;
  function pvLoop() {
    px += (tx - px) * 0.18; py += (ty - py) * 0.18;
    pv.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
    if (pvOn || Math.abs(tx - px) > 0.5) pvRaf = requestAnimationFrame(pvLoop); else pvRaf = 0;
  }
  function bindPreview() {
    $$('[data-preview]').forEach(function (r) {
      r.addEventListener('mouseenter', function (e) {
        pvImg.src = r.dataset.preview; pvOn = true; pv.classList.add('on');
        tx = e.clientX + 24; ty = e.clientY - 90; px = tx; py = ty;
        if (!pvRaf) pvLoop();
      });
      r.addEventListener('mousemove', function (e) {
        var W = pv.offsetWidth, H = pv.offsetHeight;
        tx = e.clientX + 24; ty = e.clientY - H / 2;
        if (tx + W > innerWidth - 12) tx = e.clientX - W - 24;
        ty = Math.max(12, Math.min(innerHeight - H - 12, ty));
      });
      r.addEventListener('mouseleave', function () { pvOn = false; pv.classList.remove('on'); });
    });
  }

  function setLang(l) {
    lang = l; doc.lang = l; doc.dir = l === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('langPref', l); var url = new URL(location.href); url.searchParams.set('lang', l); history.replaceState(null, '', url); } catch (e) {}
    render(); observe();
  }
  function setTheme(th) {
    doc.dataset.theme = th;
    try { localStorage.setItem('theme', th); } catch (e) {}
    $('#theme').setAttribute('aria-label', th === 'light' ? u('theme.dark') : u('theme.light'));
    if (eyesCtl) eyesCtl.redraw();
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observe() { $$('.block, .foot').forEach(function (el) { if (!el.classList.contains('rv')) el.classList.add('rv'); if (io) io.observe(el); else el.classList.add('in'); }); }
  // section labels decode once as they scroll in
  var lio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; lio.unobserve(e.target);
      var sp = e.target.querySelector('[data-i]'), txt = sp && sp.textContent;
      if (txt && /^[\x20-\x7E]+$/.test(txt)) A.scramble(sp, txt, 600);
    });
  }, { threshold: 1 }) : null;
  if (lio) $$('.label').forEach(function (l) { lio.observe(l); });

  window.APP = { setLang: function (l) { setLang(l); }, setTheme: function (th) { setTheme(th); } };

  // live footer: Riyadh clock + uptime since Dec 2014
  function clock() {
    var c = $('#clock'); if (!c) return;
    c.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour12: false });
    var now = new Date(), m = (now.getFullYear() - 2014) * 12 + now.getMonth() - 11;
    $('#uptime').textContent = Math.floor(m / 12) + 'y ' + (m % 12) + 'm';
  }

  // boot
  render();
  clock(); setInterval(clock, 1000);
  observe();
  var eyesCtl = A.eyes($('#eyes'));
  A.scramble($('#name'), 'Haitham Hattan', 1000);
  A.banner($('#sig'), 'HAITHAM HATTAN');
  $('#year').textContent = new Date().getFullYear();

  $$('.controls [data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });
  $('#theme').addEventListener('click', function () { setTheme(doc.dataset.theme === 'light' ? 'dark' : 'light'); });
  $('#copy').addEventListener('click', function () {
    var b = this;
    (navigator.clipboard ? navigator.clipboard.writeText('info@haithamhattan.sa') : Promise.reject()).then(function () {
      b.textContent = u('copied'); setTimeout(function () { b.textContent = u('copy'); }, 1600);
    }, function () { location.href = 'mailto:info@haithamhattan.sa'; });
  });
  $('#lightbox').addEventListener('click', function () { this.hidden = true; });
  $('#term-hint').addEventListener('click', function () { window.TERM && window.TERM.open(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('#lightbox').hidden = true; });
})();
