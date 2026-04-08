const path = require("path");

require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }
  console.log("MySQL Connected");

  // Initialize DB Tables
  const fs = require("fs");
  const schemaPath = path.join(__dirname, "../schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.query(schema, (err) => {
      if (err) {
        console.error("Database initialization failed:", err.message);
      } else {
        console.log("Database initialized successfully");
      }
    });
  }
});

module.exports = db;
