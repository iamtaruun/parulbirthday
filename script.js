/* =========================================================================
   For Madam Ji — interactive birthday journey
   Vanilla JS. Organised by concern:
   utils → assets → scenes/nav → fx → music → each chapter → boot
   ========================================================================= */

/* ---------------------------------- utils -------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = ms => (reduced ? Math.min(ms, 120) : ms);

/** Reveal lines one by one inside a `.cine` container. */
async function cineLines(el, lines, { gap = 1400, cls = '' } = {}) {
  el.innerHTML = '';
  for (const line of lines) {
    const p = document.createElement('p');
    if (typeof line === 'object') { p.textContent = line.t; if (line.small) p.classList.add('small'); }
    else p.textContent = line;
    if (cls) p.classList.add(cls);
    el.appendChild(p);
    await wait(T(gap));
  }
}

/* --------------------------------- assets -------------------------------- */
/** Marked placeholder so missing personal media never breaks the page. */
function placeholder(label = 'PHOTO COMING SOON') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <rect width="100%" height="100%" fill="#e9e2d8"/>
    <g fill="#a8968a" font-family="monospace" text-anchor="middle">
      <text x="300" y="290" font-size="64">🖼️</text>
      <text x="300" y="350" font-size="26">${label}</text>
    </g></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function safeImg(img, src, label) {
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => { img.src = placeholder(label); }, { once: true });
  img.src = src;
}

/* ------------------------------ scenes / nav ------------------------------ */
const ORDER = ['s-hack','s-envelope','s-pass','s-intro','s-count','s-story','s-hand','s-stairs',
  's-nopic','s-gallery','s-thennow','s-reasons','s-museum','s-e1','s-e2','s-scratch','s-balloons',
  's-mirror','s-letter','s-pencil','s-love','s-final','s-bday'];

let current = 's-hack';
const started = new Set();
const chapterInit = {};   // id -> function run once when the chapter opens

async function goTo(id) {
  if (id === current) return;
  const from = $('#' + current), to = $('#' + id);
  from.classList.add('leaving');
  await wait(T(420));
  from.classList.remove('active', 'leaving');
  current = id;
  document.body.classList.toggle('mode-rom', to.dataset.mode === 'rom');
  to.classList.add('active');
  to.scrollTop = 0;
  if (!started.has(id) && chapterInit[id]) { started.add(id); chapterInit[id](); }
}
const next = () => goTo(ORDER[Math.min(ORDER.indexOf(current) + 1, ORDER.length - 1)]);
$$('.btn.next').forEach(b => b.addEventListener('click', next));

/* ---------------------------- background particles ------------------------ */
const canvas = $('#particles'), ctx = canvas.getContext('2d');
let parts = [], confetti = [], W = 0, H = 0;
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

function spawnAmbient() {
  parts = Array.from({ length: 34 }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4,
    v: .2 + Math.random() * .6, a: .15 + Math.random() * .45,
    heart: Math.random() < .28
  }));
}
spawnAmbient();

