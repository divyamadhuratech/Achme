"use strict";

/**
 * generateInvoicePdf.js
 * Generates a PDF buffer for all 4 invoice modules using Puppeteer.
 * – Logo embedded as base64 (no React asset dependency)
 * – Compact A4 portrait layout, fits 1-2 pages cleanly
 * – page-break-inside:avoid on every section so nothing splits mid-column
 */

const path = require("path");
const fs   = require("fs");

// ── Logo: read once, cache ─────────────────────────────────────────────────
let LOGO_B64 = "";
const LOGO_PATH = path.resolve(__dirname, "../../frontend/src/images/l.png");
try {
  LOGO_B64 = fs.readFileSync(LOGO_PATH).toString("base64");
} catch (_) {
  console.warn("[PDF] Logo not found at", LOGO_PATH, "– using text fallback");
}
const LOGO_SRC = LOGO_B64
  ? `data:image/png;base64,${LOGO_B64}`
  : "";

// ── XML escape ─────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Main export ─────────────────────────────────────────────────────────────
async function generateInvoicePdf({ invoice, items, type, label, prefix }) {
  const puppeteer = require("puppeteer");

  // Resolve doc type defaults
  const TYPE_MAP = {
    quotation : { label: "PROPOSAL",          prefix: "QT" },
    performa  : { label: "PROFORMA INVOICE",  prefix: "PI" },
    estimation: { label: "ESTIMATION",        prefix: "EI" },
    service   : { label: "SERVICE ESTIMATION",prefix: "SE" },
  };
  const def = TYPE_MAP[type] || TYPE_MAP.performa;
  const docLabel  = label  || def.label;
  const docPrefix = prefix || def.prefix;

  const h = invoice;

  // Helpers
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "---";
  const fmtNum  = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const invoiceDate = h.invoice_date || h.quotation_date || h.estimate_date || new Date().toISOString();
  const year        = new Date(invoiceDate).getFullYear();
  const docId       = h.invoice_id || h.quotation_id || h.id;
  const docNumber   = `${docPrefix}-${year}-${String(docId).padStart(3, "0")}`;
  const taxRate     = h.tax_type === "GST5" ? 5 : h.tax_type === "CUSTOM" ? (Number(h.custom_tax) || 0) : 18;

  const clientAddr  = [h.client_address1, h.client_address2, h.client_city, h.client_state, h.client_pincode]
    .filter(Boolean).join(", ");

  // ── Terms ────────────────────────────────────────────────────────────────
  const terms = [];
  if (h.terms_general)        terms.push("General Terms &amp; Conditions apply.");
  if (h.terms_tax)            terms.push("Prices quoted are exclusive of Sales and Service Tax (SEZ – NIL Tax applicable).");
  if (h.terms_project_period) terms.push(`Project Period: ${esc(h.terms_project_period)}`);
  if (h.terms_validity)       terms.push("Quote valid for 15 days from the date of quotation.");
  try {
    const so = typeof h.terms_separate_orders === "string"
      ? JSON.parse(h.terms_separate_orders) : (h.terms_separate_orders || {});
    if (so.material)     terms.push("A. Material Supply (As per actuals)");
    if (so.installation) terms.push("B. Installation / Services");
    if (so.usd)          terms.push("C. Price may vary based on USD rates");
    if (so.boq)          terms.push("D. Factory BOQ may vary");
  } catch (_) {}
  if (h.terms_payment) {
    const pt = h.terms_payment === "Custom" ? h.terms_payment_custom : h.terms_payment;
    if (pt) terms.push(`Payment Terms: ${esc(pt)}`);
  }
  if (h.terms_warranty) terms.push(`Warranty: ${esc(h.terms_warranty)}`);

  // ── Item rows ─────────────────────────────────────────────────────────────
  const itemRows = (items || []).map((item, i) => {
    const descHtml = (item.description || "")
      .split(",")
      .map((p, idx) => idx === 0
        ? `<strong>${esc(p.trim())}</strong>`
        : `<div class="desc-sub">${esc(p.trim())}</div>`)
      .join("");

    return `<tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
      <td class="tc center">${item.product_number ?? i + 1}</td>
      <td class="td-desc">${descHtml}</td>
      <td class="tc">${esc(item.brand_model || "—")}</td>
      <td class="tc center">${esc(String(item.quantity))}</td>
      <td class="tc center">${esc(item.uom || "Nos")}</td>
      <td class="tc right">&#8377;${fmtNum(item.price)}</td>
      <td class="tc right bold">&#8377;${fmtNum(item.subtotal || item.item_subtotal)}</td>
    </tr>`;
  }).join("");

  // ── Logo HTML ──────────────────────────────────────────────────────────────
  const logoHtml = LOGO_SRC
    ? `<img src="${LOGO_SRC}" alt="Achme Communication" class="logo-img" />`
    : `<div class="logo-text">ACHME</div>`;

  // ── Exec row ───────────────────────────────────────────────────────────────
  const execHtml = (h.exec_name || h.exec_phone || h.exec_email)
    ? `<div class="exec-row">
        <span class="label">Executive:</span>
        ${h.exec_name  ? `<strong>${esc(h.exec_name)}</strong>` : ""}
        ${h.exec_phone ? `<span>&#128222; ${esc(h.exec_phone)}</span>` : ""}
        ${h.exec_email ? `<span>&#9993; ${esc(h.exec_email)}</span>` : ""}
      </div>` : "";

  // ── Discount row ──────────────────────────────────────────────────────────
  const discRow = Number(h.total_discount) > 0
    ? `<tr><td>Discount</td><td class="right red">-&#8377;${fmtNum(h.total_discount)}</td></tr>` : "";

  // ── Terms section ──────────────────────────────────────────────────────────
  const termsSection = terms.length
    ? `<div class="section avoid">
        <div class="section-title">Terms &amp; Conditions</div>
        <ul class="terms-list">${terms.map(t => `<li>${t}</li>`).join("")}</ul>
      </div>` : "";

  // ── Full HTML ──────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  /* ── Page setup ── */
  @page { size: A4 portrait; margin: 8mm 8mm 10mm 8mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    color: #1a1a1a;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Utility ── */
  .avoid          { page-break-inside: avoid; break-inside: avoid; }
  .bold           { font-weight: 700; }
  .center         { text-align: center; }
  .right          { text-align: right; }
  .red            { color: #dc2626; }
  .accent         { color: #1694CE; }

  /* ── Top bar ── */
  .top-bar        { height: 6px; background: #1694CE; }

  /* ── Header ── */
  .header         { display: flex; justify-content: space-between; align-items: flex-start;
                    padding: 9px 12px 8px; border-bottom: 1px solid #dde3ea; }
  .header-left    { display: flex; align-items: center; gap: 12px; }
  .logo-img       { height: 46px; width: auto; object-fit: contain; }
  .logo-text      { font-size: 20pt; font-weight: 900; color: #1694CE; }
  .company-info   { border-left: 2px solid #d1d5db; padding-left: 10px; font-size: 7.5pt;
                    color: #444; line-height: 1.65; }
  .company-info strong { color: #111; }
  .header-right   { text-align: right; }
  .doc-label      { font-size: 17pt; font-weight: 900; color: #1694CE;
                    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .doc-box        { background: #f8fafc; border: 1px solid #dde3ea; border-radius: 5px;
                    padding: 6px 10px; text-align: left; min-width: 200px; }
  .doc-box table  { width: 100%; font-size: 8pt; }
  .doc-box td     { padding: 2px 0; }
  .doc-box .lbl   { font-weight: 700; color: #333; width: 58px; }
  .doc-box .val   { font-weight: 700; color: #111; text-align: right; }
  .doc-box .ref   { color: #1694CE; }

  /* ── Address strip ── */
  .addr-strip     { display: flex; border-bottom: 1px solid #dde3ea; }
  .addr-from      { flex: 1; padding: 8px 12px; border-right: 1px solid #dde3ea; }
  .addr-to        { flex: 1; padding: 8px 12px; background: #f9fafb; }
  .addr-label     { font-size: 7pt; font-weight: 700; color: #1694CE;
                    text-transform: uppercase; letter-spacing: 1px;
                    border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 5px; }
  .from-name      { font-size: 11pt; font-weight: 900; color: #111; margin-bottom: 2px; }
  .from-addr      { font-size: 7.5pt; color: #555; line-height: 1.55; white-space: pre-line; }
  .to-company     { font-size: 11pt; font-weight: 900; color: #111; margin-bottom: 1px; }
  .to-name        { font-size: 10pt; font-weight: 700; color: #222; margin-bottom: 4px; }
  .to-addr        { font-size: 7.5pt; color: #555; line-height: 1.55; margin-bottom: 3px; }
  .to-contacts    { display: flex; gap: 16px; font-size: 7.5pt; font-weight: 600;
                    color: #333; border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 3px; }
  .exec-row       { margin-top: 6px; padding-top: 5px; border-top: 1px solid #e5e7eb;
                    font-size: 7.5pt; color: #555; display: flex; gap: 8px; align-items: center; }
  .exec-row .label{ font-weight: 700; color: #111; }

  /* ── Items table ── */
  .section        { padding: 8px 12px; }
  .items-wrap     { border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; }
  table.items     { width: 100%; border-collapse: collapse; font-size: 8pt; }
  table.items thead tr { background: #1694CE; color: #fff; }
  table.items thead th {
    padding: 6px 5px; text-align: center; font-size: 7pt;
    text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;
    border-right: 1px solid #1580B8;
  }
  table.items thead th:last-child { border-right: none; }
  table.items thead th.left  { text-align: left; }
  table.items thead th.right { text-align: right; }
  .tc             { padding: 5px 5px; border-right: 1px solid #e5e7eb; font-size: 8pt; }
  .td-desc        { padding: 5px 7px; border-right: 1px solid #e5e7eb; }
  .td-desc strong { font-size: 8pt; font-weight: 700; color: #111; }
  .desc-sub       { font-size: 7pt; color: #555; margin-top: 1px; }
  .row-even       { background: #fff; }
  .row-odd        { background: #f9fafb; }
  table.items tbody tr { border-bottom: 1px solid #e5e7eb; }
  table.items tbody tr:last-child { border-bottom: none; }

  /* ── Totals ── */
  .totals-wrap    { display: flex; justify-content: flex-end; padding: 0 12px 8px; }
  .totals-box     { width: 265px; background: #f8fafc; border: 1px solid #dde3ea;
                    border-radius: 5px; padding: 8px 12px; }
  table.totals    { width: 100%; font-size: 8pt; }
  table.totals td { padding: 2.5px 0; }
  table.totals .right { text-align: right; font-weight: 700; }
  .gt-row td      { padding-top: 6px; font-size: 10.5pt; font-weight: 900;
                    border-top: 1px solid #d1d5db; }
  .gt-row .right  { color: #1694CE; font-size: 12pt; }

  /* ── Section title ── */
  .section-title  { font-size: 7.5pt; font-weight: 700; color: #1694CE;
                    text-transform: uppercase; letter-spacing: 0.8px;
                    border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 6px; }
  .terms-list     { padding-left: 14px; list-style: disc; }
  .terms-list li  { font-size: 7.5pt; color: #374151; margin-bottom: 2.5px; font-weight: 500; }

  /* ── Footer 2-col (NO avoid so it flows naturally) ── */
  .footer-grid    { display: flex; border: 1px solid #d1d5db; border-radius: 4px;
                    overflow: hidden; margin: 0 12px 12px; }
  .footer-left    { flex: 1; padding: 10px 12px; border-right: 1px solid #d1d5db; background: #f9fafb; }
  .footer-right   { flex: 1; padding: 10px 12px; background: #fff;
                    display: flex; flex-direction: column; justify-content: space-between; }

  .ft-title       { font-size: 7pt; font-weight: 700; color: #1694CE;
                    text-transform: uppercase; letter-spacing: 0.7px;
                    border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin-bottom: 6px; }
  .ft-company     { font-size: 10.5pt; font-weight: 900; color: #111; margin-bottom: 1px; }
  .ft-sub         { font-size: 7.5pt; font-weight: 600; color: #666; margin-bottom: 7px; }

  table.reg-table { width: 100%; font-size: 7pt; color: #333; margin-bottom: 8px; }
  table.reg-table td { padding: 1.5px 0; }
  table.reg-table .key { width: 150px; font-weight: 500; }
  table.reg-table .val { font-weight: 700; }

  .notes-section  { margin-top: 7px; }
  .notes-block    { margin-bottom: 5px; font-size: 7pt; color: #333; line-height: 1.55; }
  .notes-block .nt{ font-weight: 700; color: #111; margin-bottom: 1px; }
  .notes-block .caps { font-weight: 700; text-transform: uppercase; font-size: 6.5pt; }

  .branch-block   { margin-bottom: 8px; font-size: 7.5pt; color: #333; line-height: 1.6; }
  .branch-name    { font-weight: 700; font-size: 8.5pt; color: #111; margin-bottom: 1px; }

  table.bank-table{ width: 100%; font-size: 7pt; color: #333; }
  table.bank-table td { padding: 1.5px 0; }
  table.bank-table .key { width: 85px; font-weight: 500; }
  table.bank-table .val { font-weight: 700; color: #111; }

  .signature      { text-align: right; margin-top: 20px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
  .sig-for        { font-size: 7.5pt; font-style: italic; color: #888; margin-bottom: 22px; }
  .sig-line       { display: inline-block; border-top: 1px solid #999;
                    padding-top: 5px; text-align: center; min-width: 120px; }
  .sig-name       { font-weight: 900; font-size: 8.5pt; text-transform: uppercase; }
  .sig-phone      { font-size: 7pt; color: #555; font-weight: 600; }
</style>
</head>
<body>

<!-- TOP ACCENT -->
<div class="top-bar"></div>

<!-- ── HEADER ─────────────────────────────────────────────────────────────── -->
<div class="header avoid">
  <div class="header-left">
    ${logoHtml}
    <div class="company-info">
      <div><strong>GSTIN:</strong> 33AABCA1234D1Z5</div>
      <div><strong>Email:</strong> info@achmecommunication.com</div>
      <div><strong>Website:</strong> www.achmecommunication.com</div>
      <div><strong>Ph:</strong> 0422-2569966, 4376555</div>
    </div>
  </div>
  <div class="header-right">
    <div class="doc-label">${docLabel}</div>
    <div class="doc-box">
      <table>
        <tr><td class="lbl">Doc No:</td><td class="val">${docNumber}</td></tr>
        <tr><td class="lbl">Date:</td><td class="val">${fmtDate(invoiceDate)}</td></tr>
        ${h.reference_no ? `<tr><td class="lbl">Ref No:</td><td class="val ref">${esc(h.reference_no)}</td></tr>` : ""}
      </table>
    </div>
  </div>
</div>

<!-- ── FROM / TO ADDRESSES ────────────────────────────────────────────────── -->
<div class="addr-strip avoid">
  <div class="addr-from">
    <div class="addr-label">From Address</div>
    <div class="from-name">Achme Communication</div>
    <div class="from-addr">${esc(h.resolved_from_address || h.from_address_custom || "Head Office, Main Branch")}</div>
    ${execHtml}
  </div>
  <div class="addr-to">
    <div class="addr-label">Billed To</div>
    ${h.client_company ? `<div class="to-company">${esc(h.client_company)}</div>` : ""}
    <div class="to-name">${esc(h.customer_name || "")}</div>
    ${clientAddr ? `<div class="to-addr">${esc(clientAddr)}</div>` : ""}
    ${h.client_country ? `<div class="to-addr">${esc(h.client_country)}</div>` : ""}
    <div class="to-contacts">
      <span>&#128222; ${esc(h.mobile_number || "")}</span>
      ${h.email ? `<span>&#9993; ${esc(h.email)}</span>` : ""}
    </div>
  </div>
</div>

<!-- ── ITEMS TABLE ─────────────────────────────────────────────────────────── -->
<div class="section">
  <div class="items-wrap">
    <table class="items">
      <thead>
        <tr>
          <th style="width:36px;">S.No</th>
          <th class="left" style="text-align:left;">Description</th>
          <th style="width:130px;">Brand / Model</th>
          <th style="width:44px;">Qty</th>
          <th style="width:44px;">UOM</th>
          <th class="right" style="width:90px;text-align:right;">Price</th>
          <th class="right" style="width:95px;text-align:right;border-right:none;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>
</div>

<!-- ── TOTALS ──────────────────────────────────────────────────────────────── -->
<div class="totals-wrap avoid">
  <div class="totals-box">
    <table class="totals">
      <tr><td>Subtotal</td><td class="right">&#8377;${fmtNum(h.subtotal)}</td></tr>
      ${discRow}
      <tr><td>CGST (${taxRate / 2}%)</td><td class="right">&#8377;${fmtNum(h.total_cgst)}</td></tr>
      <tr><td>SGST (${taxRate / 2}%)</td><td class="right">&#8377;${fmtNum(h.total_sgst)}</td></tr>
      <tr class="gt-row">
        <td class="bold">Grand Total</td>
        <td class="right">&#8377;${fmtNum(h.grand_total)}</td>
      </tr>
    </table>
  </div>
</div>

<!-- ── TERMS ───────────────────────────────────────────────────────────────── -->
${termsSection}

<!-- ── FOOTER: 2-COLUMN ────────────────────────────────────────────────────── -->
<div class="footer-grid avoid">

  <!-- LEFT: Order On + Notes -->
  <div class="footer-left">
    <div class="ft-title">Order On</div>
    <div class="ft-company">Achme Communication</div>
    <div class="ft-sub">Our Certificate of Provisional Registration</div>

    <table class="reg-table">
      <tr><td class="key">GSTIN</td><td class="val">423523GSDH</td></tr>
      <tr><td class="key">TIN NO</td><td class="val">3747387199</td></tr>
      <tr><td class="key">SERVICE TAX REG. NO.</td><td class="val">JSDND383JSDJJ</td></tr>
      <tr><td class="key">PAN</td><td class="val">UEW3873</td></tr>
      <tr><td class="key">CENTRAL SALES TAX REG. NO.</td><td class="val">88325</td></tr>
    </table>

    <div class="notes-section">
      <div class="ft-title">Notes</div>
      <div class="notes-block">
        <div class="nt">Materials:</div>
        <div>BOQ considered based on discussion and our previous experience. In case of any extra materials required at time of execution will be charged extra.</div>
        <div class="caps">Cable and Cable Laying and Laying Accessories as per Actuals</div>
      </div>
      <div class="notes-block">
        <div class="nt">Delay:</div>
        <div>In case of delay due to dependencies from other agencies working at site, Achme Communication will not be responsible for the same.</div>
      </div>
      <div class="notes-block">
        <div class="nt">NOTE:</div>
        <div>Civil Works, Electrical Works, and Interior Works are not included in our scope. Related vendors' presence is required during project execution.</div>
      </div>
    </div>
  </div>

  <!-- RIGHT: Branches + Bank + Signature -->
  <div class="footer-right">
    <div>
      <div class="ft-title">Our Branches</div>
      <div class="branch-block">
        <div class="branch-name">Bangalore Branch:</div>
        <div>14th Main Road, GK Layout, Electronic City Post</div>
        <div>Bangalore - 560100</div>
        <div>GSTIN: <strong>2635GHHJG</strong></div>
      </div>
      <div class="branch-block">
        <div class="branch-name">Chennai Branch:</div>
        <div>5th Floor, 5CD PM Towers, Dreams Road, Thousand Lights</div>
        <div>Chennai - 600006</div>
        <div>GSTIN: <strong>423523GSDH</strong></div>
      </div>

      <div style="margin-top:10px;">
        <div class="ft-title">Bank Details</div>
        <table class="bank-table">
          <tr><td class="key">Company name</td><td class="val">Achme Communication</td></tr>
          <tr><td class="key">Bank</td><td class="val">KOTAK MAHINDRA BANK</td></tr>
          <tr><td class="key">Account no</td><td class="val">12345667</td></tr>
          <tr><td class="key">IFSC Code</td><td class="val">34DJFHJDH</td></tr>
          <tr><td class="key">Branch</td><td style="font-weight:500;">test, coimbatore</td></tr>
        </table>
      </div>
    </div>

    <!-- Signature -->
    <div class="signature">
      <div class="sig-for">For Achme Communication</div>
      <div class="sig-line">
        <div class="sig-name">Krishna Kumar M</div>
        <div class="sig-phone">( 771234343 )</div>
      </div>
    </div>
  </div>

</div><!-- /footer-grid -->

</body>
</html>`;

  // ── Puppeteer render ────────────────────────────────────────────────────────
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport to A4 width in px at 96dpi (~794px) so layout reflects print width
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for images (logo) to load
    await page.evaluate(() =>
      new Promise((resolve) => {
        const imgs = Array.from(document.images);
        if (imgs.every(i => i.complete)) return resolve();
        let loaded = 0;
        imgs.forEach(img => {
          img.addEventListener("load",  () => { if (++loaded === imgs.length) resolve(); });
          img.addEventListener("error", () => { if (++loaded === imgs.length) resolve(); });
        });
        // Safety timeout
        setTimeout(resolve, 3000);
      })
    );

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "12mm", left: "10mm" },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePdf };
