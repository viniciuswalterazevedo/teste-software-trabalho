bindLogout();

const paramsReserva = new URLSearchParams(window.location.search);
const roomSlug = paramsReserva.get("room");
const checkin = paramsReserva.get("checkin");
const checkout = paramsReserva.get("checkout");
const guests = paramsReserva.get("guests");
let room = null;

function nightsBetween(start, end) {
  return Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000);
}

async function loadSummary() {
  await requireLogin();
  room = await api(`/api/rooms/${roomSlug}`);
  const nights = nightsBetween(checkin, checkout);
  document.getElementById("summary").innerHTML = `
    <h3>${room.name}</h3>
    <p class="meta">${checkin} ate ${checkout} | ${guests} hospede(s)</p>
    <p>${room.description}</p>
    <p class="price">${currency(Number(room.daily_rate) * nights)}</p>
    <p class="meta">${nights} diaria(s), ${currency(room.daily_rate)} por diaria</p>`;
}

document.getElementById("reservationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const reservation = await api("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ roomSlug, checkin, checkout, guests })
    });
    window.location.href = `minhas-reservas.html?created=${reservation.code}`;
  } catch (error) {
    showMessage("msg", error.message);
  }
});

loadSummary().catch((error) => showMessage("msg", error.message));