function burstConfetti(n = 160) {
  const colors = ['#ff7aa2','#ffd39b','#7CFFA0','#fff6ef','#c9366a','#9ad7ff'];
  for (let i = 0; i < n; i++) confetti.push({
    x: Math.random() * W, y: -20 - Math.random() * H * .4,
    vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 4,
    s: 4 + Math.random() * 7, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .25,
    c: colors[(Math.random() * colors.length) | 0], heart: Math.random() < .3
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const rom = document.body.classList.contains('mode-rom');
  for (const p of parts) {
    p.y -= p.v; if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
    ctx.globalAlpha = p.a;
    if (rom && p.heart) { ctx.font = `${p.r * 7}px serif`; ctx.fillStyle = '#ff8fb0'; ctx.fillText('❤', p.x, p.y); }
    else { ctx.fillStyle = rom ? '#ffd7e4' : '#7CFFA0'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
  }
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.vy += .02;
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = c.c;
    if (c.heart) { ctx.font = `${c.s * 2}px serif`; ctx.fillText('❤', 0, 0); }
    else ctx.fillRect(-c.s / 2, -c.s / 2, c.s, c.s * .6);
    ctx.restore();
    if (c.y > H + 40) confetti.splice(i, 1);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
if (!reduced) draw();

/* ---------------------------------- music -------------------------------- */
const music = $('#music'), player = $('#player');
let musicReady = false;
function enableMusic() {
  if (musicReady) return;
  musicReady = true;
  player.hidden = false;
  music.volume = .6;
  music.play().then(() => ($('#playBtn').textContent = '❚❚')).catch(() => {});
}
$('#playBtn').addEventListener('click', () => {
  if (music.paused) { music.play().catch(() => {}); $('#playBtn').textContent = '❚❚'; }
  else { music.pause(); $('#playBtn').textContent = '▶'; }
});
$('#muteBtn').addEventListener('click', () => {
  music.muted = !music.muted;
  $('#muteBtn').textContent = music.muted ? '🔇' : '🔊';
});
$('#vol').addEventListener('input', e => { music.volume = +e.target.value; });

/* ------------------------- 01 fake hacking intro -------------------------- */
async function typeLines(pre, lines, { speed = 18, pause = 320 } = {}) {
  for (const l of lines) {
    const span = document.createElement('span');
    if (l.cls) span.className = l.cls;
    pre.appendChild(span);
    const text = l.t ?? l;
    for (const ch of text) { span.textContent += ch; await wait(reduced ? 0 : speed); }
    pre.appendChild(document.createTextNode('\n'));
    pre.scrollTop = pre.scrollHeight;
    await wait(T(pause));
  }
}

async function runIntroHack() {
  const pre = $('#hackLog');
  await typeLines(pre, [
    '> Initializing system...',
    '> Establishing secure connection...',
    '> Searching target...',
    '> Target identified.',
    '> Target: PARUL',
    '> Security level: ██████████',
    '> Beginning extraction...'
  ]);
  const bar = $('#hackBar'); bar.hidden = false;
  const fill = bar.firstElementChild;
  for (let i = 0; i <= 100; i += 2) { fill.style.width = i + '%'; await wait(reduced ? 0 : 22); }
  await typeLines(pre, [
    '',
    '> Memories found',
    '> Nicknames found',
    '> Birthday found',
    '> Emotional data found',
    '> Relationship history found',
    { t: '> WARNING: subject is unusually cute', cls: 'warn' },
    { t: '> DATA EXTRACTION COMPLETE ✓', cls: 'ok' }
  ], { pause: 260 });
  await wait(T(700));
  $('#s-hack').classList.add('glitch');
  await wait(T(900));
  $('#s-hack').classList.remove('glitch');
  goTo('s-envelope');
}

/* ---------------------------- 02 envelope --------------------------------- */
$('#envelope').addEventListener('click', async e => {
  e.currentTarget.classList.add('open');
  enableMusic();
  await wait(T(1100));
  goTo('s-pass');
});

/* ---------------------------- 03 password --------------------------------- */
const PASSWORD = '020907';
let attempts = 0;
const wrongMsgs = [
  '❌ ACCESS DENIED',
  '❌ ACCESS DENIED — Think harder, Madam Ji. 😂',
  '❌ ACCESS DENIED — Gusse Ki Dukaan is not the password. 😂'
];

chapterInit['s-pass'] = async () => {
  const pre = $('#passLog');
  await typeLines(pre, [
    { t: '> WAIT...', cls: 'warn' },
    '> The extracted data is encrypted.',
    '> Password required.'
  ], { pause: 700 });
  $('#passForm').hidden = false;
  $('#passInput').focus();
};

$('#passForm').addEventListener('submit', async e => {
  e.preventDefault();
  const val = $('#passInput').value.trim();
  const msg = $('#passMsg');
  if (val === PASSWORD) {
    msg.classList.remove('bad');
    msg.textContent = '🔓 ACCESS GRANTED';
    $('#passForm').hidden = true; $('#hintBtn').hidden = true;
    await wait(T(1100));
    const pre = $('#passLog');
    await typeLines(pre, [
      '',
      '> Hey... I have to tell you something.',
      '> It\'s actually my phone password.',
      { t: '> By the way 😂😂', cls: 'ok' }
    ], { pause: 1100 });
    await wait(T(1200));
    $('#s-pass').classList.add('glitch');
    await wait(T(800));
    goTo('s-intro');
    return;
  }
  attempts++;
  msg.classList.add('bad');
  msg.textContent = wrongMsgs[Math.min(attempts - 1, wrongMsgs.length - 1)];
  $('#passInput').value = '';
  if (attempts >= 3) $('#hintBtn').hidden = false;
});
$('#hintBtn').addEventListener('click', () => {
  $('#passMsg').classList.remove('bad');
  $('#passMsg').textContent = 'Hint: Put your birthdate. 👀';
});

/* --------------------------- 04 personal intro ---------------------------- */
chapterInit['s-intro'] = async () => {
  enableMusic();
  await cineLines($('#introCine'), [
    'Hey Madam Ji ❤️',
    'You probably thought you were just opening a birthday website...',
    'You were wrong. 😂',
    'I made a little journey for you.'
  ], { gap: 1800 });
  $('#startJourney').hidden = false;
};
$('#startJourney').addEventListener('click', next);

/* ----------------------------- 05 countdown ------------------------------- */
function nextBirthday() {
  const now = new Date();
  const y = now.getFullYear();
  const target = new Date(y, 8, 2, 0, 0, 0);      // 2 September
  const end = new Date(y, 8, 3, 0, 0, 0);
  if (now >= end) return new Date(y + 1, 8, 2);
  return target;
}
function tickCountdown() {
  const now = new Date();
  const isBday = now.getMonth() === 8 && now.getDate() === 2;
  if (isBday) {
    $('#cdText').textContent = 'TODAY IS YOUR DAY! 🎂❤️';
    $('#cd').hidden = true;
    return;
  }
  const diff = Math.max(0, nextBirthday() - now);
  const s = Math.floor(diff / 1000);
  const set = (id, v) => ($(id).textContent = String(v).padStart(2, '0'));
  set('#cdD', Math.floor(s / 86400)); set('#cdH', Math.floor(s / 3600) % 24);
  set('#cdM', Math.floor(s / 60) % 60); set('#cdS', s % 60);
}
setInterval(tickCountdown, 1000); tickCountdown();

/* ----------------------------- 06 our story ------------------------------- */
chapterInit['s-hand'] = async () => {
  const btn = $('#s-hand .next');
  await cineLines($('#handCine'), [
    'Do you remember our first handshake?',
    'Because I do. ❤️',
    { t: 'It is still my favourite memory. Small thing. Stayed forever.', small: true }
  ], { gap: 1900 });
  btn.hidden = false;
};
chapterInit['s-stairs'] = async () => {
  const btn = $('#s-stairs .next');
  await cineLines($('#stairCine'), [
    'Do you remember the staircase? 👀',
    '"Jab tere saath Kanchan thi..."',
    '"...aur mera first proposal." 🤣😁',
    { t: 'Legendary. Historians will study it.', small: true }
  ], { gap: 1900 });
  btn.hidden = false;
};

/* --------------------- 07 the picture we don't have ----------------------- */
$('#blankPola').addEventListener('click', async e => {
  e.currentTarget.disabled = true;
  e.currentTarget.querySelector('.pola-cap').textContent = '(still empty)';
  await cineLines($('#nopicCine'), [
    'Wait... 😂',
    'How can we have a picture?',
    'You haven\'t even clicked a picture with me! 😂',
    'So... there is no picture to show.',
    'I guess we need to fix that someday. ❤️'
  ], { gap: 1700 });
  $('#s-nopic .next').hidden = false;
});

/* ------------------------ 08 hanging polaroid wall ------------------------ */
const GALLERY = [
  { src: 'photo1.jpeg', cap: 'Exhibit A: Mirchi 🌶️' },
  { src: 'photo2.jpeg', cap: 'Madam Ji, on duty 👩‍💼' },
  { src: 'photo3.jpeg', cap: 'Shawtty energy 😎' },
  { src: 'photo4.jpeg', cap: 'Doolu moment 🧸' },
  { src: 'photo5.jpeg', cap: 'Paroo 🌸' },
  { src: 'photo6.jpeg', cap: 'Chand 🌙' },
  { src: 'photo7.jpeg', cap: 'Gusse Ki Dukaan, closed for once 😤' },
  { src: 'photo8.jpeg', cap: 'Certified favourite 💗' },
  { src: 'photo9.jpeg', cap: 'No caption needed ❤️' }
];

function buildWall() {
  const wall = $('#wall');
  wall.innerHTML = '';
  const perLine = innerWidth < 640 ? 2 : 3;
  for (let i = 0; i < GALLERY.length; i += perLine) {
    const line = document.createElement('div');
    line.className = 'line';
    const rope = document.createElement('div');
    rope.className = 'rope';
    rope.style.animationDelay = (i / perLine) * 0.25 + 's';
    const hooks = document.createElement('div');
    hooks.className = 'hooks';
    GALLERY.slice(i, i + perLine).forEach((ph, j) => {
      const hang = document.createElement('div');
      hang.className = 'hang';
      hang.style.setProperty('--rot', (Math.random() * 8 - 4).toFixed(2) + 'deg');
      hang.style.animationDelay = ((i / perLine) * 0.25 + j * 0.18 + 0.3) + 's, 0s';
      hang.style.marginTop = (10 + Math.random() * 22) + 'px';

      const pin = document.createElement('span'); pin.className = 'pin';
      const btn = document.createElement('button');
      btn.className = 'polaroid';
      btn.innerHTML = '<span class="pola-img"></span><span class="pola-cap"></span>';
      const img = document.createElement('img');
      img.alt = 'Photo of Parul — ' + ph.cap;
      safeImg(img, ph.src, 'PHOTO SOON');
      btn.querySelector('.pola-img').appendChild(img);
      btn.querySelector('.pola-cap').textContent = ph.cap;
      btn.addEventListener('click', () => openLightbox(img.src, ph.cap, img.alt));
      hang.append(pin, btn);
      hooks.appendChild(hang);
    });
    line.append(rope, hooks);
    wall.appendChild(line);
  }
}
chapterInit['s-gallery'] = async () => {
  buildWall();
  await wait(T(2600));
  await cineLines($('#galCine'), [
    'So many pictures of you... 😂❤️',
    'And somehow...',
    'not a single proper picture of us together. 😂',
    'Next mission: Get one with me. ❤️'
  ], { gap: 1800 });
  $('#s-gallery .next').hidden = false;
};

/* lightbox */
function openLightbox(src, cap, alt) {
  $('#lbImg').src = src; $('#lbImg').alt = alt || cap;
  $('#lbCap').textContent = cap;
  $('#lightbox').hidden = false;
  $('#lbClose').focus();
}
$('#lbClose').addEventListener('click', () => ($('#lightbox').hidden = true));
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') $('#lightbox').hidden = true; });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { $('#lightbox').hidden = true; }
});

/* ------------------------ 09 childhood → present -------------------------- */
safeImg($('#imgChild'), 'parul-childhood.jpeg', 'CHILDHOOD PHOTO');
safeImg($('#imgNow'), 'parul-present.jpeg', 'PRESENT PHOTO');
function setCompare(pct) {
  pct = Math.max(0, Math.min(100, pct));
  $('#cmpClip').style.width = pct + '%';
  $('#cmpHandle').style.left = pct + '%';
}
$('#cmpRange').addEventListener('input', e => setCompare(+e.target.value));
(function dragCompare() {
  const box = $('#compare');
  let dragging = false;
  const move = clientX => {
    const r = box.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setCompare(pct); $('#cmpRange').value = Math.round(pct);
  };
  box.addEventListener('pointerdown', e => { dragging = true; move(e.clientX); });
  addEventListener('pointermove', e => dragging && move(e.clientX));
  addEventListener('pointerup', () => (dragging = false));
})();
chapterInit['s-thennow'] = () => cineLines($('#tnCine'), [
  'Some things change...', 'Some things don\'t. ❤️'
], { gap: 2000 });

/* ---------------------- 10 things I love about you ------------------------ */
const TEASES = [
  'That\'s personal. 😌\nI\'ll not tell you.',
  'Nope. Classified. 🤐\nAgar jyada hi jaan\'na hai toh call karke puch lena. 😂',
  'Access denied (again). 😂\nSome things are said on call only.',
  'I\'ll tell you...\nbut not here. 😌',
  'Reason exists. Proof exists.\nDisclosure: pending. 👀',
  'Sorry Madam Ji.\nThis feature requires a phone call. 📞😂'
];
function buildReasons() {
  const box = $('#reasonCards'); box.innerHTML = '';
  TEASES.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'card';
    b.innerHTML = `❤️ Reason #${i + 1}<small>Click to reveal.</small>`;
    b.addEventListener('click', () => {
      b.classList.add('revealed');
      b.querySelector('small').textContent = t;
    });
    box.appendChild(b);
  });
}
chapterInit['s-reasons'] = buildReasons;

/* --------------------------- 11 nickname museum --------------------------- */
const NICKNAMES = [
  ['🌶️ Mirchi', 'MIRCHI™\n\nSPICE LEVEL: Unsafe for beginners\nSIDE EFFECTS: Sudden silence in the room\nANTIDOTE: One (1) apology, delivered fast 😂'],
  ['👩‍💼 Madam Ji', 'MADAM JI™\n\nDESIGNATION: Permanent boss\nORDERS PASSED: Countless\nOBJECTIONS ACCEPTED: 0\nEmployee of the relationship: me 😌'],
  ['😎 Shawtty', 'SHAWTTY™\n\nMOOD: Cool without trying\nCONFIDENCE: 200%\nWARNING: Do not compliment, ego already full 😂'],
  ['🧸 Doolu', 'DOOLU™\n\nCATEGORY: Soft toy, human edition\nHUG RATING: 10/10\nRETURN POLICY: Never returning her 🧸'],
  ['🌸 Paroo', 'PAROO™\n\nUSED WHEN: I need something\nSUCCESS RATE: Surprisingly high\nSMILE OUTPUT: Immediate 🌸'],
  ['🌙 Chand', 'CHAND™\n\nVISIBILITY: Even on bad days\nBRIGHTNESS: Slightly illegal\nNOTE: Yes, this one is the romantic one. Don\'t screenshot it. 😌'],
  ['😤 Gusse Ki Dukaan', 'GUSSE KI DUKAAN™\n\nSTATUS: OPEN 😂\nCUSTOMERS: Me\nREFUND POLICY: None\nCLOSING TIME: Unknown']
];
chapterInit['s-museum'] = () => {
  const box = $('#nickCards'); box.innerHTML = '';
  NICKNAMES.forEach(([name, desc]) => {
    const b = document.createElement('button');
    b.className = 'card';
    b.innerHTML = `${name}<small>Tap to open exhibit</small>`;
    b.addEventListener('click', () => {
      b.classList.add('revealed');
      b.querySelector('small').textContent = desc;
    });
    box.appendChild(b);
  });
};

/* --------------------------------- quizzes -------------------------------- */
const E1 = [
  { q: 'When did Parul first start texting me?',
    o: ['10 December 2022','21 December 2022','25 December 2022','1 January 2023'], c: [1],
    good: 'Correct. 21 December 2022. I remember, obviously. ❤️', bad: 'It was 21 December 2022. Noted forever. 😌' },
  { q: 'When we first met in school, I was in which class?',
    o: ['8th','9th','10th','11th'], c: [1], good: '9th. Junior, but fearless. 😎', bad: 'I was in 9th, Madam Ji. 😂' },
  { q: 'And Madam Ji was in which class?',
    o: ['9th','10th','11th','12th'], c: [1], good: '10th. Senior. Obviously bossy. 😂', bad: 'You were in 10th. Senior privileges used fully. 😂' },
  { q: 'What is my favorite memory with you? ❤️',
    o: ['Our first conversation','Our first handshake','Our first fight 😂','Our first proposal'], c: [0,1,3],
    good: 'Correct — and honestly, more than one of these is right. ❤️', bad: 'Almost. Everything except the fight counts. 😂' },
  { q: 'Where did one of our most legendary moments happen? 👀',
    o: ['Classroom','Playground','Staircase','Canteen'], c: [2], good: 'Staircase. History was made. 🪜', bad: 'Staircase, Madam Ji. You know it. 👀' },
  { q: 'Which nickname describes your anger best? 😂',
    o: ['Chand','Paroo','Gusse Ki Dukaan','Doolu'], c: [2], good: 'Dukaan hamesha khuli. 😂', bad: 'Gusse Ki Dukaan. No arguments. 😂' },
  { q: 'What is the one thing we definitely DON\'T have? 😂',
    o: ['Memories','Fights','Photos of us together','Inside jokes'], c: [2], good: 'Exactly. Zero photos. Painful. 😂', bad: 'Photos of us together. Still zero. 😭😂' }
];
const E2 = [
  { q: 'What do I call you most often?', o: ['Parul','Madam Ji','Baby','Bhai 😂'], c: [3],
    good: 'Yes. Romance level: legendary. 😂', bad: 'It\'s "Bhai". Sorry. 😂' },
  { q: 'Which of these nicknames have I given you?', o: ['Mirchi','Madam Ji','Gusse Ki Dukaan','All of these'], c: [3],
    good: 'All of them. I built a whole museum. 📚', bad: 'All of these. Full collection. 😂' },
  { q: 'What do I value more?', o: ['Winning every argument','Being right','Our relationship','My phone 😂'], c: [3],
    good: 'Correct answer, wrong life choice. 😂', bad: 'Honest answer: my phone. 😂 (You are a close second. Very close.)' },
  { q: 'Which memory is especially important to me? ❤️', o: ['First handshake','First selfie','First date','First video call'], c: [0],
    good: 'First handshake. Always. ❤️', bad: 'First handshake, Madam Ji. Pay attention. ❤️' },
  { q: 'What is more likely when Madam Ji gets angry? 🌶️',
    o: ['Peace treaty','Gusse Ki Dukaan opens','Everyone gets free chocolates','Nothing happens'], c: [1],
    good: 'Shutters up, business booming. 😂', bad: 'The dukaan opens. Every time. 😂' }
];

