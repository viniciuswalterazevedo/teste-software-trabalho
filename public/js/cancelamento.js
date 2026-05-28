bindLogout();

const code = document.getElementById("code");
code.value = new URLSearchParams(window.location.search).get("code") || "";

requireLogin();

document.getElementById("cancelForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api(`/api/reservations/${encodeURIComponent(code.value)}/cancel`, { method: "POST" });
    showMessage("msg", result.message, "success");
  } catch (error) {
    showMessage("msg", error.message);
  }
});
