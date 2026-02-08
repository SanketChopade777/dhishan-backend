const PDFDocument = require("pdfkit");
const path = require("path");
const QRCode = require("qrcode");

const generateTicket = async (registration) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      /* =========================
         BACKGROUND IMAGE
      ========================= */
      const bgPath = path.join(__dirname, "..", "assets", "dhishan-bg.png");
      doc.image(bgPath, 0, 0, {
        width: pageWidth,
        height: pageHeight,
      });

      /* =========================
         HEADER
      ========================= */
      doc
        .fillColor("#ffffff")
        .fontSize(34)
        .font("Helvetica-Bold")
        .text("DHISHAN 26", 0, 40, { align: "center" });

      doc
        .fontSize(18)
        .fillColor("#facc15")
        .text("Official Entry Ticket", { align: "center" });

      /* =========================
         MAIN TICKET CARD
      ========================= */
      const cardWidth = 460;
      const cardHeight = 360;
      const cardX = (pageWidth - cardWidth) / 2;
      const cardY = 130;

      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 16).fill("#ffffff");

      // Accent top bar
      doc.roundedRect(cardX, cardY, cardWidth, 40, 16).fill("#1e3a8a");

      doc
        .fillColor("#ffffff")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("PARTICIPANT DETAILS", cardX + 20, cardY + 12);

      /* =========================
         TEXT CONTENT
      ========================= */
      const labelX = cardX + 30;
      const valueX = cardX + 220;
      let rowY = cardY + 70;
      const rowGap = 30;

      doc.fontSize(13).fillColor("#374151").font("Helvetica");

      const drawRow = (label, value) => {
        doc.text(label, labelX, rowY);
        doc.font("Helvetica-Bold").text(value, valueX, rowY);
        doc.font("Helvetica");
        rowY += rowGap;
      };

      drawRow("Student Name", registration.studentName);
      drawRow("Roll No", registration.rollNo);
      drawRow("Branch", registration.branch);
      drawRow("Year", registration.year);
      drawRow("Mobile", registration.mobile);
      drawRow("Email", registration.email);
      drawRow("Ticket No", registration.ticketNumber);

      drawRow(
        "Registered On",
        new Date(registration.registrationTime).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      );

      /* =========================
        QR CODE (Adjusted Position)
        ========================= */
      const qrData = JSON.stringify({
        ticket: registration.ticketNumber,
        rollNo: registration.rollNo,
        event: "DHISHAN 26",
      });

      const qrImage = await QRCode.toDataURL(qrData);

      // QR position — top-right inside card
      const qrSize = 90;
      const qrX = cardX + cardWidth - qrSize;
      const qrY = cardY;

      doc.image(qrImage, qrX, qrY, {
        width: qrSize,
      });

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text("Scan at Entry", qrX, qrY + qrSize + 6, {
          width: qrSize,
          align: "center",
        });

      /* =========================
         FOOTER
      ========================= */
      doc
        .fontSize(10)
        .fillColor("#ffffff")
        .text(
          "Please carry this ticket (digital/printed) along with College ID.\nTicket is non-transferable.",
          0,
          pageHeight - 60,
          { align: "center" },
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTicket };
