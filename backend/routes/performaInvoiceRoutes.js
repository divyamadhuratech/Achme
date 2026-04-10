const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET ALL PERFORMA INVOICES
router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.invoice_date,
      p.grand_total,
      c.customer_name,
      c.mobile_number,
      c.location_city,
      c.email,
      MIN(pi.description) AS description
    FROM performainvoices p
    JOIN customers c ON c.id = p.customer_id
    LEFT JOIN performainvoice_items pi ON pi.invoice_id = p.id
    GROUP BY p.id
    ORDER BY p.id ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* GET PERFORMA INVOICE BY ID */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      p.id AS performainvoice_id,
      p.invoice_date,
      p.subtotal,
      p.total_tax,
      p.total_cgst,        
      p.total_sgst, 
      p.total_discount,
      p.grand_total,
      c.customer_name,
      c.mobile_number,
      c.email,
      c.location_city,
      pi.product_number,
      pi.description,
      pi.price,
      pi.quantity,
      pi.subtotal AS item_subtotal
    FROM performainvoices p
    JOIN customers c ON c.id = p.customer_id
    JOIN performainvoice_items pi ON pi.invoice_id = p.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(404).json([]);
    res.json(rows);
  });
});

/* ================= CREATE PERFORMA INVOICE ================= */
const validateInvoice = ({ customer, performaInvoice, items }) => {
  if (!customer.customer_name) return "Customer name is required";
  if (!customer.mobile_number) return "Mobile number is required";
  if (!performaInvoice.invoice_date) return "Invoice date is required";
  if (!items || items.length === 0) return "At least one item is required";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.description) return `Item ${i + 1}: Description is required`;
    if (item.price === "" || item.price === null) return `Item ${i + 1}: Price is required`;
    if (!item.quantity || item.quantity <= 0) return `Item ${i + 1}: Quantity must be greater than 0`;
  }
  return null;
};

router.post("/create", (req, res) => {
  const error = validateInvoice(req.body);
  if (error) return res.status(400).json({ message: error });

  const { customer, performaInvoice, items } = req.body;

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: "Transaction error" });

    db.query(
      `INSERT INTO customers (customer_name, mobile_number, email, location_city) VALUES (?,?,?,?)`,
      [customer.customer_name, customer.mobile_number, customer.email, customer.location_city],
      (err, customerResult) => {
        if (err) return db.rollback(() => res.status(500).json(err));

        const customerId = customerResult.insertId;

        db.query(
          `INSERT INTO performainvoices
           (customer_id, invoice_date, total_cgst, total_sgst, subtotal, total_tax, total_discount, grand_total)
           VALUES (?,?,?,?,?,?,?,?)`,
          [
            customerId,
            performaInvoice.invoice_date,
            performaInvoice.total_cgst,
            performaInvoice.total_sgst,
            performaInvoice.subtotal,
            performaInvoice.total_cgst + performaInvoice.total_sgst,
            performaInvoice.total_discount,
            performaInvoice.grand_total,
          ],
          (err, result) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            const invoiceId = result.insertId;

            const values = items.map((item, index) => [
              invoiceId, index + 1, item.description, item.price, item.quantity, item.tax, item.discount, item.subtotal
            ]);

            db.query(
              `INSERT INTO performainvoice_items
               (invoice_id, product_number, description, price, quantity, tax, discount, subtotal)
               VALUES ?`,
              [values],
              err => {
                if (err) return db.rollback(() => res.status(500).json(err));

                db.commit(err => {
                  if (err) return db.rollback(() => res.status(500).json(err));
                  res.status(201).json({ message: "Created Successfully", invoiceId });
                });
              }
            );
          }
        );
      }
    );
  });
});

