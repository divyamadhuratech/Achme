const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Helper to safely format date to YYYY-MM-DD
const toDateOnly = (val) => {
  if (!val) return null;
  return val.toString().slice(0, 10);
};
router.get("/", (req, res) => {
  db.query("SELECT * FROM Telecalls ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const syncClient = (data) => {
  const { customer_name, mobile_number, location_city, service_name, email, call_outcome } = data;

  if (call_outcome === "Converted") {
    db.query(
      "SELECT * FROM clients WHERE phone = ?",
      [mobile_number],
      (err, result) => {
        if (err) return;
        if (result.length === 0) {
          db.query(
            "INSERT INTO clients (name, phone, address, service, email) VALUES (?, ?, ?, ?, ?)",
            [customer_name, mobile_number, location_city, service_name, email]
          );
        } else {
          db.query(
            "UPDATE clients SET name=?, address=?, service=?, email=? WHERE phone=?",
            [customer_name, location_city, service_name, email, mobile_number]
          );
        }
      }
    );
  } else {
    // If not converted, ensure it's removed from clients if it exists
    db.query("DELETE FROM clients WHERE phone = ?", [mobile_number]);
  }
};

// GET single telecall (EDIT)
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query(
    "SELECT * FROM Telecalls WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    }
  );
});


// POST telecall
router.post("/", (req, res) => {
  const {
    customer_name,
    mobile_number,
    location_city,
    call_date,
    service_name,
    staff_name,
    call_outcome,
    followup_required,
    followup_date,
    followup_notes,
    reminder_required,
    reminder_date,
    reminder_notes,
    reference,
    gst_number
  } = req.body;

  const sql = `
    INSERT INTO Telecalls (
      customer_name,
      mobile_number,
      location_city,
      call_date,
      service_name,
      staff_name,
      call_outcome,
      followup_required,
      followup_date,
      followup_notes,
      reminder_required,
      reminder_date,
      reminder_notes,
      reference,
      gst_number
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      customer_name,
      mobile_number,
      location_city,
      toDateOnly(call_date),
      service_name,
      staff_name,
      call_outcome,
      followup_required,
      toDateOnly(followup_date),
      followup_notes,
      reminder_required,
      toDateOnly(reminder_date),
      reminder_notes,
      reference,
      gst_number
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      syncClient(req.body);
      res.json({ message: "Telecall added", id: result.insertId });
    }
  );
});


// Edit 

router.put("/:id", (req, res) => {
  const {
    customer_name,
    mobile_number,
    location_city,
    call_date,
    service_name,
    staff_name,
    call_outcome,
    followup_required,
    followup_date,
    followup_notes,
    reminder_required,
    reminder_date,
    reminder_notes,
    reference,
    gst_number
  } = req.body;

  db.query(
    `UPDATE Telecalls SET
      customer_name=?,
      mobile_number=?,
      location_city=?,
      call_date=?,
      service_name=?,
      staff_name=?,
      call_outcome=?,
      followup_required=?,
      followup_date=?,
      followup_notes=?,
      reminder_required=?,
      reminder_date=?,
      reminder_notes=?,
      reference=?,
      gst_number=?
     WHERE id=?`,
    [
      customer_name,
      mobile_number,
      location_city,
      toDateOnly(call_date),
      service_name,
      staff_name,
      call_outcome,
      followup_required,
      toDateOnly(followup_date),
      followup_notes,
      reminder_required,
      toDateOnly(reminder_date),
      reminder_notes,
      reference,
      gst_number,
      req.params.id
    ],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Telecall not found" });
      }

      syncClient(req.body);
      res.json({ message: "Telecall updated successfully" });
    }
  );
});



  // Delete;
  router.delete("/:id",(req,res) =>{
    db.query(
      "DELETE FROM Telecalls WHERE id = ?",
      [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Delete failed" });
      res.json({ message: "Field deleted" });
    }
    );
  })

module.exports = router;
