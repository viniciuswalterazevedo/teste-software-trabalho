bindLogout();

requireLogin().then((user) => {
  if (user) document.getElementById("welcome").textContent = `Ola, ${user.name}`;
});
