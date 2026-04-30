const express = require("express");
const router = express.Router();
const db = require("../config/database");

/* AUTO CREATE CLIENT IF CONVERTED */
const syncClient = (data) => {
  const { customer_name, mobile_number, location_city, purpose, email, field_outcome } = data;

  if (field_outcome === "Converted") {
    db.query(
      "SELECT * FROM clients WHERE phone = ?",
      [mobile_number],
      (err, result) => {
        if (err) return;
        if (result.length === 0) {
          db.query(
            "INSERT INTO clients (name, phone, address, service, email) VALUES (?, ?, ?, ?, ?)",
            [customer_name, mobile_number, location_city, purpose, email]
          );
        } else {
          db.query(
            "UPDATE clients SET name=?, address=?, service=?, email=? WHERE phone=?",
            [customer_name, location_city, purpose, email, mobile_number]
          );
        }
      }
    );
  } else {
    // If not converted, ensure it's removed from clients if it exists
    db.query("DELETE FROM clients WHERE phone = ?", [mobile_number]);
  }
};

/* CREATE FIELD */
router.post("/new", (req, res) => {
  const data = req.body;

  if (!data.customer_name || !data.visit_date) {
    return res.status(400).json({ message: "Customer name & visit date required" });
  }

  db.query("INSERT INTO fields SET ?", data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Insert failed" });
    }

    // 🔥 THIS IS THE IMPORTANT LINE
    syncClient(data);

    res.json({ message: "Field added", id: result.insertId });
  });
});

/* UPDATE FIELD */
router.put("/:id", (req, res) => {
  const data = req.body;

  db.query(
    `UPDATE fields SET ? WHERE id=?`,
    [data, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Field not found" });
      }

      // 🔥 ALSO HANDLE UPDATE CASE
      syncClient(data);

      res.json({ message: "Field updated successfully" });
    }
  );
});

/* GET ALL */
router.get("/", (req, res) => {
  db.query("SELECT * FROM fields ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Fetch failed" });
    res.json(results);
  });
});

/* DELETE */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM fields WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Field deleted" });
  });
});

module.exports = router;