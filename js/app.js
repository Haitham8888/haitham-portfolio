/* haitham.sys — app: render from content.js, i18n (ar/en/zh), theme, command palette, interactions */
(function () {
  'use strict';
  var S = window.SITE, A = window.ASCII;
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = doc.getAttribute('lang') || 'en';
  if (!S.ui[lang]) lang = 'en';

  function t(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[lang] || o.en || '')); }
  function u(k) { return S.ui[lang][k] || S.ui.en[k] || k; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function bar(n, total, w) { var f = Math.round((n / total) * w); return '[' + '#'.repeat(f) + '·'.repeat(w - f) + ']'; }

  /* ---------------- render ---------------- */
  function renderStatic() {
    $('#ticker').innerHTML = S.ticker.concat(S.ticker).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    $$('.bin').forEach(A.banner);
    $('#year').textContent = new Date().getFullYear();
  }

  function render() {
    // short strings
    $$('[data-i]').forEach(function (el) {
      var k = el.getAttribute('data-i');
      if (el.hasAttribute('data-scramble') && el._seen) { el.textContent = u(k); return; }
      el.textContent = u(k);
    });
    $$('[data-i-ph]').forEach(function (el) { el.setAttribute('placeholder', u(el.getAttribute('data-i-ph'))); });
    $$('[data-i-aria]').forEach(function (el) { el.setAttribute('aria-label', u(el.getAttribute('data-i-aria'))); });
    document.title = u('__title');

    // stats
    $('#stats').innerHTML = S.stats.map(function (s) { return '<div class="rv"><dt>' + esc(s.v) + '</dt><dd>' + esc(t(s.l)) + '</dd></div>'; }).join('');

    // shipped
    $('#shipped-grid').innerHTML = S.shipped.map(function (p) {
      return '<article class="card ship frame rv"><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i>' +
        '<div class="chrome"><span class="dots"><i></i><i></i><i></i></span><span class="url">https://<b>' + esc(p.host) + '</b></span><span class="live-dot">' + esc(u('live')) + '</span></div>' +
        '<a class="shot" href="' + p.url + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + '"><img src="' + p.img + '" alt="' + esc(p.name + ' — ' + t(p.line)) + '" loading="lazy" width="1200" height="750" /></a>' +
        '<div class="ship-body"><div class="ship-name"><h3>' + esc(p.name) + '</h3><span>' + esc(p.native) + '</span></div>' +
        '<p class="line">' + esc(t(p.line)) + '</p><p class="note">' + esc(t(p.note)) + '</p>' +
        '<div class="tags">' + p.tags.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<div class="ship-foot"><span class="cmd">' + esc(p.host) + '</span><a class="go" href="' + p.url + '" target="_blank" rel="noopener">' + esc(u('visit')) + '</a></div></div></article>';
    }).join('');

    // git log
    $('#gitlog').innerHTML = S.work.map(function (w, i) {
      return '<li class="gl rv' + (w.now ? ' now' : '') + (w.edu ? ' edu' : '') + (i === 0 ? ' open' : '') + '"><span class="node" aria-hidden="true"></span><div class="gl-main">' +
        '<button class="gl-head" aria-expanded="' + (i === 0) + '"><span class="gl-hash">' + w.hash + '</span>' +
        '<span class="gl-title"><b>' + esc(t(w.role)) + '</b><span>' + esc(w.org) + '</span></span>' +
        '<span class="gl-time">' + esc(t(w.period)) + ' <span class="tog" aria-hidden="true">+</span></span></button>' +
        '<div class="gl-body"><ul>' + t(w.pts).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div></li>';
    }).join('');

    // projects
    $('#projects-grid').innerHTML = S.projects.map(function (p) {
      return '<a class="card proj frame rv' + (p.feat ? ' feat' : '') + '" href="' + p.url + '" target="_blank" rel="noopener">' +
        '<i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i>' +
        '<div class="proj-top"><h3 data-scramble-hover>' + esc(p.name) + '</h3><span class="arrow">↗</span></div>' +
        '<p>' + esc(t(p.line)) + '</p><div class="tags">' + p.tags.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
        (p.feat ? '<pre class="glyphs" aria-hidden="true">' + glyphBlock() + '</pre>' : '') + '</a>';
    }).join('');
    $('#more-list').innerHTML = S.more.map(function (m) {
      var n = m.url ? '<a class="n" href="' + m.url + '" target="_blank" rel="noopener">' + esc(m.name) + '</a>' : '<span class="n">' + esc(m.name) + '</span>';
      return '<li class="rv">' + n + '<span class="d">' + esc(t(m.line)) + '</span></li>';
    }).join('');

    // awards
    $('#awards-body').innerHTML = S.awards.map(function (a) {
      return '<tr><td><span class="rank ' + a.cls + '">' + esc(a.rank) + '</span></td><td class="ev">' + esc(t(a.ev)) + '</td><td>' + esc(a.y) + '</td></tr>';
    }).join('');
    $('#certs').innerHTML = S.certs.map(function (c) { return '<li><b>' + esc(c.by) + '</b>' + esc(c.n) + '</li>'; }).join('');

    // stack.json
    var keys = Object.keys(S.stack), lines = ['<span class="p">{</span>'];
    keys.forEach(function (k, i) {
      var vals = S.stack[k].map(function (v) { return '<span class="s">"' + esc(v) + '"</span>'; }).join('<span class="p">, </span>');
      lines.push('  <span class="k">"' + k + '"</span><span class="p">: [</span>' + vals + '<span class="p">]' + (i < keys.length - 1 ? ',' : '') + '</span>');
    });
    lines.push('<span class="p">}</span>');
    $('#stack-json').innerHTML = lines.map(function (l, i) { return '<span class="ln">' + (i + 1) + '</span>' + l; }).join('\n');

    // talks
    $('#videos').innerHTML = S.videos.map(function (v) {
      return '<a class="vid" href="https://youtu.be/' + v.id + '" target="_blank" rel="noopener"><span class="th"><img src="' + v.img + '" alt="" loading="lazy" /></span><span>' + esc(t(v.t)) + '</span></a>';
    }).join('');
    $('#courses').innerHTML = S.courses.map(function (c) { return '<li><span class="n">' + esc(t(c.n)) + '</span><span class="d">' + esc(t(c.w)) + '</span></li>'; }).join('');
    $('#vol').innerHTML = S.vol.map(function (v) {
      return '<li><div class="vt"><span>' + esc(t(v.n)) + '</span><b>' + v.h + 'h</b></div><div class="vb" data-h="' + v.h + '">' + bar(0, 300, 30) + '</div></li>';
    }).join('');
    var q = S.quotes.map(function (x) { return '<figure class="quote"><p>' + esc(t(x.q)) + '</p><span>— ' + esc(x.who) + '</span></figure>'; }).join('');
    $('#quotes').innerHTML = q + q.replace(/<figure class="quote">/g, '<figure class="quote" aria-hidden="true">');

    // gallery
    $('#gallery-grid').innerHTML = S.gallery.map(function (g, i) {
      return '<figure class="rv" tabindex="0" data-i="' + i + '"><img src="' + g.img + '" alt="' + esc(t(g.c)) + '" loading="lazy" /><figcaption>' + esc(t(g.c)) + '</figcaption></figure>';
    }).join('');

    bindDynamic();
    observeReveal();
    $$('.lang button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === lang); b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang); });
  }

  function glyphBlock() {
    var s = '', chars = '01·:+*#';
    for (var y = 0; y < 9; y++) { for (var x = 0; x < 34; x++) s += chars[(x * 7 + y * 11 + x * y) % chars.length]; s += '\n'; }
    return s;
  }

  /* ---------------- interactions ---------------- */
  function bindDynamic() {
    $$('.gl-head').forEach(function (b) {
      b.addEventListener('click', function () {
        var li = b.closest('.gl'), open = !li.classList.contains('open');
        li.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
      });
    });
    $$('[data-scramble-hover]').forEach(function (el) {
      var host = el.closest('a') || el, txt = el.textContent;
      host.addEventListener('mouseenter', function () { A.scramble(el, txt, 520); });
    });
    $$('#gallery-grid figure').forEach(function (f) {
      function open() { var g = S.gallery[+f.getAttribute('data-i')]; lightbox(g.img, t(g.c)); }
      f.addEventListener('click', open);
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });
    // ascii bars for volunteering
    $$('.vb').forEach(function (el) {
      var h = +el.getAttribute('data-h'), done = false;
      if (!('IntersectionObserver' in window)) { el.textContent = bar(h, 300, 30); return; }
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting || done) return; done = true; io.disconnect();
        var n = 0, target = Math.round(h / 300 * 30);
        var iv = setInterval(function () { n++; el.textContent = bar(Math.min(n, target), 30, 30); if (n >= target) clearInterval(iv); }, 30);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }) : null;
  function observeReveal() {
    $$('.rv:not(.in)').forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 55 + 'ms';
      if (revealIO) revealIO.observe(el); else el.classList.add('in');
    });
  }

  function setLang(l) {
    if (!S.ui[l]) return;
    lang = l;
    doc.setAttribute('lang', l);
    doc.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
    try { localStorage.setItem('langPref', l); var url = new URL(location.href); url.searchParams.set('lang', l); history.replaceState(null, '', url); } catch (e) {}
    render();
    if (fieldCtl) fieldCtl.refresh();
  }

  function setTheme(th) {
    doc.setAttribute('data-theme', th);
    try { localStorage.setItem('theme', th); } catch (e) {}
    $('#theme-toggle').setAttribute('aria-label', th === 'dark' ? u('theme.light') : u('theme.dark'));
    requestAnimationFrame(function () { A.retheme(); if (fieldCtl) fieldCtl.refresh(); });
  }
  function toggleTheme() { setTheme(doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }

  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  function lightbox(src, cap) {
    var lb = $('#lightbox'); $('#lb-img').src = src; $('#lb-img').alt = cap; $('#lb-cap').textContent = cap;
    lb.hidden = false; $('#lb-close').focus();
  }

  /* ---------------- command palette ---------------- */
  var cmds = function () {
    var go = function (id) { return function () { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; };
    return [
      { c: 'cd ~', l: 'home', run: go('top') },
      { c: 'cd shipped', l: u('nav.shipped'), run: go('shipped') },
      { c: 'git log', l: u('nav.work'), run: go('work') },
      { c: 'ls projects', l: u('nav.projects'), run: go('projects') },
      { c: 'cat awards', l: u('nav.awards'), run: go('awards') },
      { c: 'cat stack.json', l: u('sec.stack'), run: go('stack') },
      { c: 'youtube', l: u('nav.talks'), run: go('talks') },
      { c: 'open gallery', l: u('nav.gallery'), run: go('gallery') },
      { c: 'mail', l: u('nav.contact'), run: go('contact') },
      { c: 'wget cv.pdf', l: u('cta.cv'), run: function () { location.href = 'img/CV_HaithamHattan_ATS.pdf'; } },
      { c: 'theme --toggle', l: doc.getAttribute('data-theme') === 'light' ? u('theme.dark') : u('theme.light'), run: toggleTheme },
      { c: 'lang ar', l: 'العربية', run: function () { setLang('ar'); } },
      { c: 'lang en', l: 'English', run: function () { setLang('en'); } },
      { c: 'lang zh', l: '中文', run: function () { setLang('zh'); } },
      { c: 'open github', l: 'GitHub', run: function () { window.open('https://github.com/haitham8888', '_blank', 'noopener'); } },
      { c: 'open linkedin', l: 'LinkedIn', run: function () { window.open('https://www.linkedin.com/in/haithamhattan/', '_blank', 'noopener'); } }
    ];
  };
  var sel = 0, shown = [];
  function openCmd() {
    var box = $('#cmdk'); box.hidden = false; var inp = $('#cmdk-input'); inp.value = ''; filterCmd(''); inp.focus();
  }
  function closeCmd() { $('#cmdk').hidden = true; }
  function filterCmd(q) {
    q = q.toLowerCase().trim();
    shown = cmds().filter(function (c) { return !q || c.c.indexOf(q) >= 0 || c.l.toLowerCase().indexOf(q) >= 0; });
    sel = 0; paintCmd();
  }
  function paintCmd() {
    $('#cmdk-list').innerHTML = shown.map(function (c, i) {
      return '<li role="option" data-k="' + i + '" class="' + (i === sel ? 'sel' : '') + '" aria-selected="' + (i === sel) + '"><span>' + esc(c.l) + '</span><span class="c">' + esc(c.c) + '</span></li>';
    }).join('');
    var s = $('#cmdk-list .sel'); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  function runCmd(i) { var c = shown[i]; if (!c) return; closeCmd(); c.run(); }

  /* ---------------- boot ---------------- */
  function boot() {
    var el = $('#boot'), log = $('#boot-log');
    var seen = false;
    try { seen = sessionStorage.getItem('booted') === '1'; sessionStorage.setItem('booted', '1'); } catch (e) {}
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    el.classList.add('on');
    var lines = ['<b>haitham.sys</b> v26.11 — booting', '[ ok ] mount /portfolio', '[ ok ] load glyph ramp  0-9 a-z', '[ ok ] calibrate ascii renderer', '[ ok ] ready → welcome'];
    return new Promise(function (res) {
      var i = 0, done = false;
      function finish() { if (done) return; done = true; el.classList.add('out'); setTimeout(function () { el.classList.remove('on', 'out'); res(); }, 450); }
      el.addEventListener('click', finish);
      (function next() {
        if (done) return;
        log.innerHTML += (i ? '\n' : '') + lines[i];
        i++;
        if (i < lines.length) setTimeout(next, 150); else setTimeout(finish, 260);
      })();
    });
  }

  /* ---------------- init ---------------- */
  var fieldCtl = null;
  renderStatic();
  render();

  boot().then(function () {
    var name = $('#hero-name');
    A.scramble(name, 'Haitham Hattan', 1100);
  });

  if ($('#field')) fieldCtl = A.field($('#field'));
  A.portrait($('#portrait')).catch(function () { $('#portrait-frame').style.display = 'none'; });
  $$('.photo-ascii').forEach(A.photo);

  // scramble section titles once when they appear
  if ('IntersectionObserver' in window) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        hio.unobserve(e.target); e.target._seen = true;
        A.scramble(e.target, e.target.textContent, 700);
      });
    }, { threshold: 0.6 });
    $$('.sec-h h2').forEach(function (h) { hio.observe(h); });
  }

  // controls
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  $('#theme-toggle').addEventListener('click', toggleTheme);
  setTheme(doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  var burger = $('#burger'), drawer = $('#drawer');
  burger.addEventListener('click', function () { var o = drawer.hidden; drawer.hidden = !o; burger.setAttribute('aria-expanded', o); });
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); }); });

  $('#copy-mail').addEventListener('click', function () {
    var m = 'info@haithamhattan.sa';
    (navigator.clipboard ? navigator.clipboard.writeText(m) : Promise.reject()).then(function () { toast(u('contact.copied')); }, function () { location.href = 'mailto:' + m; });
  });
  var mail = $('#mail'); mail.addEventListener('mouseenter', function () { A.scramble(mail, 'info@haithamhattan.sa', 600); });

  $('#cmd-open').addEventListener('click', openCmd);
  $('#cmdk').addEventListener('click', function (e) { if (e.target.id === 'cmdk') closeCmd(); });
  $('#cmdk-input').addEventListener('input', function (e) { filterCmd(e.target.value); });
  $('#cmdk-list').addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) runCmd(+li.getAttribute('data-k')); });
  $('#cmdk-input').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); paintCmd(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); paintCmd(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmd(sel); }
  });
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea/i.test((e.target.tagName || ''));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#cmdk').hidden ? openCmd() : closeCmd(); }
    else if (e.key === '/' && !typing && $('#cmdk').hidden) { e.preventDefault(); openCmd(); }
    else if (e.key === 'Escape') { closeCmd(); $('#lightbox').hidden = true; }
  });
  $('#lb-close').addEventListener('click', function () { $('#lightbox').hidden = true; });
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') $('#lightbox').hidden = true; });

  // scroll: nav state, progress, active link, to-top
  var nav = $('#nav'), prog = $('#progress-bar'), toTop = $('#to-top');
  var ids = ['shipped', 'work', 'projects', 'awards', 'talks', 'gallery', 'contact'];
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    toTop.classList.toggle('show', y > 700);
    var cur = '';
    ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.offsetTop <= y + innerHeight / 3) cur = id; });
    $$('.links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
