const mysql = require("mysql2/promise");

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hotel_aurora",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
};

let pool;

async function createServerConnection() {
  return mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true
  });
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(config);
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function initDatabase() {
  const server = await createServerConnection();
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  await resetLegacySchemaIfNeeded();

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(120) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token VARCHAR(80) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      daily_rate DECIMAL(10,2) NOT NULL,
      capacity INT NOT NULL,
      image_url TEXT NOT NULL,
      amenities TEXT NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      room_id INT NOT NULL,
      checkin DATE NOT NULL,
      checkout DATE NOT NULL,
      guests INT NOT NULL,
      nights INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status ENUM('active', 'canceled') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      canceled_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      subject VARCHAR(160) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await seedRooms();
}

async function resetLegacySchemaIfNeeded() {
  const columns = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rooms'`,
    [config.database]
  );

  const hasOldRoomsTable = columns.length > 0 && !columns.some((column) => column.COLUMN_NAME === "slug");
  if (!hasOldRoomsTable) return;

  await query("SET FOREIGN_KEY_CHECKS = 0");
  await query("DROP TABLE IF EXISTS reservations");
  await query("DROP TABLE IF EXISTS sessions");
  await query("DROP TABLE IF EXISTS users");
  await query("DROP TABLE IF EXISTS contact_messages");
  await query("DROP TABLE IF EXISTS rooms");
  await query("SET FOREIGN_KEY_CHECKS = 1");
}

async function seedRooms() {
  const rooms = [
    [
      "standard",
      "Quarto Standard",
      "Confortavel para estadias rapidas, com cama casal, mesa de apoio e Wi-Fi.",
      180,
      2,
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1400",
      "Wi-Fi,Cama casal,Ar-condicionado"
    ],
    [
      "premium",
      "Suite Premium",
      "Espaco amplo com cama king, cafe incluso e vista para a area central.",
      350,
      4,
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1400",
      "Cafe incluso,Cama king,Smart TV"
    ],
    [
      "familia",
      "Quarto Familia",
      "Opcao para familias, com duas camas de casal e area de descanso.",
      480,
      5,
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1400",
      "Duas camas,Mini cozinha,Jantar incluso"
    ]
  ];

  for (const room of rooms) {
    await query(
      `INSERT INTO rooms (slug, name, description, daily_rate, capacity, image_url, amenities, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       description = VALUES(description),
       daily_rate = VALUES(daily_rate),
       capacity = VALUES(capacity),
       image_url = VALUES(image_url),
       amenities = VALUES(amenities),
       active = 1`,
      room
    );
  }
}

module.exports = { initDatabase, query, getPool, config };
