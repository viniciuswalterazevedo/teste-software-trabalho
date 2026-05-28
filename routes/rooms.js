const express = require("express");
const { query } = require("../utils/db");
const { validateSearch } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const guests = Number(req.query.guests || 0);
  const rooms = await query("SELECT * FROM rooms WHERE active = 1 ORDER BY daily_rate");
  res.json(
    rooms.map((room) => ({
      ...room,
      amenities: room.amenities.split(","),
      availableForGuests: guests ? guests <= room.capacity : true
    }))
  );
});

router.get("/search", async (req, res) => {
  const errors = validateSearch(req.query);
  if (errors.length) return res.status(400).json({ errors });

  const guests = Number(req.query.guests);
  const rooms = await query("SELECT * FROM rooms WHERE active = 1 AND capacity >= ? ORDER BY daily_rate", [guests]);
  res.json(rooms.map((room) => ({ ...room, amenities: room.amenities.split(",") })));
});

router.get("/:slug", async (req, res) => {
  const rooms = await query("SELECT * FROM rooms WHERE slug = ? AND active = 1", [req.params.slug]);
  if (!rooms.length) return res.status(404).json({ errors: ["Quarto nao encontrado."] });
  res.json({ ...rooms[0], amenities: rooms[0].amenities.split(",") });
});

module.exports = router;
