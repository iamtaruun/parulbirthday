/* ============================================================
   Parul — interactive cinematic birthday story
   Vanilla JS only. Sections:
   0. helpers / screen router
   1. particle canvas (stars, dust, gold, confetti, hearts)
   2. music
   3. gift  4. password  5. curtain  6. birthday
   7. memories  8. balloons  9. proposal
   10. scratch card  11. letter  12. final + replay
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const BIRTH = new Date(2007, 8, 2, 0, 0, 0); // 02 September 2007
const PASSWORD = '020907';

/* ---------- 0. Screen router ------------------------------- */
const ORDER = ['s-gift','s-pass','s-curtain','s-bday','s-memories','s-balloons','s-propose','s-scratch','s-letter','s-final'];

async function go(id, mood) {
  const cur = $('.screen.active');
  const next = $('#' + id);
  if (!next || cur === next) return;
  if (cur) {
    cur.classList.add('leaving');
    await wait(REDUCED ? 60 : 520);
    cur.classList.remove('active', 'leaving');
  }
  next.classList.add('active');
  setMood(mood || next.dataset.mood);
  onEnter(id);
}
function setMood(mood) {
  document.body.classList.remove('mood-dark','mood-warm','mood-paper');
  document.body.classList.add('mood-' + (mood || 'dark'));
  FX.setMood(mood || 'dark');
}
function onEnter(id) {
  if (id === 's-bday')     startCounter();
  if (id === 's-memories') renderPolaroid(0);
  if (id === 's-balloons') buildBalloons();
  if (id === 's-propose')  runProposal();
  if (id === 's-scratch')  initScratch();
  if (id === 's-letter')   revealLetter();
  if (id === 's-final')    runFinal();
}

/* ---------- 1. Particle canvas ----------------------------- */
const FX = (() => {
  const c = $('#fx'), ctx = c.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  let mood = 'dark';
  let stars = [], dust = [], burst = [];

  function resize() {
    w = c.width  = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
    build();
  }
  function build() {
    const n = innerWidth < 480 ? 46 : 80;                  // keep particle count modest
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.2 + .3) * dpr,
      a: Math.random(), s: Math.random() * .02 + .004
    }));
    dust = Array.from({ length: innerWidth < 480 ? 24 : 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.6 + .6) * dpr,
      vy: -(Math.random() * .25 + .06) * dpr,
      vx: (Math.random() - .5) * .12 * dpr,
      a: Math.random() * .5 + .15
    }));
  }
  /** spawn a burst: confetti / gold / hearts */
  function spawn(kind, count = 60, ox = .5, oy = .5) {
    const colors = kind === 'confetti'
      ? ['#E8A7B8','#D8B36A','#F5EBDD','#4A1820','#fff']
      : ['#D8B36A','#f0d9a5','#F5EBDD'];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2, sp = (Math.random() * 4 + 1.5) * dpr;
      burst.push({
        x: w * ox, y: h * oy,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.2 * dpr,
        r: (Math.random() * 3 + 1.6) * dpr, life: 1,
        col: colors[(Math.random() * colors.length) | 0],
        heart: kind === 'hearts' && Math.random() > .4
      });
    }
  }
  function heart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * .35);
    ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.2, x, y + s * 1.5);
    ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s, x + s, y + s * .35);
    ctx.bezierCurveTo(x + s, y, x, y, x, y + s * .3);
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const starCol = mood === 'paper' ? '74,24,32' : '255,255,255';
    const dustCol = mood === 'warm' ? '255,200,140' : '216,179,106';
    const starMax = mood === 'paper' ? .15 : mood === 'warm' ? .4 : .85;

    stars.forEach(s => {
      s.a += s.s; const al = (Math.sin(s.a) * .5 + .5) * starMax;
      ctx.fillStyle = `rgba(${starCol},${al})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    });
    dust.forEach(d => {
      d.y += d.vy; d.x += d.vx;
      if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w; }
      ctx.fillStyle = `rgba(${dustCol},${d.a * (mood === 'paper' ? .3 : 1)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    });
    for (let i = burst.length - 1; i >= 0; i--) {
      const p = burst[i];
      p.x += p.vx; p.y += p.vy; p.vy += .06 * dpr; p.life -= .012;
      if (p.life <= 0) { burst.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.col;
      if (p.heart) heart(p.x, p.y, p.r * 2);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', resize);
  resize(); frame();
  return { spawn, setMood: (m) => (mood = m) };
})();

/* ---------- 2. Music --------------------------------------- */
const bgm = $('#bgm'), mBtn = $('#music-btn'), mIco = $('#music-ico');
let musicReady = false;
bgm.volume = 0;
function startMusic() {
  if (musicReady) return;
  musicReady = true;
  bgm.play().then(() => {                        // fade in gently
    mIco.textContent = '❚❚';
    let v = 0; const t = setInterval(() => {
      v = Math.min(v + .04, .55); bgm.volume = v;
      if (v >= .55) clearInterval(t);
    }, 120);
  }).catch(() => { musicReady = false; });       // no file / blocked: stay silent
}
mBtn.addEventListener('click', () => {
  if (bgm.paused) { musicReady = false; startMusic(); }
  else { bgm.pause(); mIco.textContent = '▶'; }
});

/* ---------- 3. Screen 1: gift ------------------------------ */
const gift = $('#gift');
let opened = false;
gift.addEventListener('pointermove', (e) => {                // hover / touch tilt
  const r = gift.getBoundingClientRect();
  const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
  const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
  if (!opened) gift.style.transform = `rotateX(${-16 - dy * 14}deg) rotateY(${-24 + dx * 26}deg)`;
});
gift.addEventListener('pointerleave', () => {
  if (!opened) gift.style.transform = '';
});
const openGift = async () => {
  if (opened) return; opened = true;
  startMusic();
  gift.classList.add('shake');
  await wait(REDUCED ? 100 : 900);
  gift.classList.remove('shake'); gift.classList.add('open');
  FX.spawn('gold', 70, .5, .52);
  document.body.classList.add('flash');
  await wait(REDUCED ? 200 : 1500);
  document.body.classList.remove('flash');
  go('s-pass');
};
gift.addEventListener('click', openGift);
gift.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openGift(); });

/* ---------- 4. Screen 2: password -------------------------- */
function updateClock() {
  const now = new Date();

  $('#clock').textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

updateClock();
setInterval(updateClock, 1000);

let entry = '', attempts = 0;
const dotsEl = $('#dots'), passMsg = $('#pass-msg');
const drawDots = () => {
  dotsEl.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span');
    if (i < entry.length) s.className = 'on';
    dotsEl.appendChild(s);
  }
};
drawDots();
$('#keypad').addEventListener('click', async (e) => {
  const k = e.target.dataset?.k; if (!k) return;
  startMusic();
  if (k === 'del') { entry = entry.slice(0, -1); drawDots(); return; }
  if (entry.length >= 6) return;
  entry += k; drawDots();
  if (entry.length < 6) return;

  if (entry === PASSWORD) {
    passMsg.textContent = 'ACCESS GRANTED ✨';
    passMsg.classList.add('ok');
    FX.spawn('gold', 60, .5, .45);
    await wait(REDUCED ? 300 : 1600);
    go('s-curtain');
  } else {
    attempts++;

  const messages = [
    "Hmm… that's not it 👀",
    "Think again, Doolu. 😂",
    "Come on… you know this one. ❤️"
  ];

  passMsg.classList.remove('ok');

  passMsg.textContent =
    messages[Math.min(attempts - 1, messages.length - 1)];

  dotsEl.classList.add('shakeX');

  setTimeout(() => {
    dotsEl.classList.remove('shakeX');
  }, 420);

  entry = '';
  drawDots();
  }
});

/* ---------- 5. Screen 3: curtain --------------------------- */
$('#curtain-go').addEventListener('click', async () => {
  const s = $('#s-curtain');
  s.classList.add('opening');
  FX.spawn('gold', 40, .5, .5);
  await wait(REDUCED ? 300 : 2500);
  go('s-bday');
  s.classList.remove('opening');
});

/* ---------- 6. Screen 4: birthday -------------------------- */
let counterTimer = null;
function startCounter() {
  const el = $('#counter');
  const tick = () => {
    const now = new Date();
    let y = now.getFullYear() - BIRTH.getFullYear();
    const anniv = new Date(now.getFullYear(), BIRTH.getMonth(), BIRTH.getDate());
    if (now < anniv) y--;
    const last = new Date(now.getFullYear() - (now < anniv ? 1 : 0), BIRTH.getMonth(), BIRTH.getDate());
    let ms = now - last;
    const d = Math.floor(ms / 86400000); ms -= d * 86400000;
    const h = Math.floor(ms / 3600000);  ms -= h * 3600000;
    const m = Math.floor(ms / 60000);    ms -= m * 60000;
    const s = Math.floor(ms / 1000);
    el.innerHTML = [['YEARS', y], ['DAYS', d], ['HOURS', h], ['MINUTES', m], ['SECONDS', s]]
      .map(([l, v]) => `<div class="cell"><div class="num">${v}</div><div class="lbl">${l}</div></div>`).join('');
  };
  tick();
  clearInterval(counterTimer);
  counterTimer = setInterval(tick, 1000);
}
$('#blow').addEventListener('click', async (e) => {
  $('#cake').classList.add('out');
  e.target.disabled = true; e.target.style.opacity = .4;
  FX.spawn('confetti', 90, .5, .35);
  $('#wish').textContent = 'Make a wish… ✨';
  await wait(REDUCED ? 500 : 2600);
  $('#wish').textContent = "Now let's look at some memories. ❤️";
  await wait(REDUCED ? 400 : 2200);
  go('s-memories');
});

