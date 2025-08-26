const STORAGE_KEY = 'acacias-bookings';
const form = document.getElementById('bookingForm');
const list = document.getElementById('list');
const scheduleEl = document.getElementById('schedule');
const selectedSlotDisplay = document.getElementById('selectedSlot');
const filterSport = document.getElementById('filterSport');
const submitBtn = document.getElementById('submitBtn');
const cancelEdit = document.getElementById('cancelEdit');

let bookings = load();
let editingIndex = -1;
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
  const filter = filterSport.value;
  bookings.forEach((b, i) => {
    if (filter !== 'all' && b.sport !== filter) return;
    const li = document.createElement('li');
    const info = document.createElement('span');
    info.textContent = `${b.date} ${b.time} - ${b.sport} (${b.duration} min) • ${b.name}`;
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '.5rem';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Modifier';
    editBtn.className = 'secondary edit';
    editBtn.onclick = () => {
      editingIndex = i;
      form.sport.value = b.sport;
      form.date.value = b.date;
      form.duration.value = b.duration;
      form.name.value = b.name;
      form.time.value = b.time;
      selectedSlotDisplay.textContent = `Créneau sélectionné: ${b.time}`;
      submitBtn.textContent = 'Mettre à jour';
      cancelEdit.hidden = false;
      renderSchedule();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Supprimer';
    delBtn.className = 'delete';
    delBtn.onclick = () => {
      bookings.splice(i, 1);
      save();
      renderAll();
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(info);
    li.appendChild(actions);
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
    slot.dataset.time = time;
    slot.textContent = time;
    if (!isAvailable(date, time, duration, sport, editingIndex)) {
      slot.disabled = true;
      slot.classList.add('booked');
      slot.textContent = `${time}\nindisponible`;
    } else {
      slot.addEventListener('click', () => {
        if (form.time.value === time) {
          form.time.value = '';
          slot.classList.remove('selected');
          selectedSlotDisplay.textContent = '';
        } else {
          form.time.value = time;
          document.querySelectorAll('#schedule .slot').forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
          selectedSlotDisplay.textContent = `Créneau sélectionné: ${time}`;
        }
      });
    }
    scheduleEl.appendChild(slot);
  }
  if (form.time.value) {
    const selected = scheduleEl.querySelector(`.slot[data-time='${form.time.value}']`);
    if (selected) selected.classList.add('selected');
  }
}

function renderAll() {
  bookings.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
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
  if (!isAvailable(booking.date, booking.time, parseInt(booking.duration, 10), booking.sport, editingIndex)) {
    alert('Créneau indisponible');
    return;
  }
  if (editingIndex >= 0) {
    bookings[editingIndex] = booking;
  } else {
    bookings.push(booking);
  }
  save();
  form.reset();
  form.time.value = '';
  selectedSlotDisplay.textContent = '';
  editingIndex = -1;
  submitBtn.textContent = 'Ajouter';
  cancelEdit.hidden = true;
  renderAll();
});

cancelEdit.addEventListener('click', () => {
  editingIndex = -1;
  form.reset();
  form.time.value = '';
  selectedSlotDisplay.textContent = '';
  submitBtn.textContent = 'Ajouter';
  cancelEdit.hidden = true;
  renderSchedule();
});

filterSport.addEventListener('change', renderList);

['date', 'duration', 'sport'].forEach(id => {
  form[id].addEventListener('change', renderSchedule);
});

form.date.value = new Date().toISOString().split('T')[0];
renderAll();
