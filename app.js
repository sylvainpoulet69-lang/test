const STORAGE_KEY = 'acacias-bookings';
const form = document.getElementById('bookingForm');
const list = document.getElementById('list');
const scheduleEl = document.getElementById('schedule');

let bookings = load();
const STEP = 30; // minutes
const START_DAY = 8 * 60; // 08:00
const END_DAY = 22 * 60; // 22:00

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

function isAvailable(date, time, duration, sport, ignore = -1) {
  const start = timeToMinutes(time);
  const end = start + duration;
  return bookings.every((b, i) => {
    if (i === ignore || b.date !== date || b.sport !== sport) return true;
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + parseInt(b.duration);
    return end <= bStart || start >= bEnd;
  });
}

function renderList() {
  list.innerHTML = '';
  bookings.forEach((b, i) => {
    const li = document.createElement('li');
    li.textContent = `${b.date} ${b.time} - ${b.sport} (${b.duration} min) • ${b.name}`;
    const btn = document.createElement('button');
    btn.textContent = 'Supprimer';
    btn.onclick = () => {
      bookings.splice(i, 1);
      save();
      renderAll();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderSchedule() {
  const date = form.date.value;
  const sport = form.sport.value;
  const duration = parseInt(form.duration.value, 10);
  scheduleEl.innerHTML = '';
  if (!date) return;
  for (let minutes = START_DAY; minutes <= END_DAY - duration; minutes += STEP) {
    const time = minutesToTime(minutes);
    const slot = document.createElement('button');
    slot.className = 'slot';
    slot.textContent = time;
    if (!isAvailable(date, time, duration, sport)) {
      slot.disabled = true;
      slot.classList.add('booked');
      slot.textContent = `${time}\nindisponible`;
    } else {
      slot.addEventListener('click', () => {
        form.time.value = time;
        document.querySelectorAll('#schedule .slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
      });
    }
    scheduleEl.appendChild(slot);
  }
}

function renderAll() {
  renderList();
  renderSchedule();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const booking = {
    sport: form.sport.value,
    date: form.date.value,
    time: form.time.value,
    duration: form.duration.value,
    name: form.name.value
  };
  if (!booking.time) {
    alert('Choisissez un créneau.');
    return;
  }
  if (!isAvailable(booking.date, booking.time, parseInt(booking.duration, 10), booking.sport)) {
    alert('Créneau indisponible');
    return;
  }
  bookings.push(booking);
  save();
  form.reset();
  renderAll();
});

['date', 'duration', 'sport'].forEach(id => {
  form[id].addEventListener('change', renderSchedule);
});

form.date.value = new Date().toISOString().split('T')[0];
renderAll();
