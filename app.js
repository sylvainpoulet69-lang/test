const form=document.getElementById('bookingForm');
const list=document.getElementById('list');
const STORAGE_KEY='acacias-bookings';
let bookings=load();
form.addEventListener('submit',e=>{
  e.preventDefault();
  const booking={
    sport:form.sport.value,
    date:form.date.value,
    time:form.time.value,
    duration:form.duration.value,
    name:form.name.value
  };
  bookings.push(booking);
  save();
  form.reset();
  render();
});
function render(){
  list.innerHTML='';
  bookings.forEach((b,i)=>{
    const li=document.createElement('li');
    li.textContent=`${b.date} ${b.time} - ${b.sport} (${b.duration} min) • ${b.name}`;
    const btn=document.createElement('button');
    btn.textContent='Supprimer';
    btn.onclick=()=>{bookings.splice(i,1);save();render();};
    li.appendChild(btn);
    list.appendChild(li);
  });
}
function load(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch{ return []; }
}
function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(bookings));
}
render();
