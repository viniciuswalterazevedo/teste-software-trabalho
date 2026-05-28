function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function nightsBetween(checkin, checkout) {
  const start = new Date(`${checkin}T00:00:00`);
  const end = new Date(`${checkout}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end - start) / 86400000);
}

function validateSearch({ checkin, checkout, guests }) {
  const errors = [];
  if (!checkin || !checkout || !guests) errors.push("Preencha datas e quantidade de hospedes.");
  if (checkin && checkout && nightsBetween(checkin, checkout) <= 0) errors.push("Check-out deve ser posterior ao check-in.");
  if (guests && Number(guests) <= 0) errors.push("Quantidade de hospedes invalida.");
  return errors;
}

function validateUser({ name, email, password, phone }) {
  const errors = [];
  if (!name || !email || !password || !phone) errors.push("Preencha todos os campos.");
  if (email && !isEmail(email)) errors.push("Email invalido.");
  if (password && String(password).length < 4) errors.push("Senha deve ter pelo menos 4 caracteres.");
  if (phone && String(phone).replace(/\D/g, "").length < 8) errors.push("Telefone invalido.");
  return errors;
}

function validateReservation({ checkin, checkout, guests }, room) {
  const errors = validateSearch({ checkin, checkout, guests });
  if (!room) errors.push("Quarto nao encontrado.");
  if (room && Number(guests) > Number(room.capacity)) errors.push("Quantidade de hospedes excede a capacidade do quarto.");
  return errors;
}

module.exports = { isEmail, nightsBetween, validateSearch, validateUser, validateReservation };