/* ---------- 7. Screen 5: memories -------------------------- */
/* Replace `src` with real photos in assets/images/ when available. */
const MEMORIES = [
  { cap: 'My favorite distraction, unfortunately. ❤️', src: 'photo1.jpeg' },
  { cap: 'This is the kind of picture I could look at for way too long',  src: 'photo2.jpeg' },
  { cap: 'Proof that my taste in girls is actually excellent.', src: 'photo3.jpeg' },
  { cap: 'How am I supposed to act normal after seeing this?',    src: 'photo4.jpeg' },
  { cap: 'Still my favorite face to look at.',           src: 'photo5.jpeg' },
  { cap: "If I had to choose again, I'd still choose you. ❤️", src: 'photo6.jpeg' },
  { cap: 'Madam Ji and her attitude 😌',     src: 'photo7.jpeg' },
  { cap: 'My Mirchi looking innocent for once. 🌶️😂',                     src: 'photo8.jpeg' },
];
const TRANS = ['in-slide', 'in-flip', 'in-fade', 'in-rot'];
const TINTS = ['linear-gradient(140deg,#4A1820,#E8A7B8)','linear-gradient(140deg,#2a1d3a,#D8B36A)','linear-gradient(140deg,#1a2a2a,#E8A7B8)','linear-gradient(140deg,#3a2418,#f0d9a5)'];
let memIdx = 0;
function renderPolaroid(i) {
  memIdx = (i + MEMORIES.length) % MEMORIES.length;
  const m = MEMORIES[memIdx];
  const stage = $('#polaroid-stage');
  stage.innerHTML = `
    <div class="polaroid ${TRANS[memIdx % TRANS.length]}">
      <div class="photo" style="${m.src ? `background:url('${m.src}') center/cover` : `background:${TINTS[memIdx % TINTS.length]}`}">
        ${m.src ? '' : 'photo coming soon'}
      </div>
      <p class="cap">${m.cap}</p>
      <span class="no">${String(memIdx + 1).padStart(2, '0')} / ${MEMORIES.length}</span>
    </div>`;
}
$('#mem-prev').addEventListener('click', () => renderPolaroid(memIdx - 1));
$('#mem-next').addEventListener('click', () => {
  if (memIdx === MEMORIES.length - 1) go('s-balloons');
  else renderPolaroid(memIdx + 1);
});
$('#mem-skip').addEventListener('click', () => go('s-balloons'));

