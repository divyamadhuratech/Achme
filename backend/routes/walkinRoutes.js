const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET all telecalls
router.get("/", (req, res) => {
  db.query("SELECT * FROM Walkins ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const syncClient = (data) => {
  const { customer_name, mobile_number, location_city, purpose, email, walkin_status } = data;

  if (walkin_status === "Converted") {
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

// POST telecall
router.post("/", (req, res) => {
  const {
    customer_name,
    mobile_number,
    location_city,
    walkin_date,
    purpose,
    staff_name,
    walkin_status,
    followup_required,
    followup_date,
    followup_notes,
    reminder_required,
    reminder_date,
    reminder_notes,
    reference,
    gst_number,
    email
  } = req.body;

  const sql = `
    INSERT INTO Walkins (
      customer_name,
      mobile_number,
      location_city,
      walkin_date,
      purpose,
      staff_name,
      walkin_status,
      followup_required,
      followup_date,
      followup_notes,
      reminder_required,
      reminder_date,
      reminder_notes,
      reference,
      gst_number,
      email
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      customer_name,
      mobile_number,
      location_city,
      walkin_date,
      purpose,
      staff_name,
      walkin_status,
      followup_required,
      followup_date,
      followup_notes,
      reminder_required,
      reminder_date,
      reminder_notes,
      reference,
      gst_number,
      email
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      syncClient(req.body);
      res.json({ message: "Walkins added", id: result.insertId });
    }
  );
});


// GET single telecall (EDIT)

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query(
    "SELECT * FROM Walkins WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    }
  );
});


// Edit 

router.put("/:id", (req, res) => {
  const {
    customer_name,
    mobile_number,
    location_city,
    walkin_date,
    purpose,
    staff_name,
    walkin_status,
    followup_required,
    followup_date,
    followup_notes,
    reminder_required,
    reminder_date,
    reminder_notes,
    reference,
    gst_number,
    email
  } = req.body;

  db.query(
    `UPDATE Walkins SET
      customer_name=?,
      mobile_number=?,
      location_city=?,
      walkin_date=?,
      purpose=?,
      staff_name=?,
      walkin_status=?,
      followup_required=?,
      followup_date=?,
      followup_notes=?,
      reminder_required=?,
      reminder_date=?,
      reminder_notes=?,
      reference=?,
      gst_number=?,
      email=?
     WHERE id=?`,
    [
      customer_name,
      mobile_number,
      location_city,
      walkin_date,
      purpose,
      staff_name,
      walkin_status,
      followup_required,
      followup_date,
      followup_notes,
      reminder_required,
      reminder_date,
      reminder_notes,
      reference,
      gst_number,
      email,
      req.params.id
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Walkin not found" });
      }

      syncClient(req.body);
      res.json({ message: "Walkin updated successfully" });
    }
  );
});


 // Delete;
  router.delete("/:id",(req,res) =>{
    db.query(
      "DELETE FROM Walkins WHERE id = ?",
      [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Delete failed" });
      res.json({ message: "Field deleted" });
    }
    );
  })

module.exports = router;