function runQuiz(mountId, data, { doneTitle, resultFn, onDone }) {
  const mount = $(mountId);
  let i = 0, score = 0;

  function render() {
    if (i >= data.length) return finish();
    const item = data[i];
    mount.innerHTML = `
      <p class="qprog">QUESTION ${i + 1} / ${data.length}</p>
      <h3 class="qtext"></h3>
      <div class="opts"></div>
      <p class="qfeed" role="status"></p>`;
    mount.querySelector('.qtext').textContent = item.q;
    const opts = mount.querySelector('.opts');
    item.o.forEach((text, idx) => {
      const b = document.createElement('button');
      b.className = 'opt'; b.textContent = String.fromCharCode(65 + idx) + '. ' + text;
      b.addEventListener('click', () => choose(idx, opts, item));
      opts.appendChild(b);
    });
  }
  function choose(idx, opts, item) {
    const btns = $$('.opt', opts);
    btns.forEach(b => (b.disabled = true));
    const ok = item.c.includes(idx);
    if (ok) score++;
    item.c.forEach(ci => btns[ci].classList.add('right'));
    if (!ok) btns[idx].classList.add('wrong');
    mount.querySelector('.qfeed').textContent = ok ? item.good : item.bad;
    setTimeout(() => { i++; render(); }, T(1900));
  }
  function finish() {
    mount.innerHTML = `<h3 class="qtext">${doneTitle}</h3>
      <p class="lead">${resultFn(score, data.length)}</p>
      <button class="btn" type="button">Continue →</button>`;
    mount.querySelector('button').addEventListener('click', onDone);
  }
  render();
}

