const express = require("express");
const { query } = require("../utils/db");
const { requireAuth } = require("../utils/auth");
const { nightsBetween, validateReservation } = require("../utils/validators");

const router = express.Router();

function code() {
  return `HTL-${Math.floor(10000 + Math.random() * 90000)}`;
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  const rows = await query(
    `SELECT reservations.*, rooms.name AS room_name, rooms.slug AS room_slug, rooms.image_url
     FROM reservations
     JOIN rooms ON rooms.id = reservations.room_id
     WHERE reservations.user_id = ?
     ORDER BY reservations.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const rooms = await query("SELECT * FROM rooms WHERE slug = ? AND active = 1", [req.body.roomSlug]);
  const room = rooms[0];
  const errors = validateReservation(req.body, room);
  if (errors.length) return res.status(400).json({ errors });

  const nights = nightsBetween(req.body.checkin, req.body.checkout);
  const total = nights * Number(room.daily_rate);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reservationCode = code();
    try {
      await query(
        `INSERT INTO reservations (code, user_id, room_id, checkin, checkout, guests, nights, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [reservationCode, req.user.id, room.id, req.body.checkin, req.body.checkout, Number(req.body.guests), nights, total]
      );
      const rows = await query(
        `SELECT reservations.*, rooms.name AS room_name
         FROM reservations JOIN rooms ON rooms.id = reservations.room_id
         WHERE reservations.code = ?`,
        [reservationCode]
      );
      return res.status(201).json(rows[0]);
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
    }
  }

  res.status(500).json({ errors: ["Nao foi possivel gerar codigo da reserva."] });
});

router.post("/:code/cancel", async (req, res) => {
  const rows = await query("SELECT * FROM reservations WHERE code = ? AND user_id = ?", [req.params.code, req.user.id]);
  if (!rows.length) return res.status(404).json({ errors: ["Reserva nao encontrada."] });
  if (rows[0].status === "canceled") return res.json({ message: "Reserva ja estava cancelada." });

  await query(
    "UPDATE reservations SET status = 'canceled', canceled_at = NOW() WHERE code = ? AND user_id = ?",
    [req.params.code, req.user.id]
  );
  res.json({ message: "Reserva cancelada com sucesso." });
});

module.exports = router;
