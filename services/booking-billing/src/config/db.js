/*const mysql = require("mysql");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "agritour",
  password: "123456",
  database: "mytour",
  port: 3307
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
  } else {
    console.log("Kết nối MySQL thành công!");
  }
});

module.exports = db;

db.query("SELECT DATABASE() AS db", (err, rows) => {
  console.log("🔥 API đang dùng database:", rows[0].db);
});
*/

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,        // Railway
  user: process.env.DB_USER,        // Railway
  password: process.env.DB_PASSWORD, // Railway
  database: process.env.DB_NAME,     // Railway
  port: process.env.DB_PORT          // Railway
});

db.connect((err) => {
  if (err) {
    console.error(" Lỗi kết nối MySQL:", err);
  } else {
    console.log(" Kết nối MySQL thành công!");
  }
});

module.exports = db;

// Kiểm tra đang dùng DB nào
db.query("SELECT DATABASE() AS db", (err, rows) => {
  if (err) {
    console.error(" Lỗi query DB:", err);
    return;
  }
  console.log(" API đang dùng database:", rows[0].db);
});

