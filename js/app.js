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
    var nm = $('#name'); if (nm && !nm._busy) nm.textContent = u('name');
    $('#theme').setAttribute('aria-label', doc.dataset.theme === 'light' ? u('theme.dark') : u('theme.light'));
    $$('.controls [data-lang]').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });

    $('#shipped').innerHTML = S.shipped.map(function (p, i) {
      return '<li class="row link" data-href="' + p.url + '" data-preview="' + p.img + '"><a class="cover" href="' + p.url + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + '"></a>' +
        '<span class="glyph" data-k="ship-' + i + '"></span>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(p.name) + '</span><span class="ar">' + esc(p.native) + '</span>' + ARROW + '</span><span class="d">' + esc(t(p.line)) + '</span></div>' +
        '<span class="m">' + esc(p.host) + '</span></li>';
    }).join('');

    $('#work').innerHTML = S.work.map(function (w, i) {
      return '<li class="row x' + (i === 0 ? ' open' : '') + '"' + ((w.url || orgUrl(w.org)) ? ' data-href="' + (w.url || orgUrl(w.org)) + '"' : '') + ' tabindex="0" role="button" aria-expanded="' + (i === 0) + '">' +
        '<span class="glyph" data-k="work-' + i + '"></span>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(t(w.role)) + '</span><span class="plus" aria-hidden="true">+</span></span><span class="d">' + esc(w.org) + '</span>' + (w.path ? '<span class="path" dir="auto">' + esc(t(w.path)) + '</span>' : '') + '</div>' +
        '<span class="m">' + esc(t(w.period).replace(/ — /, '–')) + '</span>' +
        '<div class="more"><div><ul>' + t(w.pts).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div></li>';
    }).join('');

    $('#projects').innerHTML = S.projects.map(function (p, i) {
      return '<li class="row link" data-href="' + p.url + '"><a class="cover" href="' + p.url + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + '"></a>' +
        '<span class="glyph" data-k="proj-' + i + '"></span>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(p.name) + '</span>' + ARROW + '</span><span class="d">' + esc(t(p.line)) + '</span></div>' +
        '<span class="m">' + esc(p.tags.slice(0, 2).join(' · ')) + '</span></li>';
    }).join('');
    $('#more').innerHTML = S.more.map(function (m, i) {
      return '<span class="tile" data-k="more-' + i + '" title="' + esc(t(m.line)) + '"><span class="tile-n">' + esc(m.name) + '</span></span>';
    }).join('');

    $('#awards').innerHTML = S.awards.map(function (a) {
      return '<li class="row"' + (awardUrl(a) ? ' data-href="' + awardUrl(a) + '"' : '') + '><div class="row-main"><span class="t"><span class="rank' + (a.cls === 'gold' ? ' top' : '') + '">' + esc(a.rank) + '</span>' + esc(t(a.ev)) + '</span></div><span class="m">' + esc(a.y) + '</span></li>';
    }).join('');
    $('#certs').innerHTML = S.certs.map(function (c) {
      var label = c.n.indexOf(c.by.split(' ')[0]) === 0 ? c.n : c.by + ' ' + c.n;
      return '<span class="it">' + esc(label) + '</span>';
    }).join(' <span class="c">/</span> ');

    $('#vol').innerHTML = S.vol.map(function (v, i) {
      return '<li class="row"' + (v.url ? ' data-href="' + v.url + '"' : '') + '><span class="glyph" data-k="vol-' + i + '"></span><div class="row-main"><span class="t">' + esc(t(v.n)) + '</span></div><span class="m">' + (v.h ? v.h + 'h · ' : '') + v.p + '</span></li>';
    }).join('');
    $('#orgs').innerHTML = S.orgs.map(function (o, i) {
      return '<span class="tile" data-k="org-' + i + '"><span class="tile-n">' + esc(o.n) + '</span></span>';
    }).join('');
    $('#videos').innerHTML = S.videos.map(function (v) {
      return '<a class="vid" href="https://youtu.be/' + v.id + '" target="_blank" rel="noopener"><span class="vid-th"><img src="' + v.img + '" alt="" loading="lazy" width="320" height="180" />' + (v.views ? '<b class="vid-v">' + fmtViews(v.views) + ' ' + esc(u('views')) + '</b>' : '') + '</span><span>' + esc(t(v.t)) + '</span></a>';
    }).join('');
    $('#voice-stats').innerHTML = S.voices.map(function (v) { return '<div><dt>' + esc(v.v) + '</dt><dd>' + esc(t(v.l)) + '</dd></div>'; }).join('');
    $('#quotes').innerHTML = S.quotes.map(function (q) {
      return '<figure class="quote"><span class="q-mark" aria-hidden="true">&gt;_</span><blockquote>' + esc(t(q.q)) + '</blockquote><figcaption><b>' + esc(q.who) + '</b><span>' + esc(t(q.at)) + '</span></figcaption></figure>';
    }).join('');
    $('#lab').innerHTML = S.lab.map(function (m, i) {
      return '<li class="row link" data-href="' + m.url + '"><a class="cover" href="' + m.url + '" target="_blank" rel="noopener" aria-label="' + esc(m.n) + '"></a><span class="glyph" data-k="lab-' + i + '"></span>' +
        '<div class="row-main"><span class="t"><span class="tx">' + esc(m.n) + '</span><span class="by">' + esc(m.by) + '</span>' + ARROW + '</span><span class="d">' + esc(t(m.d)) + '</span></div><span class="m">' + esc(m.tag) + '</span></li>';
    }).join('');

    $('#moments').innerHTML = S.gallery.slice(0, 9).map(function (g, i) {
      return '<button data-k="' + i + '" aria-label="' + esc(t(g.c)) + '"><img src="' + g.img + '" alt="' + esc(t(g.c)) + '" loading="lazy" /></button>';
    }).join('');

    $('#stack').innerHTML = Object.keys(S.stack).map(function (k) {
      return '<dt>' + k.replace('_', ' / ') + '</dt><dd>' + S.stack[k].map(esc).join(', ') + '</dd>';
    }).join('');

    $('#stack-tiles').innerHTML = TECH_GROUPS.map(function (g, gi) {
      return '<div class="tg"><span class="tg-l">' + g[0] + '</span><div class="tiles sm">' + g[1].map(function (k) {
        return '<span class="tile" data-k="tech-' + k + '"><span class="tile-n">' + esc((window.ICONS[k] || {}).n || k) + '</span></span>';
      }).join('') + '</div></div>';
    }).join('');

    bindRows();
    glyphs();
    if (A.photos) A.photos();
  }

  // ---------- ASCII glyph tiles spread through the page (each in its own colour) ----------
  var LOGOS = { Maysour: 'img/logos/maysour.webp', Hayyiz: 'img/logos/hayyiz.svg', 'G-Care': 'img/logos/gcare.svg' };
  var MORE_LOGOS = { MNBET: 'img/MNBET.png', SANKA: 'img/Sanka.png', Waselani: 'img/Waselani.png', MNHAL: 'img/MNHAL.png' };
  var PROJ_COLORS = ['#e5e5e5', '#4ade80', '#a5b4fc', '#fbbf24', '#f472b6', '#67e8f9'];
  var TECH_URL = { nvidia: 'https://www.nvidia.com/', redhat: 'https://www.redhat.com/', linux: 'https://www.kernel.org/', pytorch: 'https://pytorch.org/', huggingface: 'https://huggingface.co/', kubernetes: 'https://kubernetes.io/', docker: 'https://www.docker.com/', python: 'https://www.python.org/', rust: 'https://www.rust-lang.org/' };
  function orgUrl(org) {
    if (/MDS/.test(org)) return 'https://mdscs.sa/';
    if (/HackerRank/.test(org)) return 'https://www.hackerrank.com/';
    if (/Jazan University/.test(org)) return 'https://www.jazanu.edu.sa/';
    return '';
  }
  function awardUrl(a) {
    var e = a.ev.en;
    if (/MDS/.test(e)) return 'https://mdscs.sa/';
    if (/AlJazira/.test(e)) return 'https://www.bankaljazira.com/';
    if (/Jazan University/.test(e)) return 'https://www.jazanu.edu.sa/';
    if (/Monsha/.test(e)) return 'https://www.monshaat.gov.sa/';
    if (/Albilad/.test(e)) return 'https://www.bankalbilad.com/';
    if (/King Saud/.test(e)) return 'https://ksu.edu.sa/';
    if (/Royal Commission/.test(e)) return 'https://www.rcjy.gov.sa/';
    return '';
  }
  var TECH_GROUPS = [
    ['ai', ['nvidia', 'pytorch', 'huggingface', 'openai', 'langchain', 'milvus', 'onnx', 'opencv']],
    ['languages', ['python', 'rust', 'cplusplus', 'c', 'openjdk', 'kotlin', 'swift', 'dart', 'typescript', 'javascript', 'php', 'gnubash', 'html5', 'css3', 'sass']],
    ['backend · data', ['fastapi', 'springboot', 'nodedotjs', 'bun', 'postgresql', 'mysql', 'mongodb', 'sqlite', 'firebase']],
    ['enterprise · web', ['hcl', 'esri', 'flutter', 'solid', 'vite', 'figma']],
    ['infra', ['linux', 'redhat', 'docker', 'podman', 'kubernetes', 'helm', 'git', 'github', 'githubcopilot', 'postman', 'cmake']],
    ['security', ['kalilinux', 'wireshark', 'burpsuite', 'owasp', 'metasploit']]
  ];
  Object.assign(TECH_URL, { openai: 'https://openai.com/', langchain: 'https://www.langchain.com/', milvus: 'https://milvus.io/', onnx: 'https://onnx.ai/', opencv: 'https://opencv.org/', cplusplus: 'https://isocpp.org/', c: 'https://en.cppreference.com/w/c', openjdk: 'https://openjdk.org/', kotlin: 'https://kotlinlang.org/', swift: 'https://www.swift.org/', dart: 'https://dart.dev/', typescript: 'https://www.typescriptlang.org/', javascript: 'https://developer.mozilla.org/docs/Web/JavaScript', php: 'https://www.php.net/', gnubash: 'https://www.gnu.org/software/bash/', html5: 'https://developer.mozilla.org/docs/Web/HTML', css3: 'https://developer.mozilla.org/docs/Web/CSS', sass: 'https://sass-lang.com/', fastapi: 'https://fastapi.tiangolo.com/', springboot: 'https://spring.io/projects/spring-boot', nodedotjs: 'https://nodejs.org/', bun: 'https://bun.sh/', postgresql: 'https://www.postgresql.org/', mysql: 'https://www.mysql.com/', mongodb: 'https://www.mongodb.com/', sqlite: 'https://www.sqlite.org/', firebase: 'https://firebase.google.com/', hcl: 'https://www.hcl-software.com/dx', esri: 'https://www.esri.com/', flutter: 'https://flutter.dev/', solid: 'https://www.solidjs.com/', vite: 'https://vite.dev/', figma: 'https://www.figma.com/', podman: 'https://podman.io/', helm: 'https://helm.sh/', git: 'https://git-scm.com/', github: 'https://github.com/haitham8888', githubcopilot: 'https://github.com/features/copilot', postman: 'https://www.postman.com/', cmake: 'https://cmake.org/', kalilinux: 'https://www.kali.org/', wireshark: 'https://www.wireshark.org/', burpsuite: 'https://portswigger.net/burp', owasp: 'https://owasp.org/', metasploit: 'https://www.metasploit.com/' });
  var TECH = ['nvidia', 'redhat', 'linux', 'pytorch', 'huggingface', 'kubernetes', 'docker', 'python', 'rust'];
  function fmtViews(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + 'K' : String(n); }
  var LAB = {
    allam: { src: 'img/logos/allam.webp' }, deepseek: { src: 'img/logos/deepseek.webp' }, qwen: { src: 'img/logos/qwen.webp' }, glm: { src: 'img/logos/glm.webp', keepWhite: true },
    paddle: { src: 'img/logos/paddle-mark.webp' }, baidu: { src: 'img/logos/baidu.webp' }, face: { text: '\u25c9', color: '#67e8f9' }, rag: { icon: 'milvus' }, sql: { text: 'SQL', color: '#7dd3fc' },
    pi: { text: '\u03c0', color: '#f5f5f5' }, opencode: { text: '{ }', color: '#a3e635' }, mcp: { text: 'MCP', color: '#4ade80' }, claude: { text: '>_', color: '#e8a17a' }
  };
  var ROW = 52;
  // Maysour mark redrawn as vectors: four leaves fanning up-left, light to deep green, with clean gaps
  function drawMaysour(x, n) {
    var L = [
      { lx: 0.46, ty: 0.02, c: '#4f7a22' }, { lx: 0.30, ty: 0.15, c: '#64922b' },
      { lx: 0.14, ty: 0.36, c: '#7aab33' }, { lx: 0.02, ty: 0.62, c: '#9cc93f' }
    ];
    x.save(); x.scale(n, n);
    L.forEach(function (l) {
      x.beginPath();
      x.moveTo(l.lx, l.ty + 0.36 * (1 - l.ty) );
      x.quadraticCurveTo(l.lx - 0.01, l.ty + 0.02, l.lx + 0.06, l.ty);
      x.quadraticCurveTo(l.lx + 0.42, l.ty + 0.10, 0.98, 0.80);
      x.quadraticCurveTo(1.0, 0.95, 0.88, 0.98);
      x.lineTo(l.lx + 0.10, 0.98 - (1 - l.ty) * 0.02);
      x.quadraticCurveTo(l.lx, 0.98, l.lx, l.ty + 0.36 * (1 - l.ty));
      x.closePath();
      x.globalCompositeOperation = 'destination-out'; x.lineWidth = 0.06; x.stroke();
      x.globalCompositeOperation = 'source-over'; x.fillStyle = l.c; x.fill();
    });
    x.restore();
  }
  function glyphs() {
    var G = window.GLYPH; if (!G) return;
    S.shipped.forEach(function (p, i) { var el = document.querySelector('[data-k="ship-' + i + '"]'); if (el) G.tile(el, p.name === 'Maysour' ? { draw: drawMaysour, size: ROW, hover: el.closest('.row') } : { src: LOGOS[p.name], size: ROW, hover: el.closest('.row') }); });
    S.projects.forEach(function (p, i) { var el = document.querySelector('[data-k="proj-' + i + '"]'); if (el) G.tile(el, { text: p.name.charAt(0), color: PROJ_COLORS[i % PROJ_COLORS.length], size: ROW, hover: el.closest('.row') }); });
    S.more.forEach(function (m, i) {
      var el = document.querySelector('[data-k="more-' + i + '"]'); if (!el) return;
      G.tile(el, MORE_LOGOS[m.name] ? { src: MORE_LOGOS[m.name], size: 50, throwable: true, bounds: '.block', href: m.url || undefined } : { text: m.name.charAt(0), color: '#a5b4fc', size: 50, throwable: true, bounds: '.block', href: m.url || undefined });
    });
    S.lab.forEach(function (m, i) {
      var el = document.querySelector('[data-k="lab-' + i + '"]'); if (!el) return;
      var o = Object.assign({}, LAB[m.k] || { text: m.n.charAt(0) });
      if (o.icon) o.icon = window.ICONS[o.icon];
      G.tile(el, Object.assign(o, { size: ROW, hover: el.closest('.row') }));
    });
    S.work.forEach(function (w, i) { var el = document.querySelector('[data-k="work-' + i + '"]'); if (el && w.logo) G.tile(el, Object.assign(orgLogo(w.logo), { size: ROW, hover: el.closest('.row') })); });
    S.vol.forEach(function (v, i) { var el = document.querySelector('[data-k="vol-' + i + '"]'); if (el) G.tile(el, Object.assign(orgLogo(v.logo), { size: ROW, hover: el.closest('.row') })); });
    S.orgs.forEach(function (o, i) { var el = document.querySelector('[data-k="org-' + i + '"]'); if (el) G.tile(el, Object.assign(orgLogo(o.k), { size: 50, throwable: true, bounds: '.block', href: o.url })); });
    TECH_GROUPS.forEach(function (g) { g[1].forEach(function (k) { var el = document.querySelector('[data-k="tech-' + k + '"]'); if (el && window.ICONS[k]) G.tile(el, { icon: window.ICONS[k], size: 36, throwable: true, bounds: '.block', href: TECH_URL[k] }); }); });
  }
  // organisation marks — real colours, ASCII-rendered
  function orgLogo(k) {
    var src = { misk: 'img/logos/misk.webp', rcjy: 'img/logos/rcjy.webp', mds: 'img/logos/mds-mark.webp', stc: 'img/logos/stc.webp', ehealth: 'img/logos/ehealth.webp', hrsd: 'img/logos/hrsd.webp', fadatech: 'img/logos/fadatech.webp', attaa: 'img/logos/attaa.webp', jazan: 'img/logos/jazan-university.png' }[k];
    if (src) return { src: src, keepWhite: k === 'rcjy' || k === 'hrsd' };
    if (k === 'hackerrank') return { icon: window.ICONS.hackerrank };
    if (k === 'ms') return { draw: function (x, n) { var g = n * 0.06, q = (n - g * 3) / 2; [['#f25022', 0, 0], ['#7fba00', 1, 0], ['#00a4ef', 0, 1], ['#ffb900', 1, 1]].forEach(function (c) { x.fillStyle = c[0]; x.fillRect(g + c[1] * (q + g), g + c[2] * (q + g), q, q); }); } };
    if (k === 'gdsc') return { draw: function (x, n) {
      x.lineCap = 'round'; x.lineWidth = n * 0.16;
      [['#ea4335', 0.42, 0.3, 0.16, 0.5], ['#4285f4', 0.16, 0.5, 0.42, 0.7], ['#34a853', 0.58, 0.3, 0.84, 0.5], ['#fbbc04', 0.84, 0.5, 0.58, 0.7]].forEach(function (s) {
        x.strokeStyle = s[0]; x.beginPath(); x.moveTo(n * s[1], n * s[2]); x.lineTo(n * s[3], n * s[4]); x.stroke();
      }); } };
    return { text: 'F', color: '#e5e5e5' };
  }
  function originGlyphs() {
    var G = window.GLYPH; if (!G) return;
    G.tile($('#g-uni'), { src: 'img/logos/jazan-university.png', size: 48, cols: 20, hover: $('#g-uni').closest('.row') });
    // Jazan: a Khawlani coffee bean
    G.tile($('#g-jz'), { size: 48, cols: 18, hover: $('#g-jz').closest('.row'), draw: function (x, n) {
      x.save(); x.translate(n / 2, n / 2); x.rotate(-0.5);
      x.fillStyle = '#b5773f'; x.beginPath(); x.ellipse(0, 0, n * 0.3, n * 0.42, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(0,0,0,1)'; x.globalCompositeOperation = 'destination-out'; x.lineWidth = n * 0.09;
      x.beginPath(); x.moveTo(0, -n * 0.4); x.bezierCurveTo(-n * 0.14, -n * 0.12, n * 0.14, n * 0.12, 0, n * 0.4); x.stroke(); x.restore();
    } });
    // Riyadh: the Kingdom Centre tower
    G.tile($('#g-ry'), { size: 48, cols: 18, hover: $('#g-ry').closest('.row'), draw: function (x, n) {
      x.fillStyle = '#9fd8b4';
      x.beginPath(); x.moveTo(n * 0.3, n); x.lineTo(n * 0.36, n * 0.2); x.quadraticCurveTo(n * 0.5, n * 0.02, n * 0.64, n * 0.2); x.lineTo(n * 0.7, n); x.closePath(); x.fill();
      x.globalCompositeOperation = 'destination-out';
      x.beginPath(); x.moveTo(n * 0.42, n * 0.42); x.quadraticCurveTo(n * 0.5, n * 0.14, n * 0.58, n * 0.42); x.closePath(); x.fill();
      x.fillRect(n * 0.47, n * 0.48, n * 0.06, n * 0.48);
    } });
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
    if (window.GLYPH) window.GLYPH.repaint();
    if (window.FLAG) window.FLAG.redraw();
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
  originGlyphs();
  clock(); setInterval(clock, 1000);
  observe();
  var eyesCtl = A.eyes($('#eyes'));
  if (lang !== 'ar') { $('#name')._busy = true; A.scramble($('#name'), u('name'), 1000); setTimeout(function () { $('#name')._busy = false; }, 1100); }
  A.banner($('#sig'), 'AL-HAITHAM');
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