// Update
router.put("/:id", (req, res) => {
  const error = validateInvoice(req.body);
  if (error) return res.status(400).json({ message: error });
  
  const { id } = req.params;
  const { customer, performaInvoice, items } = req.body;

  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);

    db.query(
      `UPDATE customers
       SET customer_name=?, mobile_number=?, email=?, location_city=?
       WHERE id = (SELECT customer_id FROM performainvoices WHERE id=?)`,
      [customer.customer_name, customer.mobile_number, customer.email, customer.location_city, id],
      err => {
        if (err) return db.rollback(() => res.status(500).json(err));

        db.query(
          `UPDATE performainvoices
           SET invoice_date=?, subtotal=?, total_cgst=?, total_sgst=?, total_tax=?, total_discount=?, grand_total=?
           WHERE id=?`,
          [
            performaInvoice.invoice_date, performaInvoice.subtotal, performaInvoice.total_cgst,
            performaInvoice.total_sgst, performaInvoice.total_cgst + performaInvoice.total_sgst,
            performaInvoice.total_discount, performaInvoice.grand_total, id
          ],
          err => {
            if (err) return db.rollback(() => res.status(500).json(err));

            db.query(`DELETE FROM performainvoice_items WHERE invoice_id=?`, [id], err => {
              if (err) return db.rollback(() => res.status(500).json(err));

              const values = items.map((item, index) => [
                id, index + 1, item.description, item.price, item.quantity, item.tax, item.discount, item.subtotal
              ]);

              db.query(
                `INSERT INTO performainvoice_items
                 (invoice_id, product_number, description, price, quantity, tax, discount, subtotal)
                 VALUES ?`,
                [values],
                err => {
                  if (err) return db.rollback(() => res.status(500).json(err));
                  db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ message: "Updated successfully" });
                  });
                }
              );
            });
          }
        );
      }
    );
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: "Transaction failed" });

    db.query("DELETE FROM performainvoice_items WHERE invoice_id = ?", [id], err => {
      if (err) return db.rollback(() => res.status(500).json({ error: "Item delete failed" }));

      db.query("DELETE FROM performainvoices WHERE id = ?", [id], err => {
        if (err) return db.rollback(() => res.status(500).json({ error: "Delete failed" }));

        db.commit(err => {
          if (err) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
          res.json({ message: "Deleted successfully" });
        });
      });
    });
  });
});

// SEND EMAIL
const nodemailer = require("nodemailer");
const { generateInvoicePdf } = require("../backendutil/generateInvoicePdf");

router.post("/send-email/:id", (req, res) => {
  const { id } = req.params;
  const { to, subject } = req.body;

  const headerSql = `
    SELECT p.*, c.email, c.customer_name, c.mobile_number, c.location_city,
           p.grand_total, p.invoice_date, p.subtotal, p.total_cgst, p.total_sgst, p.total_discount
    FROM performainvoices p
    JOIN customers c ON p.customer_id = c.id
    WHERE p.id = ?`;

  const itemsSql = `
    SELECT product_number, description, price, quantity, subtotal
    FROM performainvoice_items WHERE invoice_id = ? ORDER BY product_number`;

  db.query(headerSql, [id], (err, headerRows) => {
    if (err) return res.status(500).json(err);
    if (!headerRows.length) return res.status(404).json({ message: "Performa Invoice not found" });

    const invoice = headerRows[0];
    const recipientEmail = to || invoice.email;
    if (!recipientEmail) return res.status(400).json({ message: "No email address provided" });

    db.query(itemsSql, [id], async (err, items) => {
      if (err) return res.status(500).json(err);

      const year = new Date(invoice.invoice_date).getFullYear();
      const piNumber = `PI-${year}-${String(invoice.id).padStart(3, "0")}`;

      try {
        // Generate PDF with exact same design as the app
        const pdfBuffer = await generateInvoicePdf({ invoice, items, type: "performa" });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"Madhura Team" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: subject || `Proforma Invoice ${piNumber}`,
          html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:600px;margin:0 auto;">
            <p style="font-size:16px;color:#1e293b;">Dear Customer,</p>
            <p style="font-size:14px;color:#374151;margin-top:12px;">Please find your <strong>Proforma Invoice ${piNumber}</strong> attached to this email.</p>
            <p style="font-size:14px;color:#374151;margin-top:8px;">Thank you for your business.</p>
            <p style="font-size:14px;color:#374151;margin-top:16px;">Regards,<br/><strong>Madhura Technologies</strong></p>
          </div>`,
          attachments: [
            {
              filename: `Proforma_Invoice_${piNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });

        res.json({ message: "Email sent successfully" });
      } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email", error: error.message });
      }
    });
  });
});

module.exports = router;
