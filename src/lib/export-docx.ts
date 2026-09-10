import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
} from "docx";

export interface DocxReportData {
  reportNumber?: string;
  reportPeriod?: string;
  totalIn: number;
  totalOut: number;
  currentBalance: number;
  transactionCount: number;
  activeCampaignCount: number;
  reportDate?: Date;
  signerName?: string;
}

export async function generateNghiDinh30Report(data: DocxReportData): Promise<Buffer> {
  const date = data.reportDate || new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.5cm
              bottom: 1152, // 2.0cm
              left: 1728, // 3.0cm (chuẩn NĐ 30/2020/NĐ-CP)
              right: 1152, // 2.0cm
            },
          },
        },
        children: [
          // Header 2 cột chuẩn NĐ 30: Bên trái Cơ quan ban hành, Bên phải Quốc hiệu
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "UBMTTQ VIỆT NAM XÃ EA SÚP\n",
                            font: "Times New Roman",
                            size: 22, // 11pt
                            bold: false,
                          }),
                          new TextRun({
                            text: "BAN VẬN ĐỘNG QUỸ \"VÌ NGƯỜI NGHÈO\"\n",
                            font: "Times New Roman",
                            size: 22,
                            bold: true,
                          }),
                          new TextRun({
                            text: `Số: ${data.reportNumber || "15/BC-BVĐ"}`,
                            font: "Times New Roman",
                            size: 22,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n",
                            font: "Times New Roman",
                            size: 22,
                            bold: true,
                          }),
                          new TextRun({
                            text: "Độc lập - Tự do - Hạnh phúc\n",
                            font: "Times New Roman",
                            size: 24, // 12pt
                            bold: true,
                          }),
                          new TextRun({
                            text: `Ea Súp, ngày ${day} tháng ${month} năm ${year}`,
                            font: "Times New Roman",
                            size: 22,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // Tiêu đề báo cáo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "BÁO CÁO\n",
                font: "Times New Roman",
                size: 28, // 14pt
                bold: true,
              }),
              new TextRun({
                text: `Về việc công khai thu - chi, quản lý và sử dụng Quỹ "Vì người nghèo" xã Ea Súp\n(Kỳ báo cáo: ${data.reportPeriod || "Quý I/2026"})`,
                font: "Times New Roman",
                size: 26, // 13pt
                bold: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // Kính gửi
          new Paragraph({
            children: [
              new TextRun({
                text: "          Kính gửi: ",
                font: "Times New Roman",
                size: 24,
                bold: true,
              }),
              new TextRun({
                text: "- Thường trực Đảng ủy xã Ea Súp;\n                    - Thường trực HĐND, Lãnh đạo UBND xã Ea Súp;\n                    - Ban Thường trực UBMTTQ Việt Nam huyện;\n                    - Ban Công tác Mặt trận 20 thôn, buôn.",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // Căn cứ pháp lý
          new Paragraph({
            children: [
              new TextRun({
                text: "          Căn cứ Quyết định số 13/QĐ-MTTQ-BTT ngày 14/01/2026 của Ban Thường trực UBMTTQ Việt Nam xã Ea Súp về việc ban hành Quy chế vận động, quản lý và sử dụng Quỹ \"Vì người nghèo\" xã Ea Súp;\n",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
              new TextRun({
                text: "          Căn cứ Quyết định số 12/QĐ-MTTQ-BTT ngày 14/01/2026 về việc thành lập Ban Vận động Quỹ \"Vì người nghèo\", Quỹ Cứu trợ xã Ea Súp;\n",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
              new TextRun({
                text: "          Ban Vận động Quỹ \"Vì người nghèo\" xã Ea Súp báo cáo công khai toàn bộ số liệu thu, chi qua tài khoản tiếp nhận duy nhất số 8630100930 mở tại Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV) - Chi nhánh/PGD Ea Súp như sau:",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // Mục I: Số liệu tài chính
          new Paragraph({
            children: [
              new TextRun({
                text: "I. SỐ LIỆU TÀI CHÍNH THỜI GIAN THỰC (ĐỐI SOÁT QUA BIDV & CASSO)\n",
                font: "Times New Roman",
                size: 24,
                bold: true,
              }),
              new TextRun({
                text: `1. Tổng số tiền vận động tiếp nhận: ${data.totalIn.toLocaleString("vi-VN")} đồng.\n`,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: `2. Tổng số tiền đã giải ngân hỗ trợ nhân dân: ${data.totalOut.toLocaleString("vi-VN")} đồng.\n`,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: `3. Số dư khả dụng hiện có trong tài khoản BIDV 8630100930: ${data.currentBalance.toLocaleString("vi-VN")} đồng.\n`,
                font: "Times New Roman",
                size: 24,
                bold: true,
              }),
              new TextRun({
                text: `4. Tổng số lượt cá nhân, tổ chức, doanh nghiệp ủng hộ: ${data.transactionCount} lượt giao dịch.\n`,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: `5. Phạm vi triển khai: Phủ kín 20 thôn, buôn (17 thôn, 03 buôn) trên địa bàn xã Ea Súp.`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // Mục II: Đánh giá & Cam kết
          new Paragraph({
            children: [
              new TextRun({
                text: "II. CÔNG TÁC GIÁM SÁT DÂN CHỦ & MINH BẠCH 100%\n",
                font: "Times New Roman",
                size: 24,
                bold: true,
              }),
              new TextRun({
                text: "          Toàn bộ các khoản chi đều được giải ngân theo đúng định mức Quy chế số 13/QĐ-MTTQ-BTT (Hỗ trợ xây nhà Đại đoàn kết 8 triệu đồng/nhà từ nguồn xã; sửa chữa nhà 5 triệu đồng/nhà; sinh kế bò giống 5 triệu đồng/hộ; cứu trợ đột xuất 1-5 triệu đồng/ca). Các khoản chi đều có phiếu chi, hóa đơn tài chính và biên bản nghiệm thu bàn giao có chữ ký xác nhận của Ban Công tác Mặt trận khu dân cư.\n",
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: "          Mọi công dân và nhà hảo tâm đều có thể tra cứu sao kê trực tiếp 24/7 trên cổng thông tin: https://nguoingheo.easupso.com",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // Nơi nhận và Chữ ký chuẩn Nghị định 30
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Nơi nhận:\n",
                            font: "Times New Roman",
                            size: 20, // 10pt
                            bold: true,
                            italics: true,
                          }),
                          new TextRun({
                            text: "- Như Kính gửi;\n- Các đ/c Thường trực Đảng ủy (b/c);\n- Lưu: VT, BVĐ Quỹ.\n",
                            font: "Times New Roman",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "TM. BAN VẬN ĐỘNG\nTRƯỞNG BAN\nCHỦ TỊCH UBMTTQ XÃ\n\n\n\n",
                            font: "Times New Roman",
                            size: 22,
                            bold: true,
                          }),
                          new TextRun({
                            text: data.signerName || "Lê Hồng Hạnh",
                            font: "Times New Roman",
                            size: 24,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
