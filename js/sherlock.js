/* Sherlock — the same character as Al-Haitham's desktop pet (deerstalker, black coat, blue collar,
   the smug thinking pose), redrawn live as coloured ASCII. He lives on the whole page, not in one box.

   His glasses (Al-Haitham's own: thin gold wire, octagonal lenses) are drawn into every frame of the
   sprite, so they are part of him and move with every pose. Every animation of the pet is used — idle, walk right / left, wave, jump, the dramatic sit-down,
   wait, think, review — and consecutive frames are cross-faded on the glyph grid, so limbs and coat
   move smoothly instead of snapping. On top: squash and stretch, tilt, springs, footprints, pipe smoke.

   He starts in the hero and follows you down the page section by section (drops when his ledge scrolls
   away, leaps back up when you scroll up), walks, stops to investigate what is near him, waves when you
   come close, turns to your cursor and studies it through his magnifier (one eye, drawn from the eye
   grid), follows it, hops when startled. Click him for a fact about Al-Haitham, drag to carry him, fling him and he
   falls and lands on the nearest ledge (land too hard and he sits down, dramatically). */
(function () {
  'use strict';
  var zone = document.getElementById('astro');
  if (!zone) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var RAMP = ' .:-=+*o#%@', EYE_RAMP = " .'`:-=+*oxO#%@";
  var ALPHA = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
  function lang() { var l = document.documentElement.lang; return ['ar', 'en', 'zh'].indexOf(l) < 0 ? 'en' : l; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(cur, target, rate, dt) { return cur + (target - cur) * (1 - Math.exp(-rate * dt)); }

  var DEDUCE = {
    en: ['Two consecutive recognitions at MDS — Q4 2025 and Q1 2026.', 'Trains and serves his own models on 16+ H100/H200 GPUs.', 'Private AI that runs fully offline, inside the organisation.', 'Self-taught since 2014 — over eleven years of building.', '38,000+ views on his tutorials and bootcamp streams.', 'From Jazan to Riyadh, with Khawlani coffee on the desk.', '3rd place at the Bank AlJazira FinTech hackathon, 2026.', 'Works with ALLaM, Qwen, DeepSeek and GLM, all on-prem.', '54 tools in daily use, from Rust to Kubernetes.', 'Unlimited-OCR, PaddleOCR and Milvus for documents at scale.'],
    ar: ['تكريمان متتاليان في MDS — الربع الرابع 2025 والربع الأول 2026.', 'يدرّب نماذجه ويشغّلها على أكثر من 16 معالج H100/H200.', 'ذكاء اصطناعي خاص يعمل دون اتصال، داخل الجهة نفسها.', 'تعلّم ذاتي منذ 2014 — أكثر من أحد عشر عاماً من البناء.', 'أكثر من 38 ألف مشاهدة لشروحاته وبثوث معسكراته.', 'من جازان إلى الرياض، والقهوة الخولانية على المكتب.', 'المركز الثالث في هاكاثون بنك الجزيرة للتقنية المالية 2026.', 'يعمل مع علّام وQwen وDeepSeek وGLM، محلياً بالكامل.', '54 أداة يستخدمها يومياً، من Rust إلى Kubernetes.', 'Unlimited-OCR وPaddleOCR وMilvus لمعالجة المستندات على نطاق واسع.'],
    zh: ['MDS 连续两次表彰——2025 Q4 与 2026 Q1。', '在 16+ 块 H100/H200 GPU 上训练并部署自己的模型。', '完全离线、部署在机构内部的私有 AI。', '2014 年起自学——十一年多的持续构建。', '教程与训练营直播观看量超过 38,000。', '从吉赞到利雅得，桌上是 Khawlani 咖啡。', 'AlJazira 银行金融科技黑客松第三名，2026。', '使用 ALLaM、Qwen、DeepSeek 与 GLM，全部本地部署。', '日常使用 54 种工具，从 Rust 到 Kubernetes。', '用 Unlimited-OCR、PaddleOCR 与 Milvus 大规模处理文档。']
  };

  // ---------- layer ----------
  var layer = document.createElement('div');
  layer.className = 'sh-layer';
  layer.innerHTML = '<canvas aria-hidden="true"></canvas><div class="sh-bubble" role="status" aria-live="polite"><span class="sh-t"></span><i class="sh-caret"></i></div><button class="sh-hit" type="button" aria-label="Sherlock — click for a fact about Al-Haitham, drag to carry him"></button>';
  document.body.appendChild(layer);
  zone.innerHTML = '';
  var cv = layer.querySelector('canvas'), ctx = cv.getContext('2d');
  var bubble = layer.querySelector('.sh-bubble'), btext = bubble.querySelector('.sh-t'), hit = layer.querySelector('.sh-hit');

  // sprite sheet: 8 x 9 frames of 96 x 104
  var sheet = new Image(); sheet.src = 'img/sherlock.webp?v=88';
  var FW = 96, FHH = 104;
  var AN = {
    idle: { r: 0, n: 6, fps: 5 }, runR: { r: 1, n: 8, fps: 9 }, runL: { r: 2, n: 8, fps: 9 }, wave: { r: 3, n: 4, fps: 7 },
    jump: { r: 4, n: 5, fps: 9 }, fail: { r: 5, n: 8, fps: 6.5 }, wait: { r: 6, n: 6, fps: 5 }, think: { r: 7, n: 6, fps: 5 }, review: { r: 8, n: 6, fps: 5 }
  };
  var IDLE_FACING = 1, FOOT = 0.978, GOLD_D = '#f4d27a', GOLD_L = '#8a6420';
  var ROWS = 66, COLS = Math.round(ROWS * FW / FHH);
  var off = document.createElement('canvas'); off.width = COLS; off.height = ROWS;
  var o = off.getContext('2d', { willReadFrequently: true });

  var VW = 0, VH = 0, dpr = 1, u = 1, FH = 150, G = 2600;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    VW = document.documentElement.clientWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr);
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    u = VW < 700 ? 0.7 : clamp(VW / 1440, 0.85, 1.05);
    FH = 196 * u;
  }

  // one eye from the brightness grid
  var E = window.EYES, eyeLum = null, EC0 = 0, EC1 = 0;
  if (E) {
    EC0 = Math.round(E.c * 0.22); EC1 = Math.round(E.c * 0.52);
    eyeLum = new Float32Array(E.c * E.r);
    for (var i = 0; i < eyeLum.length; i++) eyeLum[i] = ALPHA.indexOf(E.d[i]) / 63;
  }

  // ---------- ledges he can stand on ----------
  var ledgeEls = [].slice.call(document.querySelectorAll('.block, .foot'));
  function ledges() {
    var sy = window.scrollY, list = [], zr = zone.getBoundingClientRect();
    if (zr.height > 60) list.push({ id: 'zone', y: zr.bottom + sy - zr.height * 0.05, x0: zr.left, x1: zr.right });
    for (var i = 0; i < ledgeEls.length; i++) {
      var r = ledgeEls[i].getBoundingClientRect();
      if (r.width > 100) list.push({ id: 'b' + i, y: r.top + sy, x0: r.left, x1: r.right });
    }
    list.push({ id: 'vb', vb: true, y: sy + VH - 3, x0: Math.max(VW * 0.6, VW - 280), x1: VW - 10 });
    return list;
  }
  function usable(f) { if (f.vb) return true; var s = f.y - window.scrollY; return s >= FH * 0.8 && s <= VH - 3; }

  // ---------- state ----------
  var S = {
    x: 0, y: 0, vx: 0, vy: 0, dir: 1, sx: 1, floor: 'zone', mode: 'idle', timer: 2.2, t: 0,
    phi: 0, w: 0, walking: false, aimA: 0, aim: -0.25, aimT: -0.25, crouch: 0, crouchV: 0,
    cape: 0, capeV: 0, hem: 0, hemV: 0, tilt: 0, tiltV: 0, air: 0, tuck: 0, held: 0, idx: 0,
    look: 0, inspect: null, hvx: 0, spawned: false
  };
  var mouse = null, grab = null, parts = [], typed = { full: '', n: 0, until: 0 };

  function say(text) { typed.full = text; typed.n = 0; typed.until = performance.now() + 5200 + text.length * 32; bubble.classList.add('on'); }
  function nextDeduction() { var l = DEDUCE[lang()] || DEDUCE.en; say(l[S.idx % l.length]); S.idx++; }

  function land(f) {
    var impact = clamp(S.vy / 1500, 0.15, 1);
    S.mode = 'land'; S.floor = f.id; S.y = f.y; S.crouchV += impact * 10; S.timer = 0.32 + impact * 0.25;
    if (impact > 0.85) { S.anim = ''; play('fail', true); S.timer = AN.fail.n / AN.fail.fps; }
    S.vy = 0; S.vx *= 0.15;
    if (!reduce) for (var k = 0; k < 6 + impact * 10; k++) parts.push({ x: S.x + (Math.random() - 0.5) * 30 * u, y: f.y - 2, vx: (Math.random() - 0.5) * 140, vy: -20 - Math.random() * 60, life: 0, max: 0.5 + Math.random() * 0.5, ch: '.,`\''[k % 4], kind: 'dust', page: !f.vb });
  }
  function jumpTo(f, extra) {
    var dy = S.y - f.y, h = Math.max(dy, 0) + (extra || 46) * u;
    S.vy = -Math.sqrt(2 * G * h);
    var tUp = -S.vy / G, tDown = Math.sqrt(Math.max(0, 2 * (h - dy)) / G), T = Math.max(0.25, tUp + tDown);
    var tx = clamp(S.x, f.x0 + 50 * u, f.x1 - 50 * u);
    S.vx = clamp((tx - S.x) / T, -700, 700);
    if (Math.abs(S.vx) > 30) S.dir = S.vx > 0 ? 1 : -1;
    S.mode = 'air'; S.floor = null; S.crouchV -= 3;
  }
  function inspectTarget() {
    var els = document.querySelectorAll('.row .tx, .label, .tile, .quote blockquote, .voice-stats dt'), best = null, bd = 1e9, fy = S.y - window.scrollY;
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > VH) continue;
      var cx = r.left + Math.min(r.width, 120) / 2, cy = r.top + r.height / 2, d = Math.hypot(cx - S.x, cy - (fy - FH * 0.6));
      if (d < 520 && d > 70 && d + Math.random() * 160 < bd) { bd = d; best = { x: cx, y: cy + window.scrollY }; }
    }
    return best;
  }

  // ---------- behaviour ----------
  function update(dt, now) {
    S.t += dt;
    var L = ledges(), map = {}; for (var i = 0; i < L.length; i++) map[L[i].id] = L[i];
    var sy = window.scrollY;
    if (!S.spawned) { var z = map.zone || map.vb; S.x = z.vb ? VW * 0.5 : (z.x0 + z.x1) / 2; S.y = z.y; S.floor = z.id; S.spawned = true; }
    var M = mouse && now - mouse.t < 3200 ? { x: mouse.cx, y: mouse.cy + sy, sp: mouse.sp } : null;
    var chestY = S.y - FH * 0.6;

    if (S.mode === 'held') {
      var p = grab.last;
      var nx = p.x, ny = p.y + sy + 66 * u;
      S.hvx = ease(S.hvx, (nx - S.x) / Math.max(dt, 0.008), 12, dt);
      S.x = nx; S.y = ny; S.walking = false;
    } else if (S.mode === 'air') {
      var py = S.y;
      S.vy += G * dt; S.x += S.vx * dt; S.y += S.vy * dt;
      if (S.x < 24) { S.x = 24; S.vx = Math.abs(S.vx) * 0.55; }
      if (S.x > VW - 24) { S.x = VW - 24; S.vx = -Math.abs(S.vx) * 0.55; }
      if (S.vy > 0) {
        var hitF = null;
        for (var j = 0; j < L.length; j++) {
          var f = L[j]; if (f.vb) continue;
          if (S.x < f.x0 || S.x > f.x1 || !usable(f)) continue;
          if (py <= f.y && S.y >= f.y && (!hitF || f.y < hitF.y)) hitF = f;
        }
        if (!hitF && S.y >= map.vb.y) hitF = map.vb;
        if (hitF) land(hitF);
      }
      S.walking = false;
    } else {
      var fl = map[S.floor] || map.vb; S.floor = fl.id; S.y = fl.y;
      var scr = fl.y - sy;
      if (!reduce && !fl.vb && scr < FH * 0.8) { S.vx = S.dir * 60; S.vy = -260; S.mode = 'air'; S.floor = null; return; }
      if (!reduce && !fl.vb && scr > VH - 2) {
        var best = map.vb;
        for (var k = 0; k < L.length; k++) if (!L[k].vb && usable(L[k]) && L[k].y < S.y && L[k].y > best.y && S.x > L[k].x0 && S.x < L[k].x1) best = L[k];
        jumpTo(best); return;
      }
      if (S.mode === 'land') { S.walking = false; S.timer -= dt; if (S.timer <= 0) { S.mode = 'idle'; S.timer = 1.2 + Math.random() * 1.5; } }
      else if (reduce) { S.walking = false; }
      else {
        var engaged = false;
        if (M) {
          var dx = M.x - S.x, dyM = M.y - chestY, dist = Math.hypot(dx, dyM);
          if (dist < 90 * u && M.sp > 2600) { S.vy = -430; S.vx = -Math.sign(dx || 1) * 90; S.mode = 'air'; S.floor = null; mouse.sp = 0; return; }
          if (dist < 420) {
            engaged = true;
            if (Math.abs(dx) > 26) S.dir = dx > 0 ? 1 : -1;
            S.aimT = clamp(Math.atan2(dyM + FH * 0.05, Math.abs(dx) + 1), -1.35, 1.05);
            S.look = clamp(dx / 400, -1, 1);
            var tx = M.x - S.dir * 115 * u;
            S.walking = Math.abs(dyM) < 300 && Math.abs(tx - S.x) > 24 && tx > fl.x0 + 40 * u && tx < fl.x1 - 40 * u;
            S.inspect = null;
          }
        }
        if (!engaged) {
          S.timer -= dt;
          if (S.mode === 'walk') {
            S.walking = true;
            if (S.x < fl.x0 + 46 * u) S.dir = 1;
            if (S.x > fl.x1 - 46 * u) S.dir = -1;
            if (S.timer <= 0) {
              S.mode = 'idle'; S.timer = 3 + Math.random() * 2.5; S.walking = false; S.idleAnim = ['idle', 'wait', 'think', 'idle'][(Math.random() * 4) | 0];
              S.inspect = inspectTarget();
              if (S.inspect) S.dir = S.inspect.x > S.x ? 1 : -1;
              if (!typed.full && Math.random() < 0.55) nextDeduction();
            }
          } else {
            S.walking = false;
            if (S.inspect) { S.aimT = clamp(Math.atan2(S.inspect.y - chestY, Math.abs(S.inspect.x - S.x) + 1), -1.35, 1.05) + Math.sin(S.t * 1.7) * 0.06; S.look = Math.sin(S.t * 0.9) * 0.6; }
            else { S.aimT = -0.35 + Math.sin(S.t * 0.8) * 0.25; S.look = Math.sin(S.t * 0.6) * 0.5; }
            if (S.timer <= 0) {
              // explore: from the bottom of the screen, leap up onto a ledge in view
              if (fl.vb && Math.random() < 0.45) {
                var cand = L.filter(function (q) { var s = q.y - sy; return !q.vb && s > VH * 0.3 && s < VH - 150 * u && S.x > q.x0 - 200 && S.x < q.x1 + 200; });
                if (cand.length) { jumpTo(cand[(Math.random() * cand.length) | 0], 40); return; }
              }
              S.mode = 'walk'; S.timer = 3.5 + Math.random() * 4; S.inspect = null;
              if (Math.random() < 0.4) S.dir *= -1;
            }
          }
        }
        if (engaged && !S.engaged && now - (S.lastGreet || -1e9) > 14000) { S.greet = true; S.lastGreet = now; }
        S.engaged = engaged;
        S.aimA = ease(S.aimA, engaged ? 1 : 0, 5, dt);
        if (S.walking) S.x = clamp(S.x + S.dir * 50 * u * S.w * dt, fl.x0 + 30 * u, fl.x1 - 30 * u);
      }
    }
    if (S.mode !== 'idle' && S.mode !== 'walk' && S.mode !== 'land') S.aimA = ease(S.aimA, 0, 5, dt);

    // smooth blends + springs
    var grounded = S.mode === 'idle' || S.mode === 'walk' || S.mode === 'land';
    var prevW = S.w;
    S.w = ease(S.w, S.walking ? 1 : 0, 5.5, dt);
    var A = 11, prevPhi = S.phi;
    S.phi += dt * (50 / A) * Math.max(S.w, S.walking ? 0.25 : 0);
    if (!S.walking && S.w < 0.02) S.phi = ease(S.phi, Math.round(S.phi / Math.PI) * Math.PI, 4, dt);
    S.sx = ease(S.sx, S.dir, 13, dt);
    S.air = ease(S.air, grounded ? 0 : 1, grounded ? 9 : 7, dt);
    S.held = ease(S.held, S.mode === 'held' ? 1 : 0, 9, dt);
    S.tuck = ease(S.tuck, S.mode === 'air' && S.vy < 0 ? 1 : 0.15, 6, dt);
    S.aim = ease(S.aim, S.aimT, 6, dt);
    var vxw = S.mode === 'held' ? S.hvx : S.mode === 'air' ? S.vx : S.dir * 50 * u * S.w * (S.walking ? 1 : 0);
    var capeT = clamp(-vxw * 0.03 * S.dir, -16, 16) + (S.mode === 'air' ? clamp(-S.vy * 0.008, -10, 10) : 0) + Math.sin(S.t * 1.3) * 0.6;
    S.capeV += (capeT - S.cape) * 70 * dt; S.capeV *= Math.exp(-7 * dt); S.cape += S.capeV * dt;
    var hemT = clamp(-vxw * 0.02 * S.dir, -9, 9) + S.w * Math.sin(S.phi * 2) * 1.2;
    S.hemV += (hemT - S.hem) * 90 * dt; S.hemV *= Math.exp(-8 * dt); S.hem += S.hemV * dt;
    var tiltT = S.mode === 'held' ? clamp(-S.hvx * 0.0011, -0.75, 0.75) : S.mode === 'air' ? clamp(S.vx * 0.0003, -0.25, 0.25) : 0;
    S.tiltV += (tiltT - S.tilt) * 55 * dt; S.tiltV *= Math.exp(-5 * dt); S.tilt += S.tiltV * dt;
    S.crouchV += (-S.crouch) * 95 * dt; S.crouchV *= Math.exp(-11 * dt); S.crouch = clamp(S.crouch + S.crouchV * dt, -0.25, 1);

    // footprints when a foot plants (page ledges only), smoke from the pipe
    if (grounded && S.w > 0.4 && !(map[S.floor] || {}).vb) {
      for (var s = 0; s < 2; s++) {
        var a0 = Math.cos(prevPhi + s * Math.PI), a1 = Math.cos(S.phi + s * Math.PI);
        if (a0 > 0 && a1 <= 0) parts.push({ x: S.x + S.dir * u * 11 * Math.sin(S.phi + s * Math.PI), y: S.y - 1, vx: 0, vy: 0, life: 0, max: 5, ch: '..', kind: 'print', page: true });
      }
    }
    if (!reduce && Math.random() < dt * (S.mode === 'idle' ? 2.2 : 0.9) && SK.pipe) parts.push({ x: SK.pipe.x, y: SK.pipe.y + sy, vx: (Math.random() - 0.3) * 8 * S.dir, vy: -16 - Math.random() * 10, life: 0, max: 2 + Math.random(), ch: '.oO?'[(Math.random() * 4) | 0], kind: 'smoke', page: true });
  }

  var SK = { pipe: null };
  // which animation, and where in it. returns true when the frame is posed directly (air, carried)
  function play(name, once) { if (S.anim !== name) { S.anim = name; S.af = 0; S.once = !!once; } }
  function pickAnim(dt) {
    if (S.mode === 'held') { play('jump'); S.af = 3.3 + Math.sin(S.t * 6) * 0.3; return true; }
    if (S.mode === 'air') { play('jump'); S.af = ease(S.af, S.vy < -250 ? 2.1 : S.vy < 120 ? 3 : 4, 12, dt); return true; }
    if (S.mode === 'land' && S.anim !== 'fail') { play('jump'); S.af = ease(S.af, 0.6, 14, dt); return true; }
    if (S.anim === 'fail' && S.af < AN.fail.n - 0.05) return false;
    if (S.once && S.anim === 'wave' && S.af < AN.wave.n * 2 - 0.05) return false;
    if (S.walking || S.w > 0.45) { play(S.dir > 0 ? 'runR' : 'runL'); return false; }
    if (S.greet) { S.greet = false; play('wave', true); return false; }
    play(S.engaged ? 'review' : typed.full ? 'think' : S.idleAnim || 'idle');
    return false;
  }
  // ---------- render ----------
  var colCache = {};
  function colour(r, g, b, dk) {
    var key = (r >> 3) + ',' + (g >> 3) + ',' + (b >> 3) + (dk ? 'd' : 'l');
    var c = colCache[key]; if (c) return c;
    var L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (dk) { var k = L < 0.2 ? 0.56 : L < 0.4 ? 0.4 : 0.14; r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    else { r *= 0.6; g *= 0.6; b *= 0.6; }
    return (colCache[key] = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')');
  }

  function render(now, dt) {
    var dk = dark(), sy = window.scrollY;
    ctx.clearRect(0, 0, VW, VH);
    var fy = S.y - sy;

    // particles
    ctx.textBaseline = 'top';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life += dt;
      if (p.life > p.max) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'dust') p.vy += 240 * dt;
      var a = 1 - p.life / p.max, py = p.page ? p.y - sy : p.y - sy;
      if (py < -20 || py > VH + 20) continue;
      if (p.kind === 'print') { ctx.font = '600 ' + (9 * u).toFixed(1) + 'px ' + MONO; ctx.fillStyle = (dk ? 'rgba(74,222,128,' : 'rgba(21,128,61,') + (a * 0.5).toFixed(2) + ')'; }
      else if (p.kind === 'smoke') { ctx.font = '500 ' + (9 * u).toFixed(1) + 'px ' + MONO; ctx.fillStyle = (dk ? 'rgba(220,220,220,' : 'rgba(80,80,80,') + (Math.sin(Math.PI * p.life / p.max) * 0.45).toFixed(2) + ')'; }
      else { ctx.font = '600 ' + (8 * u).toFixed(1) + 'px ' + MONO; ctx.fillStyle = (dk ? 'rgba(200,200,200,' : 'rgba(60,60,60,') + (a * 0.7).toFixed(2) + ')'; }
      ctx.fillText(p.ch, p.x, py);
    }

    // hero stage ground line
    var zr = zone.getBoundingClientRect();
    if (zr.bottom > 0 && zr.top < VH && zr.height > 60) {
      var gy = zr.bottom - zr.height * 0.05;
      ctx.font = '500 ' + (10 * u).toFixed(1) + 'px ' + MONO; ctx.fillStyle = dk ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.13)';
      for (var gx = zr.left + 4; gx < zr.right - 6; gx += 9 * u) ctx.fillText('_', gx, gy - 8 * u);
    }

    if (fy < -10 || fy - FH > VH + 10) { SK.pipe = null; hideUI(); return; }

    // soft contact shadow when standing
    if (S.air < 0.5) {
      ctx.fillStyle = dk ? 'rgba(255,255,255,' + (0.05 * (1 - S.air * 2)).toFixed(3) + ')' : 'rgba(0,0,0,' + (0.08 * (1 - S.air * 2)).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(S.x, fy, 26 * u, 3.2 * u, 0, 0, 7); ctx.fill();
    }

    // the pet's frame -> offscreen (cross-faded) -> glyph grid
    var posed = pickAnim(dt), an = AN[S.anim] || AN.idle;
    if (!AN[S.anim]) S.anim = 'idle';
    if (!posed) S.af += dt * an.fps * (S.anim === 'runR' || S.anim === 'runL' ? Math.max(0.55, S.w) : 1);
    var isFail = S.anim === 'fail';
    var f = isFail ? Math.min(S.af, an.n - 1.001) : ((S.af % an.n) + an.n) % an.n;
    var i0 = Math.floor(f), i1 = isFail ? Math.min(i0 + 1, an.n - 1) : (i0 + 1) % an.n, ft = f - i0;
    if (posed) { i0 = Math.round(f) % an.n; i1 = i0; ft = 0; }
    // blend only around the middle of each frame: smooth motion, no doubled glasses or limbs
    ft = clamp((ft - 0.38) / 0.24, 0, 1); ft = ft * ft * (3 - 2 * ft);
    var run = S.anim === 'runR' || S.anim === 'runL', turn = Math.max(0.14, Math.abs(S.sx));
    var mx = run ? turn : (S.sx < 0 ? -turn : turn) * IDLE_FACING;
    var calm = S.anim === 'idle' || S.anim === 'review' || S.anim === 'think' || S.anim === 'wait';
    var breath = calm ? Math.sin(S.t * 2.2) * 0.008 : 0;
    var sqy = 1 - S.crouch * 0.13 + breath, sqx = 1 + S.crouch * 0.09;
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, COLS, ROWS);
    o.translate(COLS / 2, ROWS * FOOT); o.rotate(S.tilt); o.scale(mx * sqx, sqy);
    o.imageSmoothingQuality = 'high';
    if (sheet.complete && sheet.naturalWidth) {
      o.globalCompositeOperation = 'lighter';
      o.globalAlpha = 1 - ft; o.drawImage(sheet, i0 * FW, an.r * FHH, FW, FHH, -COLS / 2, -ROWS * FOOT, COLS, ROWS);
      if (ft > 0.01) { o.globalAlpha = ft; o.drawImage(sheet, i1 * FW, an.r * FHH, FW, FHH, -COLS / 2, -ROWS * FOOT, COLS, ROWS); }
      o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    }
    var d = o.getImageData(0, 0, COLS, ROWS).data;
    var cp = FH / ROWS, ox = S.x - (COLS / 2) * cp, oy = fy - ROWS * FOOT * cp;
    ctx.font = '700 ' + (cp * 1.22).toFixed(2) + 'px ' + MONO;
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      var q = (y * COLS + x) * 4, al = d[q + 3]; if (al < 34) continue;
      var r = d[q], g = d[q + 1], b = d[q + 2];
      var Lm = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      var dens = dk ? 0.3 + 0.7 * Lm : 0.34 + 0.66 * (1 - Lm);
      var gi = Math.round(dens * (RAMP.length - 1)) - (((x * 7 + y * 13) % 3) === 0 ? 1 : 0);
      ctx.globalAlpha = Math.min(1, (al / 255) * 1.15);
      // his gold glasses keep their own bright metal colour and a solid glyph
      if (r > 140 && g > 100 && b < g * 0.64 && r - b > 80) { ctx.fillStyle = dk ? GOLD_D : GOLD_L; ctx.globalAlpha = 1; ctx.fillText(((x + y) & 1) ? '#' : '@', ox + x * cp, oy + y * cp); continue; }
      ctx.fillStyle = colour(r, g, b, dk);
      var gch = RAMP[clamp(gi, 2, RAMP.length - 1)];
      ctx.fillText(gch, ox + x * cp, oy + y * cp);
      if (!dk) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = cp * 0.28; ctx.strokeText(gch, ox + x * cp, oy + y * cp); }
    }
    ctx.globalAlpha = 1;
    var facing = S.dir;
    SK.pipe = typed.full && S.mode === 'idle' ? { x: S.x + facing * 26 * u, y: fy - FH * 0.98 } : null;

    // the magnifier: raised toward whatever he studies; one eye, ASCII, under glass
    if (S.aimA > 0.04 && S.mode !== 'held' && S.mode !== 'air') {
      var ca = Math.cos(S.aim), sa = Math.sin(S.aim);
      var hx = S.x + facing * 30 * u, hy = fy - FH * 0.44;
      var lc = { x: hx + facing * ca * 30 * u, y: hy + sa * 30 * u }, R = 13 * u;
      ctx.save(); ctx.globalAlpha = Math.min(1, S.aimA * 1.2);
      ctx.strokeStyle = dk ? '#a0764a' : '#6b4a2b'; ctx.lineWidth = 3.2 * u; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(lc.x - facing * ca * R, lc.y - sa * R); ctx.stroke();
      ctx.beginPath(); ctx.arc(lc.x, lc.y, R, 0, Math.PI * 2);
      ctx.fillStyle = dk ? 'rgba(10,18,24,0.94)' : 'rgba(240,246,250,0.96)'; ctx.fill();
      ctx.save(); ctx.clip();
      if (eyeLum) {
        var ecols = 24, ecw = (R * 2) / ecols, ech = ecw * 1.7, erows = Math.ceil((R * 2) / ech);
        ctx.font = '700 ' + (ech * 0.95).toFixed(1) + 'px ' + MONO;
        var spanC = EC1 - EC0, look = S.look * 0.07;
        for (var ey = 0; ey < erows; ey++) for (var ex = 0; ex < ecols; ex++) {
          var uu = ex / ecols, vv = ey / erows;
          var sxg = clamp(Math.round(EC0 + (uu - look) * spanC), 0, E.c - 1), syg = clamp(Math.round(vv * (E.r - 1)), 0, E.r - 1);
          var Le = eyeLum[syg * E.c + sxg], ix = Math.round(Math.pow(Le, 1.25) * (EYE_RAMP.length - 1));
          if (ix < 1) continue;
          ctx.fillStyle = dk ? 'rgba(220,240,255,' + (0.35 + 0.65 * Le).toFixed(2) + ')' : 'rgba(20,30,40,' + (0.3 + 0.7 * (1 - Le)).toFixed(2) + ')';
          ctx.fillText(dk ? EYE_RAMP[ix] : EYE_RAMP[EYE_RAMP.length - 1 - ix], lc.x - R + ex * ecw, lc.y - R + ey * ech);
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.11)'; ctx.beginPath(); ctx.ellipse(lc.x - R * 0.35, lc.y - R * 0.45, R * 0.45, R * 0.2, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = dk ? '#d9d9d9' : '#3a3a3a'; ctx.lineWidth = Math.max(1.8, u * 2.4);
      ctx.beginPath(); ctx.arc(lc.x, lc.y, R, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // bubble over the hat, hit area over the body
    var bw = bubble.offsetWidth || 220, bh = bubble.offsetHeight || 40;
    var bx = clamp(S.x - bw / 2, 8, VW - bw - 8), by = clamp(fy - FH * 0.97 - bh - 4, 8, VH - bh - 8);
    bubble.style.transform = 'translate(' + bx.toFixed(0) + 'px,' + by.toFixed(0) + 'px)';
    if (typed.full) {
      if (typed.n < typed.full.length) { typed.n = Math.min(typed.full.length, typed.n + Math.max(1, Math.round(dt * 45))); btext.textContent = typed.full.slice(0, typed.n); }
      if (now > typed.until) { bubble.classList.remove('on'); typed.full = ''; }
    }
    var hw = 66 * u, hh = FH * 0.94;
    hit.style.display = ''; bubble.style.visibility = '';
    hit.style.transform = 'translate(' + (S.x - hw / 2).toFixed(0) + 'px,' + (fy - hh).toFixed(0) + 'px)';
    hit.style.width = hw + 'px'; hit.style.height = hh.toFixed(0) + 'px';
  }
  function hideUI() { hit.style.display = 'none'; bubble.style.visibility = 'hidden'; }

  // ---------- input ----------
  window.addEventListener('pointermove', function (e) {
    var now = performance.now();
    if (mouse) { var dtm = Math.max(1, now - mouse.t); mouse.sp = ease(mouse.sp, Math.hypot(e.clientX - mouse.cx, e.clientY - mouse.cy) / dtm * 1000, 0.5, 1); }
    mouse = { cx: e.clientX, cy: e.clientY, t: now, sp: mouse ? mouse.sp : 0 };
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { mouse = null; });

  hit.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { hit.setPointerCapture(e.pointerId); } catch (_) {}
    grab = { sx: e.clientX, sy: e.clientY, moved: false, last: { x: e.clientX, y: e.clientY }, hist: [] };
  });
  hit.addEventListener('pointermove', function (e) {
    if (!grab) return;
    grab.last = { x: e.clientX, y: e.clientY };
    grab.hist.push({ x: e.clientX, y: e.clientY + window.scrollY, t: performance.now() }); if (grab.hist.length > 8) grab.hist.shift();
    if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > 6) { grab.moved = true; S.mode = 'held'; S.floor = null; S.hvx = 0; hit.classList.add('grab'); }
  });
  function release() {
    if (!grab) return;
    hit.classList.remove('grab');
    if (!grab.moved) { nextDeduction(); if (S.mode === 'idle' || S.mode === 'walk') { S.mode = 'idle'; S.timer = 4; S.walking = false; S.anim = ''; play('wave', true); } }
    else {
      var h = grab.hist, vx = 0, vy = 0;
      if (h.length > 1) { var a = h[0], b = h[h.length - 1], dt = Math.max(16, b.t - a.t) / 1000; vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; }
      var sp = Math.hypot(vx, vy); if (sp > 2200) { vx *= 2200 / sp; vy *= 2200 / sp; }
      S.vx = vx; S.vy = vy; S.mode = 'air';
    }
    grab = null;
  }
  hit.addEventListener('pointerup', release); hit.addEventListener('pointercancel', release);

  // ---------- loop ----------
  var last = 0;
  function loop(now) {
    var dt = Math.min(0.04, (now - (last || now)) / 1000); last = now;
    update(reduce ? 0 : dt, now);
    render(now, dt);
    requestAnimationFrame(loop);
  }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 120); });
  size();
  setTimeout(function () { if (!typed.full) nextDeduction(); }, 1800);
  requestAnimationFrame(loop);
  window.SHERLOCK = { say: nextDeduction, state: S };
})();
