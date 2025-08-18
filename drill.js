const canvas = document.getElementById('court');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const summary = document.getElementById('summary');
const stats = document.getElementById('stats');
const progressBar = document.getElementById('progressBar');

const TARGET_RADIUS = 12;
const NUM_TRIALS = 5;

let target = null; // {x, y}
let trial = 0;
let reactionTimes = [];
let startTime = 0;
let timerId = null;
let bestAvg = Number(localStorage.getItem('bestAvg')) || null;

function drawCourt() {
  ctx.fillStyle = '#317a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  // outer lines
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  // center line
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 10);
  ctx.lineTo(canvas.width / 2, canvas.height - 10);
  ctx.stroke();
  // service line
  ctx.beginPath();
  ctx.moveTo(10, canvas.height / 2);
  ctx.lineTo(canvas.width - 10, canvas.height / 2);
  ctx.stroke();
}

function spawnTarget() {
  const x = 20 + Math.random() * (canvas.width - 40);
  const y = 20 + Math.random() * (canvas.height - 40);
  target = { x, y };
  drawCourt();
  ctx.fillStyle = '#ff0';
  ctx.beginPath();
  ctx.arc(x, y, TARGET_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  startTime = performance.now();
}

function clearTarget() {
  target = null;
  drawCourt();
}

canvas.addEventListener('click', (e) => {
  if (!target) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const dx = x - target.x;
  const dy = y - target.y;
  if (Math.sqrt(dx * dx + dy * dy) <= TARGET_RADIUS) {
    const rt = performance.now() - startTime;
    reactionTimes.push(rt);
    trial++;
    updateStats();
    clearTarget();
    nextTrial();
  }
});

function nextTrial() {
  if (trial >= NUM_TRIALS) {
    endSession();
    return;
  }
  const delay = 1000 + Math.random() * 2000;
  timerId = setTimeout(spawnTarget, delay);
}

function startSession() {
  trial = 0;
  reactionTimes = [];
  summary.textContent = '';
  stats.innerHTML = '';
  progressBar.style.width = '0%';
  clearTarget();
  nextTrial();
}

function endSession() {
  clearTimeout(timerId);
  clearTarget();
  if (!reactionTimes.length) return;
  const sum = reactionTimes.reduce((a, b) => a + b, 0);
  const avg = sum / reactionTimes.length;
  const best = Math.min(...reactionTimes);
  const worst = Math.max(...reactionTimes);
  if (bestAvg === null || avg < bestAvg) {
    bestAvg = avg;
    localStorage.setItem('bestAvg', bestAvg);
  }
  summary.innerHTML =
    `Temps moyen: ${avg.toFixed(0)} ms<br>` +
    `Meilleur: ${best.toFixed(0)} ms - Pire: ${worst.toFixed(0)} ms<br>` +
    `Record: ${bestAvg.toFixed(0)} ms`;
}

startBtn.addEventListener('click', startSession);

function updateStats() {
  stats.innerHTML = reactionTimes
    .map((rt, i) => `Essai ${i + 1}: ${rt.toFixed(0)} ms`)
    .join('<br>');
  progressBar.style.width = `${(trial / NUM_TRIALS) * 100}%`;
}

drawCourt();
