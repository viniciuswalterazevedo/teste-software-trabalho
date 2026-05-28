bindLogout();

function render(reservations) {
  const container = document.getElementById("reservations");
  if (!reservations.length) {
    container.innerHTML = `<article class="card"><h3>Nenhuma reserva</h3><p class="meta">Voce ainda nao possui reservas cadastradas.</p><div class="actions"><a class="btn" href="quartos.html">Reservar agora</a></div></article>`;
    return;
  }
  container.innerHTML = reservations.map((item) => `
    <article class="card">
      <h3>${item.room_name}</h3>
      <p class="meta">Codigo: <strong>${item.code}</strong></p>
      <p>${item.checkin.substring(0, 10)} ate ${item.checkout.substring(0, 10)} | ${item.guests} hospede(s) | ${item.nights} diaria(s)</p>
      <p class="price">${currency(item.total)}</p>
      <span class="status ${item.status}">${item.status === "active" ? "Ativa" : "Cancelada"}</span>
      ${item.status === "active" ? `<div class="actions"><a class="btn btn-danger" href="cancelamento.html?code=${item.code}">Cancelar</a></div>` : ""}
    </article>
  `).join("");
}

requireLogin()
  .then(() => api("/api/reservations"))
  .then(render)
  .catch(() => window.location.href = "login.html");
