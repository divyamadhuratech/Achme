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

router.post("/send-email/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT p.*, c.email, c.customer_name, p.grand_total, p.invoice_date
     FROM performainvoices p
     JOIN customers c ON p.customer_id = c.id
     WHERE p.id = ?`,
    [id],
    async (err, rows) => {
      if (err) return res.status(500).json(err);
      if (!rows.length) return res.status(404).json({ message: "Performa Invoice not found" });

      const invoice = rows[0];
      if (!invoice.email) return res.status(400).json({ message: "Customer has no email address" });

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Achme Team" <${process.env.EMAIL_USER}>`,
          to: invoice.email,
          subject: `Proforma Invoice #${invoice.id} from Achme`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #1694CE; padding: 24px; color: white;">
                <h2 style="margin:0;">Proforma Invoice #${invoice.id}</h2>
                <p style="margin:4px 0 0; opacity:0.85;">Achme Business Solutions</p>
              </div>
              <div style="padding: 24px;">
                <p>Hello <strong>${invoice.customer_name}</strong>,</p>
                <p>Please find your Proforma Invoice details below:</p>
                <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background:#f5f5f5;">
                    <td style="padding: 10px 14px; font-weight:bold;">Invoice Date</td>
                    <td style="padding: 10px 14px;">${new Date(invoice.invoice_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight:bold;">Grand Total</td>
                    <td style="padding: 10px 14px; color:#1694CE; font-size:18px;"><strong>₹${Number(invoice.grand_total).toLocaleString("en-IN")}</strong></td>
                  </tr>
                </table>
                <p style="color:#555;">This is a proforma invoice. Payment is due upon receipt.</p>
                <p>Thank you for doing business with us!</p>
              </div>
              <div style="background:#f9f9f9; padding: 16px 24px; text-align:center; color:#aaa; font-size:12px;">
                Achme Business Solutions &bull; Generated automatically
              </div>
            </div>
          `,
        });

        res.json({ message: "Email sent successfully" });
      } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email", error: error.message });
      }
    }
  );
});

module.exports = router;
