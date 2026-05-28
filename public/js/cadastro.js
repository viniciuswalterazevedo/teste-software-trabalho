document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value
      })
    });
    window.location.href = "home.html";
  } catch (error) {
    showMessage("msg", error.message);
  }
});
