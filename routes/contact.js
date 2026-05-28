const express = require("express");
const { query } = require("../utils/db");
const { isEmail } = require("../utils/validators");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  const errors = [];
  if (!name || !email || !subject || !message) errors.push("Preencha todos os campos.");
  if (email && !isEmail(email)) errors.push("Email invalido.");
  if (message && message.length < 10) errors.push("Mensagem muito curta.");
  if (errors.length) return res.status(400).json({ errors });

  await query(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim()]
  );
  res.status(201).json({ message: "Mensagem enviada com sucesso." });
});

module.exports = router;