chapterInit['s-e1'] = () => runQuiz('#quizE1', E1, {
  doneTitle: 'MEMORY SCAN COMPLETE',
  resultFn: (s, t) => s >= 6 ? `${s}/${t} — You remember everything. Slightly scary, very cute. ❤️`
    : s >= 4 ? `${s}/${t} — You remember the important parts. The rest, I'll remind you. 😌`
    : `${s}/${t} — Madam Ji... we clearly need a long phone call. 😂❤️`,
  onDone: next
});
chapterInit['s-e2'] = () => runQuiz('#quizE2', E2, {
  doneTitle: 'KNOWLEDGE SCAN COMPLETE',
  resultFn: (s, t) => s >= 4 ? `${s}/${t} — Certified expert on me. Frightening. 😂`
    : s >= 2 ? `${s}/${t} — Decent. You know the version of me you like. 😌`
    : `${s}/${t} — Honestly? Same. I also don't understand me. 😂`,
  onDone: next
});

/* ------------------------------ 14 scratch card --------------------------- */
let scratchDone = false;
function initScratch() {
  const cv = $('#scratch'), c = cv.getContext('2d');
  const rect = () => cv.getBoundingClientRect();
  cv.width = 600; cv.height = 300;
  const g = c.createLinearGradient(0, 0, 600, 300);
  g.addColorStop(0, '#6b6b78'); g.addColorStop(1, '#2f2f3a');
  c.fillStyle = g; c.fillRect(0, 0, 600, 300);
  c.fillStyle = 'rgba(255,255,255,.75)'; c.font = 'bold 30px monospace'; c.textAlign = 'center';
  c.fillText('SCRATCH HERE 👀', 300, 158);
  c.globalCompositeOperation = 'destination-out';

  let down = false;
  const at = e => {
    const r = rect();
    return [((e.clientX - r.left) / r.width) * 600, ((e.clientY - r.top) / r.height) * 300];
  };
  const scratch = e => {
    const [x, y] = at(e);
    c.beginPath(); c.arc(x, y, 34, 0, 6.28); c.fill();
  };
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); scratch(e); });
  cv.addEventListener('pointermove', e => { if (down) scratch(e); });
  cv.addEventListener('pointerup', () => { down = false; checkScratch(c); });
  cv.addEventListener('pointerleave', () => { down = false; });
}
function checkScratch(c) {
  if (scratchDone) return;
  const d = c.getImageData(0, 0, 600, 300).data;
  let clear = 0;
  for (let i = 3; i < d.length; i += 40) if (d[i] < 40) clear++;
  if (clear / (d.length / 40) > 0.45) revealSecret();
}
function revealSecret() {
  if (scratchDone) return;
  scratchDone = true;
  $('#scratch').style.transition = 'opacity .6s'; $('#scratch').style.opacity = '0';
  setTimeout(openVideo, T(700));
}
$('#scratchSkip').addEventListener('click', revealSecret);
chapterInit['s-scratch'] = initScratch;

function openVideo() {
  const modal = $('#videoModal'), v = $('#secretVideo');
  modal.hidden = false;
  v.load();
  v.play().catch(() => {});
  v.addEventListener('error', () => {
    $('#vmNote').textContent = 'The secret video isn\'t added yet — placeholder for now. 😂';
    $('#vmNext').hidden = false;
  }, { once: true });
  v.addEventListener('ended', () => { $('#vmNext').hidden = false; }, { once: true });
  setTimeout(() => ($('#vmNext').hidden = false), T(6000));
}
function closeVideo() {
  $('#secretVideo').pause();
  $('#videoModal').hidden = true;
}
$('#vmClose').addEventListener('click', () => { closeVideo(); next(); });
$('#vmNext').addEventListener('click', () => { closeVideo(); next(); });

