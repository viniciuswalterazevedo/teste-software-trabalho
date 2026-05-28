bindLogout();

const params = new URLSearchParams(window.location.search);
const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");
const guests = document.getElementById("guests");

checkin.value = params.get("checkin") || "";
checkout.value = params.get("checkout") || "";
guests.value = params.get("guests") || "";

function renderRooms(rooms) {
  const container = document.getElementById("rooms");
  if (!rooms.length) {
    container.innerHTML = `<article class="card"><h3>Nenhum quarto encontrado</h3><p class="meta">Altere a quantidade de hospedes ou datas.</p></article>`;
    return;
  }

  container.innerHTML = rooms.map((room) => {
    const reserveUrl = `reserva.html?room=${room.slug}&checkin=${checkin.value}&checkout=${checkout.value}&guests=${guests.value}`;
    const canReserve = checkin.value && checkout.value && guests.value && room.availableForGuests !== false;
    return `
      <article class="card room-card">
        <img src="${room.image_url}" alt="${room.name}">
        <div class="room-body">
          <h3>${room.name}</h3>
          <p>${room.description}</p>
          <p class="meta">Ate ${room.capacity} hospedes | ${room.amenities.join(" | ")}</p>
          <div class="price">${currency(room.daily_rate)} / diaria</div>
          ${canReserve ? `<a class="btn" href="${reserveUrl}">Reservar</a>` : `<button class="btn btn-outline" disabled>Informe datas</button>`}
        </div>
      </article>`;
  }).join("");
}

async function loadRooms(filtered = false) {
  try {
    const url = filtered
      ? `/api/rooms/search?checkin=${checkin.value}&checkout=${checkout.value}&guests=${guests.value}`
      : `/api/rooms?guests=${guests.value || ""}`;
    renderRooms(await api(url));
  } catch (error) {
    showMessage("msg", error.message);
  }
}

document.getElementById("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const next = new URLSearchParams({ checkin: checkin.value, checkout: checkout.value, guests: guests.value });
  history.replaceState(null, "", `quartos.html?${next.toString()}`);
  loadRooms(true);
});

loadRooms(Boolean(checkin.value && checkout.value && guests.value));
