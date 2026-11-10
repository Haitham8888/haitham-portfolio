/* The detective — an ASCII character that lives in the hero.
   Original silhouette (deerstalker, Inverness cape, pipe), face kept in shadow.
   One eye only, seen through his magnifying glass (drawn from the eye brightness grid, never a photo).
   He walks, leaves fading footprints, turns to the cursor, aims the lens at it,
   stops to investigate and types deductions drawn from the CV. Click him for the next one. */
(function () {
  'use strict';
  var zone = document.getElementById('astro');
  if (!zone) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = " .:-=+*o#%@", EYE_RAMP = " .'`:-=+*oxO#%@";
  var ALPHA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
  function lang() { var l = document.documentElement.lang; return ['ar', 'en', 'zh'].indexOf(l) < 0 ? 'en' : l; }

  var DEDUCE = {
    en: ['Elementary. Two consecutive recognitions at MDS — consistency, not luck.', '16+ H100/H200 GPUs. This one trains and serves his own models.', 'Offline, private AI. He trusts nothing he cannot run himself.', 'Self-taught since 2014. Eleven years of evidence.', '38,000+ views on his tutorials. People learn from him.', 'Jazan to Riyadh. The coffee on his desk is Khawlani.', 'Bank AlJazira, 3rd place, 2026. The case speaks for itself.', 'ALLaM, Qwen, DeepSeek, GLM — he speaks fluent model.', '54 tools in the arsenal, and he ships with every one.'],
    ar: ['بديهي. تكريمان متتاليان في MDS — ثبات لا صدفة.', 'أكثر من 16 معالج H100/H200. هذا يدرّب نماذجه ويشغّلها بنفسه.', 'ذكاء اصطناعي خاص ودون اتصال. لا يثق إلا بما يشغّله بيده.', 'تعلّم ذاتي منذ 2014. أحد عشر عاماً من الأدلة.', 'أكثر من 38 ألف مشاهدة لشروحاته. الناس تتعلم منه.', 'من جازان إلى الرياض. والقهوة على مكتبه خولانية.', 'بنك الجزيرة، المركز الثالث 2026. القضية واضحة.', 'علّام وQwen وDeepSeek وGLM — يتحدث لغة النماذج بطلاقة.', '54 أداة في جعبته، ويطلق بها منتجات حقيقية.'],
    zh: ['显而易见：MDS 连续两次表彰——靠的是稳定，不是运气。', '16+ 块 H100/H200 GPU。他亲手训练并部署自己的模型。', '离线、私有的 AI。他只信任自己能运行的东西。', '2014 年起自学。十一年的证据。', '教程观看量超过 38,000。人们在向他学习。', '从吉赞到利雅得。他桌上的咖啡是 Khawlani。', 'AlJazira 银行黑客松第三名，2026。案情一目了然。', 'ALLaM、Qwen、DeepSeek、GLM——他精通"模型语言"。', '54 件工具，每一件都用来交付真实产品。']
  };

  zone.innerHTML = '<canvas class="sh-cv" aria-hidden="true"></canvas><div class="sh-bubble" role="status" aria-live="polite"><span class="sh-t"></span><i class="sh-caret"></i></div><button class="sh-hit" aria-label="Ask the detective for a deduction"></button>';
  var canvas = zone.querySelector('canvas'), ctx = canvas.getContext('2d');
  var bubble = zone.querySelector('.sh-bubble'), btext = bubble.querySelector('.sh-t'), hit = zone.querySelector('.sh-hit');
  var off = document.createElement('canvas'), octx = off.getContext('2d', { willReadFrequently: true });
  var W = 0, H = 0, dpr = 1, U = 1, COLS = 52, ROWS = 72, cw = 0, ch = 0, visible = true;
  var S = { x: 0, dir: 1, phase: 0, mode: 'walk', t: 0, arm: -0.35, armT: -0.35, next: 3 + Math.random() * 3, idx: 0 };
  var prints = [], mouse = null, typed = { full: '', n: 0, until: 0 };

  // one eye from the brightness grid
  var E = window.EYES, eyeLum = null, EC0 = 0, EC1 = 0;
  if (E) {
    EC0 = Math.round(E.c * 0.22); EC1 = Math.round(E.c * 0.52);
    eyeLum = new Float32Array(E.c * E.r);
    for (var i = 0; i < eyeLum.length; i++) eyeLum[i] = ALPHA.indexOf(E.d[i]) / 63;
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = zone.clientWidth; H = zone.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var figH = H * 0.78; U = figH / 140;                // unit space is 100 x 140
    cw = (100 * U) / COLS; ch = (140 * U) / ROWS;
    off.width = COLS; off.height = ROWS;
    if (!S.x) S.x = W * 0.42;
  }

  // the silhouette, drawn in unit space (100 x 140), facing right
  function figure(o, k, phase, arm, moving) {
    o.save(); o.scale(k, k);
    var sw = moving ? Math.sin(phase) : 0, bob = moving ? Math.abs(Math.cos(phase)) * 1.6 : 0;
    o.translate(0, -bob);
    var tweed = '#b39a72', tweedD = '#8f7754', shadow = '#2b2b2b';
    // legs + shoes
    o.fillStyle = '#9b9b9b';
    o.save(); o.translate(46, 104); o.rotate(-sw * 0.38); o.fillRect(-4, 0, 8, 30); o.fillStyle = '#5a5a5a'; o.fillRect(-5, 28, 12, 5); o.restore();
    o.save(); o.translate(56, 104); o.rotate(sw * 0.38); o.fillStyle = '#b0b0b0'; o.fillRect(-4, 0, 8, 30); o.fillStyle = '#6a6a6a'; o.fillRect(-5, 28, 12, 5); o.restore();
    // coat
    o.fillStyle = tweedD; o.beginPath(); o.moveTo(35, 60); o.lineTo(66, 60); o.lineTo(73, 110); o.lineTo(28, 110); o.closePath(); o.fill();
    // cape
    o.fillStyle = tweed; o.beginPath(); o.moveTo(30, 57); o.lineTo(70, 57); o.lineTo(79, 84); o.quadraticCurveTo(50, 90, 21, 84); o.closePath(); o.fill();
    // collar
    o.fillStyle = '#d8c7a6'; o.beginPath(); o.moveTo(42, 54); o.lineTo(58, 54); o.lineTo(54, 61); o.lineTo(46, 61); o.closePath(); o.fill();
    // head (face stays in shadow)
    o.fillStyle = shadow; o.beginPath(); o.arc(50, 43, 11.5, 0, Math.PI * 2); o.fill();
    // pipe
    o.strokeStyle = '#6b4a2b'; o.lineWidth = 2.4; o.beginPath(); o.moveTo(57, 48); o.quadraticCurveTo(63, 52, 66, 50); o.stroke();
    o.fillStyle = '#6b4a2b'; o.fillRect(64, 45, 5, 6);
    // deerstalker
    o.fillStyle = tweed; o.beginPath(); o.ellipse(50, 33, 15, 10, 0, Math.PI, 0); o.lineTo(65, 36); o.lineTo(35, 36); o.closePath(); o.fill();
    o.fillStyle = tweedD; o.beginPath(); o.moveTo(63, 33); o.lineTo(76, 38); o.lineTo(62, 38.5); o.closePath(); o.fill();
    o.beginPath(); o.moveTo(37, 33); o.lineTo(24, 38); o.lineTo(38, 38.5); o.closePath(); o.fill();
    o.fillStyle = '#d8c7a6'; o.fillRect(48.5, 22, 3, 3);
    // arm + magnifier
    var sx = 64, sy = 64, L = 24, hx = sx + Math.cos(arm) * L, hy = sy + Math.sin(arm) * L;
    o.strokeStyle = tweed; o.lineWidth = 8; o.lineCap = 'round'; o.beginPath(); o.moveTo(sx, sy); o.lineTo(hx, hy); o.stroke();
    var lx = hx + Math.cos(arm) * 18, ly = hy + Math.sin(arm) * 18;
    o.strokeStyle = '#7a5a34'; o.lineWidth = 3.2; o.beginPath(); o.moveTo(hx, hy); o.lineTo(hx + Math.cos(arm) * 8, hy + Math.sin(arm) * 8); o.stroke();
    o.restore();
    return { lx: lx, ly: ly, r: 10.5 };
  }

  function say(text) {
    typed.full = text; typed.n = 0; typed.until = performance.now() + 5200 + text.length * 30;
    bubble.classList.add('on');
  }
  function nextDeduction() {
    var list = DEDUCE[lang()] || DEDUCE.en;
    say(list[S.idx % list.length]); S.idx++;
  }

  function draw(now, dt) {
    var dk = dark(), moving = S.mode === 'walk';
    var groundY = H * 0.95, figW = 100 * U, figH = 140 * U;
    // behaviour
    S.t += dt;
    if (mouse) {
      var mx = mouse.x;
      if (Math.abs(mx - S.x) > 30) S.dir = mx > S.x ? 1 : -1;
      var ox = S.x + S.dir * (64 - 50) * U, oy = groundY - figH + 64 * U;
      var ang = Math.atan2(mouse.y - oy, (mouse.x - ox) * S.dir);
      S.armT = Math.max(-1.3, Math.min(0.9, ang));
      S.mode = 'inspect';
    } else if (S.mode === 'walk') {
      S.x += S.dir * 34 * dt; S.phase += dt * 6.2; S.armT = -0.15;
      var margin = figW * 0.55;
      if (S.x > W - margin) S.dir = -1; if (S.x < margin) S.dir = 1;
      if ((S.phase | 0) % 3 === 0 && Math.random() < 0.18) prints.push({ x: S.x + S.dir * 4, y: groundY + 2, life: 0 });
      S.next -= dt; if (S.next <= 0) { S.mode = 'inspect'; S.t = 0; S.armT = -0.9 + Math.random() * 0.6; if (!reduce) nextDeduction(); }
    } else if (S.mode === 'inspect' && !mouse) {
      if (S.t > 5.5) { S.mode = 'walk'; S.next = 4 + Math.random() * 4; if (Math.random() < 0.35) S.dir *= -1; }
    }
    S.arm += (S.armT - S.arm) * Math.min(1, dt * 5);

    // rasterise the silhouette to the glyph grid
    octx.clearRect(0, 0, COLS, ROWS);
    var lens = figure(octx, COLS / 100, S.phase, S.arm, moving);
    var d = octx.getImageData(0, 0, COLS, ROWS).data;

    ctx.clearRect(0, 0, W, H);
    // ground + footprints
    ctx.font = '500 ' + (ch * 1.1).toFixed(1) + 'px ' + MONO; ctx.textBaseline = 'top';
    ctx.fillStyle = dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';
    for (var gx = 6; gx < W - 6; gx += cw * 1.4) ctx.fillText('_', gx, groundY - ch * 0.6);
    for (var p = prints.length - 1; p >= 0; p--) {
      var f = prints[p]; f.life += dt; if (f.life > 6) { prints.splice(p, 1); continue; }
      ctx.fillStyle = (dk ? 'rgba(74,222,128,' : 'rgba(21,128,61,') + ((1 - f.life / 6) * 0.55).toFixed(2) + ')';
      ctx.fillText('..', f.x - cw, f.y);
    }

    var x0 = S.x - figW / 2, y0 = groundY - figH;
    ctx.font = '700 ' + (ch * 1.02).toFixed(1) + 'px ' + MONO;
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      var q = (y * COLS + x) * 4; if (d[q + 3] < 90) continue;
      var r = d[q], g = d[q + 1], b = d[q + 2], Lm = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      var gi = Math.max(2, Math.round((0.35 + Lm * 0.65) * (RAMP.length - 1)));
      var px = S.dir > 0 ? x0 + x * cw : x0 + (COLS - 1 - x) * cw;
      if (dk) { var k = Lm < 0.35 ? 0.5 : 0.15; ctx.fillStyle = 'rgb(' + Math.round(r + (255 - r) * k) + ',' + Math.round(g + (255 - g) * k) + ',' + Math.round(b + (255 - b) * k) + ')'; }
      else ctx.fillStyle = 'rgb(' + Math.round(r * 0.62) + ',' + Math.round(g * 0.62) + ',' + Math.round(b * 0.62) + ')';
      ctx.fillText(RAMP[gi], px, y0 + y * ch);
    }

    // the lens: one eye, ASCII, under glass
    var lcx = S.dir > 0 ? x0 + lens.lx * U : x0 + (100 - lens.lx) * U, lcy = y0 + lens.ly * U, R = lens.r * U * 1.25;
    ctx.save();
    ctx.beginPath(); ctx.arc(lcx, lcy, R, 0, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = dk ? 'rgba(10,18,24,0.92)' : 'rgba(240,246,250,0.95)'; ctx.fill();
    ctx.clip();
    if (eyeLum) {
      var ecols = 26, ecw = (R * 2) / ecols, ech = ecw * 1.7, erows = Math.ceil((R * 2) / ech);
      ctx.font = '700 ' + (ech * 0.95).toFixed(1) + 'px ' + MONO;
      var spanC = EC1 - EC0, look = mouse ? 0 : Math.sin(now / 1400) * 0.06;
      for (var ey = 0; ey < erows; ey++) for (var ex = 0; ex < ecols; ex++) {
        var u = ex / ecols, v = ey / erows;
        var sxg = Math.min(E.c - 1, Math.max(0, Math.round(EC0 + (u + look) * spanC))), syg = Math.min(E.r - 1, Math.round(v * (E.r - 1)));
        var Le = eyeLum[syg * E.c + sxg];
        var ix = Math.round(Math.pow(Le, 1.25) * (EYE_RAMP.length - 1)); if (ix < 1) continue;
        ctx.fillStyle = dk ? 'rgba(220,240,255,' + (0.35 + 0.65 * Le).toFixed(2) + ')' : 'rgba(20,30,40,' + (0.3 + 0.7 * (1 - Le)).toFixed(2) + ')';
        var ch2 = dk ? EYE_RAMP[ix] : EYE_RAMP[EYE_RAMP.length - 1 - ix];
        ctx.fillText(ch2, lcx - R + ex * ecw, lcy - R + ey * ech);
      }
    }
    // glass glint
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.ellipse(lcx - R * 0.35, lcy - R * 0.45, R * 0.45, R * 0.2, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = dk ? '#d9d9d9' : '#3a3a3a'; ctx.lineWidth = Math.max(2, U * 2.6);
    ctx.beginPath(); ctx.arc(lcx, lcy, R, 0, Math.PI * 2); ctx.stroke();

    // speech bubble above the hat
    var bw = bubble.offsetWidth || 220, bx = Math.max(6, Math.min(W - bw - 6, S.x - bw / 2)), by = Math.max(4, y0 - (bubble.offsetHeight || 40) - 4);
    bubble.style.transform = 'translate(' + bx.toFixed(0) + 'px,' + by.toFixed(0) + 'px)';
    if (typed.full) {
      if (typed.n < typed.full.length) { typed.n = Math.min(typed.full.length, typed.n + Math.max(1, Math.round(dt * 45))); btext.textContent = typed.full.slice(0, typed.n); }
      if (now > typed.until) { bubble.classList.remove('on'); typed.full = ''; }
    }
    hit.style.transform = 'translate(' + x0.toFixed(0) + 'px,' + y0.toFixed(0) + 'px)'; hit.style.width = figW + 'px'; hit.style.height = figH + 'px';
  }

  var last = 0;
  function loop(now) {
    if (!visible) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    draw(now, reduce ? 0 : dt);
    if (!reduce) requestAnimationFrame(loop);
  }
  zone.addEventListener('pointermove', function (e) { var r = zone.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  zone.addEventListener('pointerleave', function () { mouse = null; S.mode = 'walk'; S.next = 2 + Math.random() * 2; });
  hit.addEventListener('click', function () { nextDeduction(); S.mode = 'inspect'; S.t = 0; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was) { last = 0; requestAnimationFrame(loop); } }).observe(zone);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  size();
  setTimeout(function () { if (!typed.full) nextDeduction(); }, 1800);
  requestAnimationFrame(loop);
  window.SHERLOCK = { say: nextDeduction };
})();
