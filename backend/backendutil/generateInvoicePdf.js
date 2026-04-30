"use strict";

/**
 * generateInvoicePdf.js
 * Opens the live React invoice page in Puppeteer and captures it as PDF.
 * This guarantees the PDF matches the software design exactly.
 */

const ROUTE_MAP = {
  quotation : "quotation",
  proforma  : "proforma",
  estimation: "estimation",
  service   : "service",
};

async function generateInvoicePdf({ invoice, items, type }) {
  const puppeteer = require("puppeteer");

  const docType = ROUTE_MAP[type] || "quotation";
  const docId   = invoice.invoice_id || invoice.quotation_id || invoice.id;

  // URL of the React invoice preview page
  const url = `http://localhost:3001/invoice-preview/${docType}/${docId}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();

    // A4 width at 96dpi = 794px
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for invoice content to render
    await page.waitForSelector(".invoice-pdf-root", { timeout: 15000 }).catch(() => {});

    // Wait for images and fonts
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map(i =>
        i.complete ? Promise.resolve() :
        new Promise(r => { i.addEventListener("load", r); i.addEventListener("error", r); })
      ));
    });

    // Get exact content height
    const contentHeightPx = await page.evaluate(() => {
      const root = document.querySelector(".invoice-pdf-root") || document.body;
      return Math.ceil(root.getBoundingClientRect().height || root.scrollHeight);
    });

    const contentHeightMm = Math.ceil(contentHeightPx * 0.26458) + 4;

    const pdfBuffer = await page.pdf({
      width: "210mm",
      height: `${contentHeightMm}mm`,
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePdf };
