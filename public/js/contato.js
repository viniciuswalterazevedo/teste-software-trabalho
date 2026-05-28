document.getElementById("contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
      })
    });
    showMessage("msg", result.message, "success");
    event.target.reset();
  } catch (error) {
    showMessage("msg", error.message);
  }
});
