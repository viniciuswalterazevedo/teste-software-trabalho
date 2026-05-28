const express = require("express");
const { query } = require("../utils/db");
const { createSession, currentUser } = require("../utils/auth");
const { validateUser, isEmail } = require("../utils/validators");

const router = express.Router();

router.post("/register", async (req, res) => {
  const payload = req.body;
  const errors = validateUser(payload);
  if (errors.length) return res.status(400).json({ errors });

  try {
    await query(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [payload.name.trim(), payload.email.trim().toLowerCase(), payload.password, payload.phone.trim()]
    );
    const users = await query("SELECT id, name, email, phone FROM users WHERE email = ?", [payload.email.trim().toLowerCase()]);
    const token = await createSession(users[0].id);
    res.cookie("hotel_session", token, { httpOnly: true, sameSite: "lax" });
    res.status(201).json({ user: users[0] });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ errors: ["Email ja cadastrado."] });
    throw error;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ errors: ["Informe email e senha."] });
  if (!isEmail(email)) return res.status(400).json({ errors: ["Email invalido."] });

  const users = await query(
    "SELECT id, name, email, phone FROM users WHERE email = ? AND password = ?",
    [email.trim().toLowerCase(), password]
  );
  if (!users.length) return res.status(401).json({ errors: ["Email ou senha incorretos."] });

  const token = await createSession(users[0].id);
  res.cookie("hotel_session", token, { httpOnly: true, sameSite: "lax" });
  res.json({ user: users[0] });
});

router.get("/me", async (req, res) => {
  const user = await currentUser(req);
  res.json({ user });
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.hotel_session;
  if (token) await query("DELETE FROM sessions WHERE token = ?", [token]);
  res.clearCookie("hotel_session");
  res.json({ message: "Logout realizado." });
});

module.exports = router;
