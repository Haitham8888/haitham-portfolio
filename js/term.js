/* A small real terminal. Open with ` (backtick), Ctrl/⌘+K or the >_ button. */
(function () {
  'use strict';
  var S = window.SITE;
  var box = document.getElementById('term'), out = document.getElementById('term-out'), input = document.getElementById('term-input');
  if (!box) return;
  var hist = [], hi = 0, opened = false;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function en(o) { return typeof o === 'string' ? o : (o.en || ''); }
  function print(html, cls) { var d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : ''); d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function link(href, text) { return '<a href="' + href + '" target="_blank" rel="noopener">' + esc(text) + '</a>'; }
  function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(1, n - s.length)); }

  var since = new Date(2014, 11, 1);
  function uptime() {
    var now = new Date(), m = (now.getFullYear() - since.getFullYear()) * 12 + now.getMonth() - since.getMonth();
    return Math.floor(m / 12) + 'y ' + (m % 12) + 'm';
  }

  var C = {
    help: { d: 'list commands', f: function () {
      Object.keys(C).filter(function (k) { return !C[k].hide; }).forEach(function (k) { print('<span class="k">' + pad(k, 12) + '</span><span class="m">' + C[k].d + '</span>'); });
    } },
    whoami: { d: 'who is this', f: function () {
      print('<b>Haitham Hattan</b> — AI Engineer &amp; Full-Stack Software Engineer');
      print('<span class="m">private on-prem AI · RAG · LLMs on H100/H200 · enterprise systems · Riyadh, SA</span>');
    } },
    latest: { d: 'newest wins', f: function () {
      print('<span class="k">[2026]</span> 3rd place — Mubtakaroon FinTech Hackathon · Bank AlJazira');
      print('<span class="k">[2×  ]</span> Employee of the Year — MDS CS · Q4 2025 &amp; Q1 2026');
    } },
    shipped: { d: 'live products', f: function () {
      S.shipped.forEach(function (p) { print('<span class="k">' + pad(p.name, 10) + '</span>' + link(p.url, p.host) + ' <span class="m">— ' + esc(en(p.line)) + '</span>'); });
    } },
    work: { d: 'career log', f: function () {
      S.work.forEach(function (w) { print('<span class="h">' + w.hash + '</span> ' + esc(en(w.role)) + ' <span class="m">@ ' + esc(w.org) + ' · ' + esc(en(w.period)) + '</span>'); });
    } },
    projects: { d: 'open-source work', f: function () {
      S.projects.forEach(function (p) { print('<span class="k">' + pad(p.name, 13) + '</span>' + esc(en(p.line)) + ' ' + link(p.url, '↗')); });
    } },
    awards: { d: 'hall of fame', f: function () {
      S.awards.forEach(function (a) { print('<span class="k">' + pad(a.rank, 5) + '</span>' + esc(en(a.ev)) + ' <span class="m">' + a.y + '</span>'); });
    } },
    stack: { d: 'tools I use', f: function () {
      Object.keys(S.stack).forEach(function (k) { print('<span class="k">' + pad(k, 12) + '</span>' + esc(S.stack[k].join(', '))); });
    } },
    contact: { d: 'reach me', f: function () {
      print('<span class="k">email     </span>' + link('mailto:info@haithamhattan.sa', 'info@haithamhattan.sa'));
      print('<span class="k">whatsapp  </span>' + link('https://wa.me/966537430772', '+966 53 743 0772'));
      print('<span class="k">linkedin  </span>' + link('https://www.linkedin.com/in/haithamhattan/', 'in/haithamhattan'));
      print('<span class="k">github    </span>' + link('https://github.com/haitham8888', 'haitham8888'));
    } },
    cv: { d: 'download résumé', f: function () { print('downloading <span class="k">CV_HaithamHattan_ATS.pdf</span> …'); var a = document.createElement('a'); a.href = 'img/CV_HaithamHattan_ATS.pdf'; a.download = ''; a.click(); } },
    theme: { d: 'toggle dark / light', f: function () { var t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; window.APP.setTheme(t); print('theme → <span class="k">' + t + '</span>'); } },
    lang: { d: 'lang ar | en | zh', f: function (a) {
      if (['ar', 'en', 'zh'].indexOf(a[0]) < 0) return print('usage: lang ar | en | zh', 'err');
      window.APP.setLang(a[0]); print('language → <span class="k">' + a[0] + '</span>');
    } },
    matrix: { d: 'turn the rain up', f: function () { var on = window.FX && window.FX.matrix(); print(on ? 'wake up, neo… <span class="m">(type matrix again to calm it)</span>' : 'rain back to calm.'); } },
    uptime: { d: 'coding since 2014', f: function () { print('up <span class="k">' + uptime() + '</span> — self-taught since Dec 2014'); } },
    date: { d: 'Riyadh time', f: function () { print(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'full', timeStyle: 'medium' }) + ' <span class="m">AST</span>'); } },
    clear: { d: 'clear screen', f: function () { out.innerHTML = ''; } },
    exit: { d: 'close terminal', f: function () { close(); } },
    ls: { hide: true, f: function () { print('latest/  shipped/  work/  projects/  awards/  stack.json  contact.txt  cv.pdf'); } },
    sudo: { hide: true, f: function () { print('nice try. this incident will be reported.', 'err'); } },
    hack: { hide: true, f: function () { print('access granted… just kidding. try <span class="k">contact</span> instead.'); } },
    rm: { hide: true, f: function () { print('permission denied: this portfolio is read-only.', 'err'); } }
  };
  var alias = { cat: 'help', about: 'whoami', products: 'shipped', experience: 'work', email: 'contact', resume: 'cv', q: 'exit', '?': 'help' };

  function run(line) {
    var raw = line.trim();
    print('<span class="pr">haitham@riyadh:~$</span> ' + esc(raw), 'echo');
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    var parts = raw.split(/\s+/), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    if (cmd === 'cat' && args[0]) { cmd = args[0].replace(/[\/.].*$/, ''); args = args.slice(1); }
    if (cmd === 'cd' && args[0]) { cmd = args[0].replace(/\/$/, ''); args = []; }
    cmd = alias[cmd] || cmd;
    if (C[cmd]) C[cmd].f(args); else print('command not found: ' + esc(cmd) + ' — type <span class="k">help</span>', 'err');
  }

  function open() {
    box.hidden = false; opened = true;
    if (!out.childElementCount) {
      print('<span class="m">haitham.sys v26.11 — last login ' + new Date().toLocaleDateString('en-GB') + '</span>');
      print('type <span class="k">help</span> to see what I can do.');
    }
    setTimeout(function () { input.focus(); }, 10);
  }
  function close() { box.hidden = true; opened = false; }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = hist[--hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      var v = input.value.toLowerCase(), m = Object.keys(C).filter(function (k) { return !C[k].hide && k.indexOf(v) === 0; });
      if (m.length === 1) input.value = m[0] + ' ';
      else if (m.length > 1) print(m.join('  '), 'm');
    }
    else if (e.key === 'Escape') close();
  });
  box.addEventListener('mousedown', function (e) { if (e.target === box) close(); });
  out.addEventListener('click', function () { input.focus(); });
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea/i.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); opened ? close() : open(); }
    else if (e.key === '`' && !typing) { e.preventDefault(); opened ? close() : open(); }
    else if (e.key === 'Escape' && opened) close();
  });
  var btn = document.getElementById('term-open');
  if (btn) btn.addEventListener('click', open);
  window.TERM = { open: open, close: close };
})();