/* ---------- 8. Screen 6: balloons -------------------------- */
const NICKS = ['Doolu','Mirchi','Shawtty','Cutepiee','Paaro','Madam Ji','My Doolu 💗','Mirchi No.1 🌶️'];
const BCOL = ['#E8A7B8','#D8B36A','#4A1820','#f0d9a5','#c7788f','#F5EBDD'];
let popped = 0;
function buildBalloons() {
  const field = $('#balloon-field');
  field.innerHTML = ''; popped = 0;
  $('#balloon-done').classList.remove('show');
  $('#pop-word').textContent = '\u00a0';
  NICKS.forEach((nick, i) => {
    const b = document.createElement('button');
    b.className = 'balloon';
    b.setAttribute('aria-label', 'Pop balloon');
    b.style.left = `${8 + (i % 4) * 23 + Math.random() * 6}%`;
    b.style.top  = `${16 + Math.floor(i / 4) * 26 + Math.random() * 10}%`;
    b.innerHTML = `<span class="body" style="background:radial-gradient(circle at 32% 28%,#fff8,${BCOL[i % BCOL.length]});animation-delay:${(i * .4).toFixed(1)}s"></span><span class="string"></span>`;
    b.addEventListener('click', () => {
      if (b.classList.contains('popped')) return;
      b.classList.add('popped');
      const r = b.getBoundingClientRect();
      FX.spawn('confetti', 22, (r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight);
      $('#pop-word').textContent = nick;
      if (++popped === NICKS.length) {
        setTimeout(() => $('#balloon-done').classList.add('show'), 500);
      }
    });
    field.appendChild(b);
  });
}
$('#balloon-next').addEventListener('click', () => go('s-propose'));

/* ---------- 9. Screen 7: proposal -------------------------- */
const NO_LINES = [
  'Think again… 🥺',
  'Are you really sure?',
  "Okay… I'll give you one more chance. 😭",
  "You really enjoy hurting me, don't you? 😂",
  'Last chance. ❤️'
];
let noCount = 0, proposalRan = false;
async function runProposal() {
  if (proposalRan) return; proposalRan = true;
  await wait(REDUCED ? 200 : 2600);
  $('#prop-1').style.opacity = .45;
  $('#prop-2').classList.remove('hidden');
  await wait(REDUCED ? 150 : 1200);
  $('#choice').classList.remove('hidden');
}
$('#no').addEventListener('click', () => {
  $('#no-msg').textContent = NO_LINES[Math.min(noCount, NO_LINES.length - 1)];
  noCount++;
  $('#no').classList.add('shy');                     // still fully clickable
  if (noCount >= NO_LINES.length) $('#no-msg').textContent = 'Last chance. ❤️';
});
$('#yes').addEventListener('click', async () => {
  $('#choice').classList.add('hidden');
  $('#prop-1').classList.add('hidden');
  $('#prop-2').classList.add('hidden');
  $('#no-msg').textContent = '\u00a0';
  await wait(REDUCED ? 100 : 700);
  $('#yes-copy').classList.remove('hidden');
  FX.spawn('gold', 90, .5, .5);
  setTimeout(() => FX.spawn('hearts', 60, .5, .55), 500);
  await wait(REDUCED ? 400 : 2800);
  $('#yes-sub').textContent = 'Now I have something I really want to tell you…';
  await wait(REDUCED ? 400 : 2600);
  go('s-scratch');
});

/* ---------- 10. Screen 8: scratch card --------------------- */
let scratchInit = false;
function initScratch() {
  if (scratchInit) return; scratchInit = true;
  const cv = $('#scratch'), ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr; cv.height = rect.height * dpr;

  // Foil layer
  const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
  g.addColorStop(0, '#D8B36A'); g.addColorStop(.5, '#f0d9a5'); g.addColorStop(1, '#b8924f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = 'rgba(74,24,32,.5)';
  ctx.font = `${22 * dpr}px Poppins, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SCRATCH HERE', cv.width / 2, cv.height / 2);
  ctx.globalCompositeOperation = 'destination-out';

  let drawing = false, done = false;
  const at = (e) => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr];
  };
  const scratch = (e) => {
    const [x, y] = at(e);
    ctx.beginPath(); ctx.arc(x, y, 26 * dpr, 0, 7); ctx.fill();
  };
  const check = () => {
    if (done) return;
    const step = 12 * dpr;
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, total = 0;
    for (let y = 0; y < cv.height; y += step)
      for (let x = 0; x < cv.width; x += step) {
        total++; if (d[((y * cv.width + x) << 2) + 3] < 40) clear++;
      }
    if (clear / total > .6) {          // ~60% scratched → auto reveal
      done = true;
      cv.classList.add('gone');
      $('#scratch-hint').textContent = '';
      setTimeout(() => go('s-letter'), 900);
    }
  };
  cv.addEventListener('pointerdown', (e) => { drawing = true; cv.setPointerCapture(e.pointerId); scratch(e); });
  cv.addEventListener('pointermove', (e) => { if (drawing) scratch(e); });
  cv.addEventListener('pointerup',   () => { drawing = false; check(); });
  cv.addEventListener('pointercancel', () => { drawing = false; check(); });
}

/* ---------- 11. Screen 9: letter --------------------------- */
function revealLetter() {
  const ps = $$('#letter p');
  ps.forEach((p, i) => setTimeout(() => p.classList.add('show'), REDUCED ? 0 : i * 700));
}
$('#letter-done').addEventListener('click', () => go('s-final'));

/* ---------- 12. Final + replay ----------------------------- */
async function runFinal() {
  const steps = $$('#final-lines [data-step]');
  for (const s of steps) {
    s.classList.add('show');
    FX.spawn('gold', 14, .5, .5);
    await wait(REDUCED ? 250 : 2400);
  }
  $('#replay').classList.remove('hidden');
}
$('#replay').addEventListener('click', () => location.reload());

/* ---------- boot ------------------------------------------- */
setMood('dark');
// Prepare the audio early; playback still waits for the first interaction.
bgm.load();