/* --------------------------- 16 balloon pop game -------------------------- */
const ADVICE = [
  ['🌶️','Mirchi','Thoda gussa kam kiya karo.\nHar baat mein mirchi zaroori nahi hoti. 😂','#ff8a7a'],
  ['👩‍💼','Madam Ji','Madam ka order important hai...\nbut kabhi meri bhi sun liya karo. 😌','#ffc4a3'],
  ['😎','Shawtty','Shawtty ho toh thoda responsible bhi ban jao. 😂','#a3d8ff'],
  ['🧸','Doolu','Cute rehna compulsory hai. ❤️','#ffb3cc'],
  ['🌸','Paroo','Apni smile ko zyada serious mat lena.\nSomeone is addicted to it. 😌','#ffd6e7'],
  ['🌙','Chand','Chand ho toh thoda shine bhi karte rehna. ✨','#cfc4ff'],
  ['😤','Gusse Ki Dukaan','Aaj dukaan band.\nNo arguments accepted. 😂','#ff9aa6'],
  ['📞','Madam Ji','Call kaatne se pehle ek baar soch liya karo. 😂','#b9ffcf'],
  ['🍫','Mirchi','Gussa aaye toh chocolate khao.\nMujhe bhi bhej dena. 😂','#e6c9a8'],
  ['📸','Paroo','Ek photo mere saath bhi click kar lo.\nHistoric moment hoga. 📸❤️','#ffe6a3'],
  ['😴','Doolu','Raat ko time pe so jaya karo.\nSubah ka gussa alag level ka hota hai. 😂','#c9e4ff'],
  ['❤️','Chand','Jo bhi ho jaaye...\nyaad rakhna ki tum kisi ke liye bahut important ho. ❤️','#ff9fb8']
];
chapterInit['s-balloons'] = () => {
  const box = $('#balloons'); box.innerHTML = '';
  const set = ADVICE.slice(0, 10);
  let popped = 0;
  set.forEach(([emoji, nick, text, color], i) => {
    const b = document.createElement('button');
    b.className = 'balloon';
    b.setAttribute('aria-label', `Pop balloon: advice from ${nick}`);
    b.style.animationDelay = (i * .22) + 's';
    b.innerHTML = `<span class="body" style="background:radial-gradient(circle at 32% 28%, #ffffffaa, ${color})">${emoji}</span><span class="string"></span>`;
    b.addEventListener('click', () => {
      if (b.classList.contains('popped')) return;
      b.classList.add('popped');
      popped++; $('#popCount').textContent = popped;
      showPopup(`${emoji} ${nick}`, text, popped === set.length ? finishBalloons : null);
    });
    box.appendChild(b);
  });
  async function finishBalloons() {
    await cineLines($('#balCine'), ['Advice successfully delivered. 😂❤️'], { gap: 400 });
    $('#s-balloons .next').hidden = false;
  }
};

/* generic popup helper */
let popupAfter = null;
function showPopup(title, body, after) {
  $('#popTitle').textContent = title;
  $('#popBody').textContent = body;
  $('#popup').hidden = false;
  popupAfter = after || null;
}
$('#popBtn').addEventListener('click', () => {
  $('#popup').hidden = true;
  const fn = popupAfter; popupAfter = null;
  if (fn) fn();
});

/* --------------------------- 17 why do I choose you ----------------------- */
$('#mirrorBtn').addEventListener('click', async e => {
  e.currentTarget.hidden = true;
  $('#mirror').hidden = false;
  // try to open the front camera so she literally sees herself in the mirror
  const cam = $('#mirrorCam');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }, audio: false
    });
    cam.srcObject = stream;
    await cam.play().catch(() => {});
    cam.classList.add('on');
    window.addEventListener('beforeunload', () => stream.getTracks().forEach(t => t.stop()));
  } catch (err) {
    cam.remove();
  }
  await cineLines($('#mirrorCine'), [
    'That\'s my personal reason. 😌',
    'Agar jyada hi jaan\'ne ka mann hai...',
    'Khud ko sheeshe mein dekh. ❤️'
  ], { gap: 2100 });
  $('#s-mirror .next').hidden = false;
});

/* ------------------------------ 18 final letter --------------------------- */
const LETTER = [
  'Madam Ji,',
  'I am not great at saying serious things out loud, so I built an entire website instead. That should tell you something.',
  'You are genuinely one of the loveliest people in my life. I used to think maturity comes with age. It doesn\'t. It came the day a certain girl from 10th grade started texting a boy from 9th on 21 December 2022, and slowly made him a better version of himself.',
  'Also, thank you for choosing me. Bold decision. Questionable judgement. Still grateful. 😂',
  'We\'ve fought. A lot. And I know I\'m the reason for many of those nights. I said things I shouldn\'t have, and I made you feel things you didn\'t deserve to feel. I\'m sorry for that — not the quick "sorry" I send on chat, the real one.',
  'What I keep thinking about is this: every single time, you came back and talked to me like nothing happened. No score-keeping, no cold months. Do you know how rare that is? I don\'t take it lightly. That is the thing I respect most about you.',
  'So whatever happened, happened. We survived it, and things became normal again — the good kind of normal, where the Gusse Ki Dukaan opens and closes on the same day. 😂',
  'Happy birthday, Parul. Stay exactly like this — the anger, the smile, all of it. I\'m not going anywhere.',
  { sig: true, t: '— Yours (mostly), the guy you call Bhai 😂❤️' }
];
chapterInit['s-letter'] = () => {
  const box = $('#letter'); box.innerHTML = '';
  LETTER.forEach((l, i) => {
    const p = document.createElement('p');
    if (typeof l === 'object') { p.textContent = l.t; p.className = 'sig'; }
    else p.textContent = l;
    p.style.animationDelay = (i * .45) + 's';
    box.appendChild(p);
  });
};

