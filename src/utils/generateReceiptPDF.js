import { jsPDF } from 'jspdf';

/**
 * Utility to generate and download an official Municipal Tax Payment Receipt PDF
 * using jsPDF with proper styling, branding, tables, and data parameters.
 *
 * All text uses ASCII-safe characters only (no ₹, no emoji, no bullet •)
 * to prevent encoding corruption in jsPDF's built-in Helvetica font.
 *
 * @param {Object} itemData - The transaction or payment record
 * @param {Object} userData - The current citizen user object
 */
export function generateReceiptPDF(itemData = {}, userData = {}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // ── Page constants ──────────────────────────────────────────────
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN_LEFT = 18;
    const MARGIN_RIGHT = 18;
    const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
    const RIGHT_EDGE = PAGE_W - MARGIN_RIGHT;
    const PAGE_BOTTOM = PAGE_H - 20; // safe bottom with margin

    // ── Color palette ───────────────────────────────────────────────
    const GOLD = [229, 184, 11];
    const NAVY = [17, 19, 27];
    const WHITE = [255, 255, 255];
    const SLATE_800 = [30, 41, 59];
    const SLATE_700 = [51, 65, 85];
    const SLATE_500 = [100, 116, 139];
    const SLATE_400 = [148, 163, 184];
    const SLATE_200 = [226, 232, 240];
    const SLATE_100 = [241, 245, 249];
    const SLATE_50 = [248, 250, 252];
    const DARK_TEXT = [15, 23, 42];
    const EMERALD = [16, 185, 129];
    const EMERALD_DARK = [6, 78, 59];
    const EMERALD_LIGHT = [5, 150, 105];
    const EMERALD_BG = [236, 253, 245];
    const AMBER_DARK = [161, 98, 7];
    const AMBER_DARKER = [113, 63, 18];
    const AMBER_BG = [254, 252, 232];
    const AMBER_BORDER = [254, 240, 138];
    const GOLD_TEXT = [255, 220, 105];
    const BLUE_LIGHT = [200, 220, 255];

    // ── Extract dynamic fields with safe fallbacks ──────────────────
    const receiptNo = String(itemData?.receiptId || itemData?.id || 'PAY5507');
    const txnId = String(itemData?.txnId || itemData?.id || ('TXN-' + Math.floor(100000 + Math.random() * 900000)));
    const taxType = String(itemData?.type || itemData?.taxName || 'Property Tax');
    const rawAmount = itemData?.amountPaid || itemData?.amount || 11650;
    const amountPaid = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) || 11650;

    const paymentDate = String(
      itemData?.date ||
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    );
    const paymentMethod = String(itemData?.method || itemData?.paymentMethod || itemData?.mode || 'Yearly Lump Sum (5% Rebate)');

    const citizenName = String(userData?.name || itemData?.citizenName || 'Verified Resident');
    const propertyId = String(userData?.propertyId || itemData?.propertyId || 'PROP-W02-0553');
    const ward = String(userData?.ward || itemData?.ward || 'W02 - Rajajinagar');
    const municipality = String(userData?.municipality || itemData?.municipality || 'Telangana Municipal Corp');
    const assessmentYear = String(itemData?.assessmentYear || 'FY 2025-2026');
    const complianceRisk = String(userData?.riskCategory || itemData?.riskCategory || 'Low Risk');
    const civicScore = Number(userData?.civicCreditScore || itemData?.civicCreditScore || 780);
    const streak = Number(userData?.streak || itemData?.streak || 1);
    const xp = Number(userData?.xp || itemData?.xp || 150);
    const tier = String(userData?.tier || itemData?.tier || '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim() || 'Gold Model Citizen';

    // Safe currency formatter — uses "INR" prefix, never ₹
    const fmtINR = (val) => 'INR ' + Number(val).toLocaleString('en-IN');

    // ── Helpers ──────────────────────────────────────────────────────

    /**
     * Wraps text to fit within maxWidth and renders it line by line.
     * Returns the Y position after the last line.
     */
    function drawWrappedText(text, x, y, maxWidth, lineHeight) {
      const lines = doc.splitTextToSize(String(text), maxWidth);
      for (let i = 0; i < lines.length; i++) {
        const lineY = y + i * lineHeight;
        if (lineY > PAGE_BOTTOM) {
          doc.addPage();
          y = 20 - i * lineHeight; // reset
        }
        doc.text(lines[i], x, y + i * lineHeight);
      }
      return y + lines.length * lineHeight;
    }

    /** Checks if we need a page break, adds one if so, returns new Y. */
    function ensureSpace(y, needed) {
      if (y + needed > PAGE_BOTTOM) {
        doc.addPage();
        return 20;
      }
      return y;
    }

    /** Draws a horizontal separator line. */
    function drawSeparator(y, color) {
      doc.setDrawColor(...(color || SLATE_200));
      doc.setLineWidth(0.3);
      doc.line(MARGIN_LEFT, y, RIGHT_EDGE, y);
      return y + 2;
    }

    // ── Cumulative Y cursor ─────────────────────────────────────────
    let Y = 0;

    // ================================================================
    // 1. TOP DECORATIVE BRAND BAR
    // ================================================================
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, PAGE_W, 5, 'F');
    Y = 5;

    // ================================================================
    // 2. OFFICIAL HEADER (Navy background)
    // ================================================================
    Y += 7; // gap
    const headerY = Y;
    const headerH = 32;
    doc.setFillColor(...NAVY);
    doc.roundedRect(MARGIN_LEFT, headerY, CONTENT_W, headerH, 2, 2, 'F');

    // Title
    doc.setTextColor(...GOLD_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CIVTAX AI', MARGIN_LEFT + 6, headerY + 9);

    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Smart Municipal Tax Payments', MARGIN_LEFT + 6, headerY + 14);

    doc.setTextColor(...SLATE_400);
    doc.setFontSize(7.5);
    doc.text('Government of Telangana  |  Greater Municipal Tax Treasury', MARGIN_LEFT + 6, headerY + 19.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BLUE_LIGHT);
    doc.text('OFFICIAL MUNICIPAL TAX PAYMENT RECEIPT', MARGIN_LEFT + 6, headerY + 26);

    // Status Badge
    const badgeW = 48;
    const badgeH = 11;
    const badgeX = RIGHT_EDGE - 6 - badgeW;
    const badgeY = headerY + 10;
    doc.setFillColor(...EMERALD);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PAID / SUCCESSFUL', badgeX + badgeW / 2, badgeY + badgeH / 2 + 1, { align: 'center' });

    Y = headerY + headerH + 5;

    // ================================================================
    // 3. RECEIPT DETAILS BAR
    // ================================================================
    Y = ensureSpace(Y, 22);
    const rdY = Y;
    doc.setFillColor(...SLATE_50);
    doc.setDrawColor(...SLATE_200);
    doc.roundedRect(MARGIN_LEFT, rdY, CONTENT_W, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_800);
    doc.text('RECEIPT DETAILS', MARGIN_LEFT + 5, rdY + 5.5);

    // Key-value pairs
    const rdPairs = [
      ['Receipt No:', receiptNo],
      ['Transaction ID:', txnId],
      ['Payment Date:', paymentDate],
      ['Payment Status:', '100% CLEARED'],
    ];

    doc.setFontSize(7.5);
    const rdStartY = rdY + 10;
    const rdColW = CONTENT_W / 2;

    rdPairs.forEach((pair, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN_LEFT + 5 + col * rdColW;
      const y = rdStartY + row * 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_500);
      doc.text(pair[0], x, y);

      doc.setFont('helvetica', 'bold');
      if (pair[0] === 'Payment Status:') {
        doc.setTextColor(...EMERALD);
      } else {
        doc.setTextColor(...DARK_TEXT);
      }
      doc.text(pair[1], x + 30, y);
    });

    Y = rdY + 18 + 5;

    // ================================================================
    // 4. CITIZEN & PROPERTY IDENTIFICATION
    // ================================================================
    Y = ensureSpace(Y, 36);
    const cpY = Y;
    const cpH = 36;
    doc.setFillColor(...SLATE_100);
    doc.setDrawColor(...SLATE_200);
    doc.roundedRect(MARGIN_LEFT, cpY, CONTENT_W, cpH, 2, 2, 'FD');

    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CITIZEN & PROPERTY IDENTIFICATION', MARGIN_LEFT + 5, cpY + 6);

    const cpFields = [
      // [label, value, column (0=left, 1=right)]
      ['Citizen Name:', citizenName, 0],
      ['Municipality:', municipality, 1],
      ['Property ID:', propertyId, 0],
      ['Assessment Year:', assessmentYear, 1],
      ['Ward / Zone:', ward, 0],
      ['Compliance Risk:', complianceRisk, 1],
    ];

    const cpLabelW = 30;
    const cpCol0X = MARGIN_LEFT + 5;
    const cpCol1X = MARGIN_LEFT + 5 + CONTENT_W / 2;
    let cpRowY = cpY + 13;

    for (let i = 0; i < cpFields.length; i += 2) {
      const leftField = cpFields[i];
      const rightField = cpFields[i + 1];

      // Left column label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text(leftField[0], cpCol0X, cpRowY);

      // Left column value
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text(leftField[1], cpCol0X + cpLabelW, cpRowY);

      if (rightField) {
        // Right column label
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...SLATE_500);
        doc.text(rightField[0], cpCol1X, cpRowY);

        // Right column value
        doc.setFont('helvetica', 'bold');
        if (rightField[0] === 'Compliance Risk:' && complianceRisk.toLowerCase().includes('low')) {
          doc.setTextColor(...EMERALD);
        } else {
          doc.setTextColor(...DARK_TEXT);
        }
        doc.text(rightField[1], cpCol1X + cpLabelW + 3, cpRowY);
      }

      cpRowY += 6;
    }

    Y = cpY + cpH + 5;

    // ================================================================
    // 5. PAYMENT DETAILS TABLE
    // ================================================================
    Y = ensureSpace(Y, 50);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK_TEXT);
    doc.text('PAYMENT DETAILS', MARGIN_LEFT + 5, Y);
    Y += 4;

    // Column definitions: [label, x, width, align]
    const COL_DESC_X = MARGIN_LEFT;
    const COL_DESC_W = 66;
    const COL_PERIOD_X = COL_DESC_X + COL_DESC_W;
    const COL_PERIOD_W = 34;
    const COL_METHOD_X = COL_PERIOD_X + COL_PERIOD_W;
    const COL_METHOD_W = 42;
    const COL_AMOUNT_X = COL_METHOD_X + COL_METHOD_W;
    const COL_AMOUNT_W = CONTENT_W - COL_DESC_W - COL_PERIOD_W - COL_METHOD_W;

    // Table header
    const thY = Y;
    const thH = 8;
    doc.setFillColor(...SLATE_800);
    doc.rect(MARGIN_LEFT, thY, CONTENT_W, thH, 'F');

    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DESCRIPTION / ITEM', COL_DESC_X + 3, thY + 5.5);
    doc.text('PERIOD', COL_PERIOD_X + 3, thY + 5.5);
    doc.text('PAYMENT METHOD', COL_METHOD_X + 3, thY + 5.5);
    doc.text('AMOUNT (INR)', RIGHT_EDGE - 3, thY + 5.5, { align: 'right' });

    Y = thY + thH;

    // Table rows data
    const tableRows = [
      {
        desc: taxType,
        period: 'FY 2025-26',
        method: paymentMethod,
        amount: fmtINR(amountPaid),
        descBold: true,
        amountBold: true,
        bgColor: WHITE,
      },
      {
        desc: 'Early-Bird Digital Rebate (5% Incentive)',
        period: 'Applied',
        method: 'CivTax Gateway',
        amount: 'INR 0 (Included)',
        descColor: EMERALD,
        bgColor: SLATE_50,
      },
      {
        desc: 'Late Payment Penalty / Interest Arrears',
        period: 'N/A',
        method: 'Cleared',
        amount: 'INR 0',
        bgColor: WHITE,
      },
    ];

    // Render table rows
    tableRows.forEach((row) => {
      // Calculate row height based on wrapped text
      doc.setFontSize(7.5);
      doc.setFont('helvetica', row.descBold ? 'bold' : 'normal');
      const descLines = doc.splitTextToSize(row.desc, COL_DESC_W - 6);
      const methodLines = doc.splitTextToSize(row.method, COL_METHOD_W - 6);
      const maxLines = Math.max(descLines.length, methodLines.length, 1);
      const lineH = 4;
      const cellPadding = 3;
      const rowH = Math.max(8, maxLines * lineH + cellPadding * 2);

      Y = ensureSpace(Y, rowH + 1);

      // Row background
      doc.setFillColor(...row.bgColor);
      doc.rect(MARGIN_LEFT, Y, CONTENT_W, rowH, 'F');

      // Row bottom border
      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, Y + rowH, RIGHT_EDGE, Y + rowH);

      const textY = Y + cellPadding + 3;

      // Description
      doc.setFont('helvetica', row.descBold ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...(row.descColor || DARK_TEXT));
      descLines.forEach((line, i) => {
        doc.text(line, COL_DESC_X + 3, textY + i * lineH);
      });

      // Period
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_700);
      doc.text(row.period, COL_PERIOD_X + 3, textY);

      // Method (wrapped)
      methodLines.forEach((line, i) => {
        doc.text(line, COL_METHOD_X + 3, textY + i * lineH);
      });

      // Amount (right-aligned)
      doc.setFont('helvetica', row.amountBold ? 'bold' : 'normal');
      doc.setTextColor(...DARK_TEXT);
      doc.text(row.amount, RIGHT_EDGE - 3, textY, { align: 'right' });

      Y += rowH;
    });

    Y += 4;

    // ================================================================
    // 6. TOTAL AMOUNT HIGHLIGHT BOX
    // ================================================================
    Y = ensureSpace(Y, 16);
    const totY = Y;
    const totH = 14;
    doc.setFillColor(...EMERALD_BG);
    doc.setDrawColor(...EMERALD);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN_LEFT, totY, CONTENT_W, totH, 2, 2, 'FD');

    doc.setTextColor(...EMERALD_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('TOTAL AMOUNT PAID & CLEARED:', MARGIN_LEFT + 6, totY + 9);

    doc.setTextColor(...EMERALD_LIGHT);
    doc.setFontSize(13);
    doc.text(fmtINR(amountPaid), RIGHT_EDGE - 6, totY + 9.5, { align: 'right' });

    Y = totY + totH + 6;

    // ================================================================
    // 7. CIVIC CREDIT SCORE & CITIZEN IMPACT
    // ================================================================
    Y = ensureSpace(Y, 32);
    const csY = Y;
    const csH = 30;
    doc.setFillColor(...AMBER_BG);
    doc.setDrawColor(...AMBER_BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN_LEFT, csY, CONTENT_W, csH, 2, 2, 'FD');

    doc.setTextColor(...AMBER_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CIVIC CREDIT SCORE & MODEL CITIZEN IMPACT', MARGIN_LEFT + 5, csY + 7);

    doc.setFontSize(7.5);
    doc.setTextColor(...AMBER_DARKER);
    doc.setFont('helvetica', 'normal');

    const civicLines = [
      `Civic Credit Score: ${civicScore} Points  -  ${tier}`,
      `On-Time Compliance Streak: ${streak} Month${streak !== 1 ? 's' : ''} Consecutive`,
      `Rewards Earned: +${xp} XP`,
      'Ward Ranking Impact: Contribution recorded',
    ];

    civicLines.forEach((line, i) => {
      doc.text('  ' + line, MARGIN_LEFT + 5, csY + 13.5 + i * 5);
    });

    Y = csY + csH + 6;

    // ================================================================
    // 8. DIGITAL RECEIPT VERIFICATION
    // ================================================================
    Y = ensureSpace(Y, 22);
    const vrY = Y;
    const vrH = 18;
    doc.setFillColor(...SLATE_50);
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_LEFT, vrY, CONTENT_W, vrH, 2, 2, 'FD');

    doc.setTextColor(...SLATE_700);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DIGITAL RECEIPT VERIFICATION', MARGIN_LEFT + 5, vrY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SLATE_500);

    // Generate a deterministic-looking hash from receipt data
    const hashSource = receiptNo + txnId + String(amountPaid);
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const ch = hashSource.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    const verificationHash = '0x' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');

    doc.text(`Verification Hash: ${verificationHash}`, MARGIN_LEFT + 5, vrY + 11.5);
    doc.text('Verified via CivTax AI - Digital Municipal Receipt', MARGIN_LEFT + 5, vrY + 15.5);

    Y = vrY + vrH + 6;

    // ================================================================
    // 9. FOOTER
    // ================================================================
    Y = ensureSpace(Y, 36);
    Y = drawSeparator(Y, GOLD);
    Y += 4;

    doc.setTextColor(...SLATE_800);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Thank you for making your municipal tax payment on time.', PAGE_W / 2, Y, { align: 'center' });
    Y += 5;

    doc.setTextColor(...SLATE_500);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text('Every payment you make builds a stronger, smarter city.', PAGE_W / 2, Y, { align: 'center' });
    Y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE_400);
    doc.text(
      'This is a computer-generated receipt and does not require a physical signature.',
      PAGE_W / 2, Y, { align: 'center' }
    );
    Y += 4;

    doc.text(
      'Telangana Municipal Corporation  |  Smart Governance & Citizen Tax Portal',
      PAGE_W / 2, Y, { align: 'center' }
    );
    Y += 6;

    // Bottom gold bar
    doc.setFillColor(...GOLD);
    doc.rect(0, PAGE_H - 5, PAGE_W, 5, 'F');

    // ================================================================
    // 10. GENERATE & DOWNLOAD
    // ================================================================
    const cleanTaxType = (taxType || 'PropertyTax').replace(/[^a-zA-Z0-9]/g, '');
    const cleanTxnId = (txnId || receiptNo || 'UNKNOWN').replace(/[^a-zA-Z0-9-]/g, '');
    const fileName = `CivTax_${cleanTaxType}_Receipt_${cleanTxnId}.pdf`;

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up Object URL after download
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.error('Error generating PDF receipt:', err);
    alert('Failed to generate PDF receipt. Please check your browser settings.');
    return false;
  }
}
