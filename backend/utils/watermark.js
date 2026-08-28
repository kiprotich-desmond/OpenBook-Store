// watermark.js — this one is REAL, not a stub. Uses pdf-lib to stamp a
// light, semi-transparent watermark (buyer name, email, purchase ID) onto
// every page of a purchased PDF, diagonally and low-opacity so it doesn't
// interfere with reading the text underneath.
//
// Usage: await watermarkPdf(inputPdfBytes, { name, email, purchaseId })
// Returns the watermarked PDF as a Buffer, ready to attach to an email or
// save to disk.
//
// Note: this only handles PDF. If you deliver EPUB as well, EPUB
// watermarking needs a different approach (embedding metadata / a
// per-purchase stylesheet note in the EPUB's OPF/XHTML), which is not
// included here — flag this to your engineer if EPUB purchases also need
// a visible watermark.

const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');

async function watermarkPdf(inputBytes, { name, email, purchaseId }) {
  const pdfDoc = await PDFDocument.load(inputBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const label = `${name} · ${email} · ${purchaseId}`;

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(label, {
      x: width / 2 - (label.length * 2.2),
      y: height / 2,
      size: 11,
      font,
      color: rgb(0.13, 0.11, 0.09), // matches the store's ink color
      opacity: 0.06,               // light enough to not interfere with reading
      rotate: degrees(35),
    });
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { watermarkPdf };