/* ---------------------------- 19 pencil question -------------------------- */
chapterInit['s-pencil'] = async () => {
  await cineLines($('#pencilCine'), ['One last question...', 'Bolo... Pencil. ✏️'], { gap: 1700 });
  $('#pencilActions').hidden = false;
};
function pencilSuccess() {
  $('#pencilActions').hidden = true;
  showPopup('AAPKA GUSSA CANCEL 😂❤️', 'Effective immediately.', next);
  burstConfetti(60);
}
$('#saidBtn').addEventListener('click', pencilSuccess);
$('#micBtn').addEventListener('click', () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = $('#micStatus');
  if (!SR) { status.textContent = 'Mic not supported here — just tap "I SAID PENCIL". 😂'; return; }
  try {
    const rec = new SR();
    rec.lang = 'en-IN'; rec.interimResults = false; rec.maxAlternatives = 3;
    status.textContent = 'Listening... say it, Madam Ji 👂';
    rec.onresult = e => {
      const said = [...e.results[0]].map(r => r.transcript.toLowerCase()).join(' ');
      if (said.includes('pencil') || said.includes('pancil') || said.includes('pensil')) pencilSuccess();
      else status.textContent = `I heard "${said}". That's not pencil. 😂 Try again or tap the button.`;
    };
    rec.onerror = () => { status.textContent = 'Mic didn\'t work — use the button below. ❤️'; };
    rec.start();
  } catch { status.textContent = 'Mic unavailable — use the button below. ❤️'; }
});

/* ---------------------------- 20 do you love me --------------------------- */
const NO_MSGS = ['Are you sure? 👀','Think again, Madam Ji. 😂','This answer will be recorded in the system. 👀','Last chance. ❤️'];
let noCount = 0;
chapterInit['s-love'] = async () => {
  await cineLines($('#loveCine'), ['Before you go...', 'I need one answer.'], { gap: 1600 });
  $('#loveActions').hidden = false;
};
$('#noBtn').addEventListener('click', () => {
  const msg = $('#loveMsg');
  msg.textContent = NO_MSGS[Math.min(noCount, NO_MSGS.length - 1)];
  noCount++;
  const no = $('#noBtn');
  no.textContent = ['❌ NO','YES, I\'M SURE','WAIT...','❌ NO (final?)','😐 NO'][noCount % 5];
  // playful shrink — never actually blocked
  no.style.transform = `scale(${Math.max(.6, 1 - noCount * .08)})`;
  $('#yesBtn').style.transform = `scale(${Math.min(1.5, 1 + noCount * .1)})`;
});
$('#yesBtn').addEventListener('click', () => { enableMusic(); goTo('s-final'); });

/* --------------------------- 21 final hack reveal ------------------------- */
chapterInit['s-final'] = async () => {
  const pre = $('#finalLog');
  document.body.classList.remove('mode-rom');
  $('#s-final').classList.add('glitch');
  setTimeout(() => $('#s-final').classList.remove('glitch'), T(900));
  await typeLines(pre, [
    '> Reconnecting to extraction server...',
    '> Connection established.',
    '',
    '> Analyzing collected data...',
    '> Scanning memories...',
    '> Scanning conversations...',
    '> Scanning emotions...',
    '> Scanning responses...',
    '',
    { t: '> HEART ANALYSIS: 100%', cls: 'ok' },
    { t: '> FINAL REPORT GENERATED', cls: 'ok' }
  ], { pause: 420 });
  await wait(T(1200));
  pre.style.transition = 'opacity .8s'; pre.style.opacity = '0';
  await wait(T(1000));
  const fin = $('#finaleText');
  await cineLines(fin, [
    'I HAVE EXTRACTED ALL THE DATA FROM YOUR HEART.',
    '❤️ RESULT FOUND',
    'YOU ARE IN LOVE WITH ME. ❤️'
  ], { gap: 2300 });
  burstConfetti(220);
  await wait(T(1800));
  goTo('s-bday');
};

/* ------------------------------ 22 birthday ------------------------------- */
chapterInit['s-bday'] = () => {
  enableMusic();
  burstConfetti(240);
  setInterval(() => burstConfetti(40), 4000);
  const show = $('#slideshow');
  GALLERY.slice(0, 6).forEach((ph, i) => {
    const img = document.createElement('img');
    img.alt = '';
    img.style.animationDelay = (i * 4) + 's';
    safeImg(img, ph.src, '');
    show.appendChild(img);
  });
};
$('#replay').addEventListener('click', () => location.reload());

/* ---------------------------------- boot ---------------------------------- */
runIntroHack();
