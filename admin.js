const STORAGE_KEY = 'acacias-bookings';
const adminDate = document.getElementById('adminDate');
const adminSchedule = document.getElementById('adminSchedule');

let bookings = load();
const STEP = 30;
const START_DAY = 8 * 60;
const END_DAY = 22 * 60;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

function isAvailable(date, time, duration, sport, ignore) {
  const start = timeToMinutes(time);
  const end = start + duration;
  return bookings.every((b, i) => {
    if (i === ignore || b.date !== date || b.sport !== sport) return true;
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + parseInt(b.duration);
    return end <= bStart || start >= bEnd;
  });
}

function render() {
  const date = adminDate.value;
  adminSchedule.innerHTML = '';
  if (!date) return;
  for (let minutes = START_DAY; minutes <= END_DAY - 30; minutes += STEP) {
    const time = minutesToTime(minutes);
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.time = time;
    slot.textContent = time;
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      const index = e.dataTransfer.getData('index');
      const booking = bookings[index];
      const duration = parseInt(booking.duration, 10);
      if (isAvailable(date, time, duration, booking.sport, index) && minutes <= END_DAY - duration) {
        booking.date = date;
        booking.time = time;
        save();
        render();
      }
    });
    adminSchedule.appendChild(slot);
  }
  bookings.forEach((b, i) => {
    if (b.date !== date) return;
    const slot = adminSchedule.querySelector(`.slot[data-time='${b.time}']`);
    if (!slot) return;
    slot.classList.add('booked');
    const div = document.createElement('div');
    div.className = 'booking';
    div.draggable = true;
    div.textContent = `${b.sport} • ${b.name} (${b.duration}m)`;
    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('index', i);
    });
    slot.appendChild(div);
  });
}

adminDate.value = new Date().toISOString().split('T')[0];
adminDate.addEventListener('change', render);
render();
