const crypto = require("crypto");
const { query } = require("./db");

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function createSession(userId) {
  const token = newToken();
  await query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
    [token, userId]
  );
  return token;
}

async function currentUser(req) {
  const token = req.cookies.hotel_session;
  if (!token) return null;

  const rows = await query(
    `SELECT users.id, users.name, users.email, users.phone
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > NOW()`,
    [token]
  );
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ errors: ["Faca login para continuar."] });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { createSession, currentUser, requireAuth };
