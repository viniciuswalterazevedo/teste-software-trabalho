async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data.errors || ["Erro inesperado."]).join(" "));
  }
  return data;
}

function showMessage(id, message, type = "error") {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = "block";
}

function currency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function requireLogin() {
  const { user } = await api("/api/auth/me");
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" });
  window.location.href = "index.html";
}

function bindLogout() {
  const button = document.getElementById("logoutBtn");
  if (button) button.addEventListener("click", logout);
}
