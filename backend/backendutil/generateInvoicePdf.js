const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Read logo as base64 so it works in headless PDF
const logoPath = path.join(__dirname, "../../frontend/src/images/logo.svg");
const logoBase64 = fs.existsSync(logoPath)
  ? "data:image/svg+xml;base64," + Buffer.from(fs.readFileSync(logoPath)).toString("base64")
  : "";

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
const fmt = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

function buildInvoiceHtml({ invoice, items, type }) {
  const isPI = type === "performa";
  const label = isPI ? "PERFORMA INVOICE" : "QUOTATION";
  const toLabel = isPI ? "Performa Invoice To:" : "Quotation To:";
  const fromLabel = isPI ? "Performa Invoice From:" : "Quotation From:";
  const numLabel = isPI ? "Invoice No:" : "Quotation No:";
  const dateLabel = isPI ? "Invoice Date:" : "Quotation Date:";
  const year = new Date(invoice.invoice_date || invoice.quotation_date).getFullYear();
  const id = invoice.id || invoice.performainvoice_id || invoice.quotation_id;
  const docNumber = isPI
    ? `PI-${year}-${String(id).padStart(3, "0")}`
    : `QT-${year}-${String(id).padStart(3, "0")}`;
  const docDate = formatDate(invoice.invoice_date || invoice.quotation_date);

  const itemRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"};">
      <td style="padding:10px 13px;border:1px solid #e5e7eb;font-size:13px;">${item.product_number ?? i + 1}</td>
      <td style="padding:10px 13px;border:1px solid #e5e7eb;font-size:13px;text-align:left;">${item.description}</td>
      <td style="padding:10px 13px;border:1px solid #e5e7eb;font-size:13px;text-align:right;">&#8377;${fmt(item.price)}</td>
      <td style="padding:10px 13px;border:1px solid #e5e7eb;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 13px;border:1px solid #e5e7eb;font-size:13px;text-align:right;font-weight:700;">&#8377;${fmt(item.subtotal)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
    html, body { margin:0; padding:0; background:#fff; width:860px; }
  </style>
  </head><body>
  <div id="invoice" style="width:860px;background:#fff;overflow:hidden;">

    <!-- HEADER -->
    <div style="background:#6b7fa3;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        ${logoBase64
          ? `<img src="${logoBase64}" style="height:65px;max-width:260px;object-fit:contain;" />`
          : `<span style="font-size:26px;font-weight:900;color:#facc15;letter-spacing:2px;">madhura</span>`}
      </div>
      <div style="text-align:right;">
        <div style="font-size:26px;font-weight:900;color:#a3e635;margin-bottom:6px;">${label}</div>
        <div style="font-size:13px;color:#fff;margin-bottom:3px;">${numLabel} ${docNumber}</div>
        <div style="font-size:13px;color:#fff;">${dateLabel} ${docDate}</div>
      </div>
    </div>

    <!-- BILL INFO -->
    <div style="display:flex;justify-content:space-between;padding:20px 32px;background:#f9fafb;border-bottom:2px solid #e5e7eb;">
      <div>
        <div style="color:#65a30d;font-weight:700;margin-bottom:8px;font-size:13px;">${toLabel}</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${invoice.customer_name}</div>
        <div style="color:#6b7280;font-size:13px;margin-bottom:3px;">${invoice.location_city || ""}</div>
        <div style="font-size:13px;margin-bottom:3px;">&#128222; ${invoice.mobile_number || ""}</div>
        <div style="font-size:13px;">&#9993; ${invoice.email || ""}</div>
      </div>
      <div style="text-align:right;">
        <div style="color:#65a30d;font-weight:700;margin-bottom:8px;font-size:13px;">${fromLabel}</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:4px;">Madhura Technologies</div>
        <div style="color:#6b7280;font-size:13px;margin-bottom:3px;">Managing Director, Company Ltd</div>
        <div style="font-size:13px;margin-bottom:3px;">&#128222; +123 4567 8910</div>
        <div style="font-size:13px;">&#9993; Madhuratech@mail.com</div>
      </div>
    </div>

    <!-- TABLE -->
    <div style="padding:20px 32px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#84cc16;">
            <th style="padding:11px 13px;border:1px solid #65a30d;color:#fff;font-size:13px;text-align:left;">No</th>
            <th style="padding:11px 13px;border:1px solid #65a30d;color:#fff;font-size:13px;text-align:left;">Product Description</th>
            <th style="padding:11px 13px;border:1px solid #65a30d;color:#fff;font-size:13px;text-align:right;">Price</th>
            <th style="padding:11px 13px;border:1px solid #65a30d;color:#fff;font-size:13px;text-align:center;">Qty</th>
            <th style="padding:11px 13px;border:1px solid #65a30d;color:#fff;font-size:13px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <div style="display:flex;justify-content:space-between;padding:0 32px 20px 32px;">
      <div style="width:44%;">
        <div style="background:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb;">
          <div style="color:#65a30d;font-weight:700;margin-bottom:6px;font-size:13px;">Terms &amp; Conditions</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.6;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        </div>
      </div>
      <div style="width:48%;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;font-size:13px;color:#374151;">Subtotal</td><td style="padding:7px 0;font-size:13px;text-align:right;font-weight:600;">&#8377;${fmt(invoice.subtotal)}</td></tr>
          <tr><td style="padding:7px 0;font-size:13px;color:#374151;">Discount</td><td style="padding:7px 0;font-size:13px;text-align:right;font-weight:600;">&#8377;${fmt(invoice.total_discount)}</td></tr>
          <tr><td style="padding:7px 0;font-size:13px;color:#374151;">CGST (9%)</td><td style="padding:7px 0;font-size:13px;text-align:right;font-weight:600;">&#8377;${fmt(invoice.total_cgst)}</td></tr>
          <tr style="border-bottom:2px solid #e5e7eb;"><td style="padding:7px 0 11px;font-size:13px;color:#374151;">SGST (9%)</td><td style="padding:7px 0 11px;font-size:13px;text-align:right;font-weight:600;">&#8377;${fmt(invoice.total_sgst)}</td></tr>
          <tr style="background:#84cc16;">
            <td style="padding:13px 10px;font-size:15px;font-weight:700;color:#fff;border-radius:6px 0 0 6px;">Grand Total</td>
            <td style="padding:13px 10px;font-size:19px;font-weight:700;text-align:right;color:#fff;border-radius:0 6px 6px 0;">&#8377;${fmt(invoice.grand_total)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#1e293b;color:#fff;padding:15px 32px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;font-weight:500;">&#128222; +123 4567 8910</span>
      <span style="font-size:13px;font-weight:500;">&#9993; MadhuraTech@gmail.com</span>
      <span style="font-size:13px;font-weight:500;">&#128205; RS Puram</span>
      <span style="font-size:13px;font-weight:700;">Thank You For Your Business</span>
    </div>

  </div>
  </body></html>`;
}

async function generateInvoicePdf({ invoice, items, type }) {
  const html = buildInvoiceHtml({ invoice, items, type });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 860, height: 1200 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Measure exact content height to eliminate bottom whitespace
    const contentHeight = await page.evaluate(() => {
      return document.getElementById("invoice").scrollHeight;
    });

    const pdfBuffer = await page.pdf({
      width: "860px",
      height: `${contentHeight}px`,
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePdf };
