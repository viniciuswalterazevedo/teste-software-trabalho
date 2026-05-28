const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const { initDatabase } = require("./utils/db");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const reservationRoutes = require("./routes/reservations");
const contactRoutes = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: process.env.DB_NAME || "hotel_aurora" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/contact", contactRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Hotel Aurora rodando em http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Erro ao iniciar o servidor:", error.message);
    process.exit(1);
  });
}

module.exports = app;
