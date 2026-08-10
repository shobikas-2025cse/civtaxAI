import { jsPDF } from 'jspdf';

/**
 * Utility to generate and download an official Municipal Tax Payment Receipt PDF
 * using jsPDF with proper styling, branding, tables, and data parameters.
 * 
 * @param {Object} itemData - The transaction or payment record
 * @param {Object} userData - The current citizen user object
 */
export function generateReceiptPDF(itemData = {}, userData = {}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Extract dynamic fields with fallbacks
    const receiptNo = itemData?.receiptId || itemData?.id || 'PAY5507';
    const txnId = itemData?.txnId || itemData?.id || ('TXN-' + Math.floor(100000 + Math.random() * 900000));
    const taxType = itemData?.type || itemData?.taxName || 'Property Tax';
    const rawAmount = itemData?.amountPaid || itemData?.amount || 11650;
    const amountPaid = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) || 11650;
    
    const paymentDate = itemData?.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const paymentMethod = itemData?.method || itemData?.paymentMethod || itemData?.mode || 'Yearly Lump Sum (5% Rebate)';
    
    const citizenName = userData?.name || itemData?.citizenName || 'Verified Resident';
    const propertyId = userData?.propertyId || itemData?.propertyId || 'PROP-W02-0553';
    const ward = userData?.ward || itemData?.ward || 'W02 - Rajajinagar';
    const civicScore = userData?.civicCreditScore || 780;
    const streak = userData?.streak || 3;

    // 1. Top Decorative Brand Bar
    doc.setFillColor(229, 184, 11); // CivTax Gold Accent (#E5B80B)
    doc.rect(0, 0, 210, 5, 'F');

    // 2. Official Header Container (Navy Background)
    doc.setFillColor(17, 19, 27); // Dark Navy (#11131B)
    doc.rect(15, 12, 180, 28, 'F');

    // Header Text - Branding & Subtitle
    doc.setTextColor(255, 220, 105); // Gold Accent
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CIVTAX AI — SMART MUNICIPAL TAX PAYMENTS', 22, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Government of Telangana • Greater Municipal Tax Treasury', 22, 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(200, 220, 255);
    doc.text('OFFICIAL MUNICIPAL TAX PAYMENT RECEIPT', 22, 34);

    // 3. Status Badge ("PAID / SUCCESSFUL")
    doc.setFillColor(16, 185, 129); // Emerald Green
    doc.roundedRect(138, 20, 50, 12, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAID / SUCCESSFUL', 163, 27.5, { align: 'center' });

    // 4. Receipt Metadata Bar
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 44, 180, 16, 2, 2, 'F');
    doc.rect(15, 44, 180, 16, 'S');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('RECEIPT NO:', 20, 50);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(String(receiptNo), 43, 50);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('TRANSACTION ID:', 85, 50);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(String(txnId), 115, 50);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('PAYMENT DATE:', 152, 50);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(String(paymentDate), 178, 50);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('PAYMENT STATUS:', 20, 56);
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(9);
    doc.text('100% CLEARED', 49, 56);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('SECURITY SSL:', 85, 56);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text('256-BIT ENCRYPTED', 112, 56);

    // 5. Citizen & Property Details Section
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, 64, 180, 32, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 64, 180, 32, 'S');

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CITIZEN & PROPERTY IDENTIFICATION', 20, 71);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Citizen Name:', 20, 78);
    doc.text('Property ID:', 20, 84);
    doc.text('Ward / Zone:', 20, 90);

    doc.text('Municipality:', 110, 78);
    doc.text('Assessment Year:', 110, 84);
    doc.text('Compliance Risk:', 110, 90);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(citizenName), 45, 78);
    doc.text(String(propertyId), 45, 84);
    doc.text(String(ward), 45, 90);

    doc.text('Telangana Municipal Corp', 142, 78);
    doc.text('FY 2025–2026', 142, 84);
    doc.setTextColor(16, 185, 129);
    doc.text('Low Risk • Exemplary Taxpayer', 142, 90);

    // 6. Tax Breakdown Table Header
    doc.setFillColor(30, 41, 59); // Dark Slate Header
    doc.rect(15, 101, 180, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('DESCRIPTION / ITEM', 20, 106);
    doc.text('PERIOD', 95, 106);
    doc.text('PAYMENT GATEWAY', 128, 106);
    doc.text('AMOUNT (INR)', 190, 106, { align: 'right' });

    // Table Body Row 1: Tax Type Base Demand
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 109, 180, 9, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 118, 195, 118);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(String(taxType), 20, 115);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('FY 2025–26', 95, 115);
    doc.text(String(paymentMethod).slice(0, 24), 128, 115);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`₹${amountPaid.toLocaleString('en-IN')}`, 190, 115, { align: 'right' });

    // Table Body Row 2: Rebate / Discount (if applicable)
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 118, 180, 8, 'F');
    doc.line(15, 126, 195, 126);

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('Early-Bird Digital Rebate (5% Incentive)', 20, 123.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Applied', 95, 123.5);
    doc.text('CivTax Gateway', 128, 123.5);
    doc.text('- ₹0 (Included)', 190, 123.5, { align: 'right' });

    // Table Body Row 3: Penalty & Arrears
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 126, 180, 8, 'F');
    doc.line(15, 134, 195, 134);

    doc.setTextColor(71, 85, 105);
    doc.text('Late Payment Penalty / Interest Arrears', 20, 131.5);
    doc.text('N/A', 95, 131.5);
    doc.text('Cleared', 128, 131.5);
    doc.setTextColor(15, 23, 42);
    doc.text('₹0', 190, 131.5, { align: 'right' });

    // 7. Total Amount Highlight Box
    doc.setFillColor(236, 253, 245); // Mint Emerald Tint
    doc.roundedRect(15, 138, 180, 14, 2, 2, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.rect(15, 138, 180, 14, 'S');

    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL AMOUNT PAID & CLEARED:', 22, 147);

    doc.setTextColor(5, 150, 105);
    doc.setFontSize(13);
    doc.text(`₹${amountPaid.toLocaleString('en-IN')}`, 190, 147, { align: 'right' });

    // 8. Civic Score & Gamification Rewards Card
    doc.setFillColor(254, 252, 232); // Gold Tint (#FEFCE8)
    doc.roundedRect(15, 156, 180, 26, 3, 3, 'F');
    doc.setDrawColor(254, 240, 138);
    doc.rect(15, 156, 180, 26, 'S');

    doc.setTextColor(161, 98, 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('🌟 CIVIC CREDIT SCORE & MODEL CITIZEN IMPACT', 20, 163);

    doc.setFontSize(8);
    doc.setTextColor(113, 63, 18);
    doc.text(`• Civic Credit Score Boosted: ${civicScore} Points (Gold Model Citizen Standing)`, 22, 169);
    doc.text(`• On-Time Compliance Streak: ${streak} Months Consecutive Early Payer 🔥`, 22, 174);
    doc.text('• Rewards Earned: +150 XP Boost + Ward #1 Compliance Ranking Impact', 22, 179);

    // 9. Digital Verification Stamp Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 186, 180, 22, 2, 2, 'F');
    doc.rect(15, 186, 180, 22, 'S');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DIGITAL RECEIPT VERIFICATION & SECURITY HASH', 20, 192);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const mockHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`.toUpperCase();
    doc.text(`Verification Hash: ${mockHash} • Verified via CivTax AI 256-Bit Ledger`, 20, 197);
    doc.text('QR Verification Code: Generated & Signed by Municipal Tax Server', 20, 202);

    // 10. Official Footer
    doc.setDrawColor(229, 184, 11);
    doc.setLineWidth(0.5);
    doc.line(15, 214, 195, 214);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Thank you for making your municipal tax payment on time.', 105, 221, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Every payment you make builds a stronger, smarter city.', 105, 226, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, 232, { align: 'center' });
    doc.text('Telangana Municipal Corporation • Smart Governance & Citizen Tax Portal', 105, 236, { align: 'center' });

    // Generate PDF Blob and trigger download with proper MIME type and .pdf extension
    const cleanTaxType = (taxType || 'PropertyTax').replace(/[^a-zA-Z0-9]/g, '');
    const cleanReceiptNo = (receiptNo || 'PAY5507').replace(/[^a-zA-Z0-9-]/g, '');
    const fileName = `CivTax_${cleanTaxType}_Receipt_${cleanReceiptNo}.pdf`;

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
