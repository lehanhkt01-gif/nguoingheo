import ExcelJS from "exceljs";

export interface TransactionExportRow {
  id: number;
  reference?: string | null;
  type: string;
  amount: number | string;
  runningBalance?: number | string | null;
  description: string;
  transactionDateTime: Date | string;
  campaignCode?: string | null;
  donorName?: string | null;
  receiptNumber?: string | null;
  note?: string | null;
}

export async function generateTransactionsExcel(
  rows: TransactionExportRow[],
  accountNumber: string = "8630100930",
  accountName: string = "UY BAN MTTQ VN XA EA SUP"
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UBMTTQ Việt Nam xã Ea Súp";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Sao Kê BIDV 8630100930", {
    views: [{ showGridLines: true }],
  });

  // 1. Tiêu đề hành chính
  worksheet.mergeCells("A1:I1");
  worksheet.getCell("A1").value = "ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM XÃ EA SÚP";
  worksheet.getCell("A1").font = { name: "Arial", size: 11, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells("A2:I2");
  worksheet.getCell("A2").value = "BAN VẬN ĐỘNG QUỸ 'VÌ NGƯỜI NGHÈO'";
  worksheet.getCell("A2").font = { name: "Arial", size: 11, bold: true };
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.mergeCells("A4:I4");
  worksheet.getCell("A4").value = "BẢNG KÊ MINH BẠCH DÒNG TIỀN THU - CHI TÀI KHOẢN TIẾP NHẬN DUY NHẤT";
  worksheet.getCell("A4").font = { name: "Arial", size: 14, bold: true, color: { argb: "FFB91C1C" } };
  worksheet.getCell("A4").alignment = { horizontal: "center" };

  worksheet.mergeCells("A5:I5");
  worksheet.getCell("A5").value = `Tài khoản: ${accountNumber} - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV Ea Súp) | Chủ TK: ${accountName}`;
  worksheet.getCell("A5").font = { name: "Arial", size: 11, italic: true };
  worksheet.getCell("A5").alignment = { horizontal: "center" };

  worksheet.mergeCells("A6:I6");
  worksheet.getCell("A6").value = `Thời điểm xuất báo cáo: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} | Nguồn dữ liệu ngân hàng đối soát tự động qua Casso`;
  worksheet.getCell("A6").font = { name: "Arial", size: 10, italic: true };
  worksheet.getCell("A6").alignment = { horizontal: "center" };

  // 2. Header bảng
  const headers = [
    "STT",
    "Thời gian",
    "Mã giao dịch (TID)",
    "Loại GD",
    "Số tiền (VNĐ)",
    "Số dư tài khoản (VNĐ)",
    "Nội dung chuyển khoản",
    "Mã chiến dịch",
    "Người gửi / Thụ hưởng & Chứng từ",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.values = headers;
  headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF991B1B" }, // Đỏ đô sang trọng
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 3. Đổ dữ liệu
  let currentBalance = 0;
  rows.forEach((r, idx) => {
    const rowNum = 9 + idx;
    const dataRow = worksheet.getRow(rowNum);
    const amountNum = Number(r.amount);
    const isIncome = r.type === "IN";

    dataRow.values = [
      idx + 1,
      new Date(r.transactionDateTime).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      r.reference || `TX-${r.id}`,
      isIncome ? "TIỀN VÀO (+)" : "TIỀN RA (-)",
      amountNum,
      r.runningBalance ? Number(r.runningBalance) : "",
      r.description,
      r.campaignCode || "Chung Quỹ xã",
      r.donorName || r.receiptNumber || "",
    ];

    dataRow.font = { name: "Arial", size: 10 };
    dataRow.alignment = { vertical: "middle" };

    // Căn lề từng cột
    dataRow.getCell(1).alignment = { horizontal: "center" };
    dataRow.getCell(2).alignment = { horizontal: "center" };
    dataRow.getCell(3).alignment = { horizontal: "center" };
    dataRow.getCell(4).alignment = { horizontal: "center" };
    dataRow.getCell(4).font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: isIncome ? "FF15803D" : "FFDC2626" },
    };

    dataRow.getCell(5).numFmt = '#,##0 "đ"';
    dataRow.getCell(5).font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: isIncome ? "FF15803D" : "FFDC2626" },
    };

    dataRow.getCell(6).numFmt = '#,##0 "đ"';
    dataRow.getCell(8).alignment = { horizontal: "center" };

    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // Tự động chỉnh độ rộng cột
  worksheet.columns = [
    { width: 8 },  // STT
    { width: 22 }, // Thời gian
    { width: 22 }, // Mã GD
    { width: 14 }, // Loại
    { width: 18 }, // Số tiền
    { width: 20 }, // Số dư
    { width: 45 }, // Nội dung
    { width: 15 }, // Mã chiến dịch
    { width: 30 }, // Thụ hưởng
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
