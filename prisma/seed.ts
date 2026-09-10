import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const EA_SUP_VILLAGES = [
  "Thôn 1", "Thôn 2", "Thôn 3", "Thôn 4", "Thôn 5", 
  "Thôn 6", "Thôn 7", "Thôn 8", "Thôn 9", "Thôn 10", 
  "Thôn 11", "Thôn 12", "Thôn 13", "Thôn 14", "Thôn 15", 
  "Thôn 16", "Thôn 17", "Buôn A2", "Buôn Drai", "Buôn Cổng"
];

async function main() {
  console.log("🌱 Khởi tạo dữ liệu nền tảng Quỹ vì người nghèo xã Ea Súp...");

  // 1. Cấu hình hệ thống mặc định
  const settings = [
    { key: "BIDV_ACCOUNT_NUMBER", value: "8630100930", description: "Số tài khoản tiếp nhận BIDV duy nhất" },
    { key: "BIDV_ACCOUNT_NAME", value: "UY BAN MTTQ VN XA EA SUP", description: "Tên chủ tài khoản" },
    { key: "BIDV_BIN", value: "970418", description: "Mã định danh ngân hàng NAPAS BIDV" },
    { key: "CASSO_SECURE_TOKEN", value: "EaSup_Charity_2026_Secure_Token_Secret", description: "Token bảo mật Casso Webhook" },
    { key: "GEMINI_SYSTEM_PROMPT", value: "Bạn là Trợ lý AI 'Gem Mặt Trận Ea Súp', đại diện Ban Vận động Quỹ Vì Người Nghèo xã Ea Súp. Hỗ trợ tra cứu sao kê STK BIDV 8630100930 minh bạch 100%.", description: "Prompt mẫu cho trợ lý AI" },
    { key: "NOTIFICATION_EMAILS", value: "danguy.easup@gmail.com,ubnd.easup@gmail.com,mttq.easup@gmail.com", description: "Danh sách email nhận báo cáo tự động" }
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Tài khoản quản trị & cán bộ (Mật khẩu mẫu mặc định: EaSup@2026)
  const users = [
    {
      username: "lehonghanh",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // SHA-256 mẫu
      fullName: "Lê Hồng Hạnh",
      role: "ADMIN",
      email: "lehonghanh.mttq@easupso.com",
      phone: "0914000001",
    },
    {
      username: "nguyenbaban",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      fullName: "Nguyễn Bá Bân",
      role: "ADMIN",
      email: "nguyenbaban.ubnd@easupso.com",
      phone: "0914000002",
    },
    {
      username: "ketoan_mttq",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      fullName: "Nguyễn Thị Miên",
      role: "ACCOUNTANT",
      email: "nguyenthimien@easupso.com",
      phone: "0914000003",
    },
    {
      username: "ctmt_buondrai",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      fullName: "Y Krô Bkrông",
      role: "MONITOR",
      village: "Buôn Drai",
      email: "ykro.buondrai@easupso.com",
      phone: "0987123456",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { fullName: u.fullName, role: u.role },
      create: u,
    });
  }

  // 3. Danh mục Chiến dịch mẫu ("Nơi gieo hy vọng")
  const campaigns = [
    {
      code: "NDDK01",
      slug: "xay-nha-dai-doan-ket-ho-y-thi-buon-drai",
      title: "Hỗ trợ Xây nhà Đại đoàn kết cho hộ bà Y Thị - Buôn Drai",
      description: "Gia đình bà Y Thị thuộc diện đặc biệt khó khăn tại Buôn Drai, căn nhà tranh vách nứa dột nát sau mùa mưa bão Tây Nguyên. Quỹ trích 8 triệu đồng từ nguồn xã phối hợp cùng nguồn vốn đối ứng và bà con dân làng dựng nhà kiên cố.",
      beneficiaryName: "Bà Y Thị",
      village: "Buôn Drai",
      targetAmount: 80000000,
      currentAmount: 48500000,
      category: "NHA_DAI_DOAN_KET",
      status: "ACTIVE",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
      proofUrls: [
        "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
      ]
    },
    {
      code: "NDDK02",
      slug: "xay-nha-dai-doan-ket-ho-ong-nguyen-van-sang-thon-5",
      title: "Hỗ trợ Xây nhà Đại đoàn kết hộ ông Nguyễn Văn Sáng - Thôn 5",
      description: "Hộ ông Nguyễn Văn Sáng là hộ nghèo nhiều năm liền, neo đơn bệnh tật. Ban Vận động Quỹ vận động hỗ trợ xóa nhà tạm dột nát, trao tặng mái ấm an cư lạc nghiệp.",
      beneficiaryName: "Ông Nguyễn Văn Sáng",
      village: "Thôn 5",
      targetAmount: 60000000,
      currentAmount: 60000000,
      category: "NHA_DAI_DOAN_KET",
      status: "COMPLETED",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
      proofUrls: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80"
      ]
    },
    {
      code: "SK01",
      slug: "ho-tro-bo-giong-sinh-ke-thon-12",
      title: "Trao tặng Bò giống sinh kế cho 10 hộ nghèo - Thôn 12 & Thôn 14",
      description: "Chương trình trao cần câu cơm, hỗ trợ bò cái sinh sản giống địa phương giúp các gia đình có tư liệu sản xuất, từng bước vươn lên thoát nghèo bền vững.",
      beneficiaryName: "10 Hộ nghèo Thôn 12 & 14",
      village: "Thôn 12",
      targetAmount: 50000000,
      currentAmount: 32000000,
      category: "SINH_KE",
      status: "ACTIVE",
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80",
      proofUrls: []
    },
    {
      code: "TET2026",
      slug: "qua-tet-binh-ngo-vi-nguoi-ngheo-ea-sup",
      title: "Chương trình 'Tết Bính Ngọ vì người nghèo' - 20 Thôn Buôn",
      description: "Trao tặng 500 suất quà Tết (gồm gạo, bánh mứt, nhu yếu phẩm và tiền mặt 500.000đ/suất) cho toàn bộ hộ nghèo, gia đình chính sách khó khăn tại 20 thôn buôn xã Ea Súp.",
      beneficiaryName: "500 Hộ nghèo 20 thôn buôn",
      village: "Toàn xã Ea Súp",
      targetAmount: 250000000,
      currentAmount: 185500000,
      category: "TET",
      status: "ACTIVE",
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
      proofUrls: []
    },
    {
      code: "CT01",
      slug: "cuu-tro-dot-xuat-em-h-hen-buon-a2",
      title: "Hỗ trợ phẫu thuật tim đột xuất cho em H'Hên Mlô - Buôn A2",
      description: "Cháu H'Hên 7 tuổi mắc bệnh tim bẩm sinh cần can thiệp phẫu thuật gấp tại Bệnh viện Nhi đồng, gia đình thuộc diện hộ nghèo không có khả năng chi trả viện phí.",
      beneficiaryName: "Cháu H'Hên Mlô",
      village: "Buôn A2",
      targetAmount: 25000000,
      currentAmount: 25000000,
      category: "CUU_TRO",
      status: "COMPLETED",
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
      proofUrls: [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80"
      ]
    }
  ];

  for (const c of campaigns) {
    await prisma.campaign.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // 4. File Báo cáo - Văn bản pháp lý Scan mộc đỏ
  const documents = [
    {
      title: "Quyết định số 13/QĐ-MTTQ-BTT ban hành Quy chế vận động, quản lý và sử dụng Quỹ 'Vì người nghèo' xã Ea Súp",
      docNumber: "13/QĐ-MTTQ-BTT",
      category: "QUYET_DINH",
      issuer: "Ban Thường trực UBMTTQ Việt Nam xã Ea Súp",
      signer: "Chủ tịch Lê Hồng Hạnh",
      issueDate: new Date("2026-01-14"),
      fileUrl: "/docs/QD-13-MTTQ-Quy-che-Quy-Vi-Nguoi-Ngheo.pdf",
      fileSize: "2.4 MB",
      summary: "Quy định rõ ràng tôn chỉ minh bạch, tài khoản tiếp nhận duy nhất BIDV 8630100930 và quy trình giám sát thu chi dân chủ tại 20 thôn buôn."
    },
    {
      title: "Quyết định số 12/QĐ-MTTQ-BTT thành lập Ban Vận động Quỹ 'Vì người nghèo' và Quỹ Cứu trợ xã Ea Súp",
      docNumber: "12/QĐ-MTTQ-BTT",
      category: "QUYET_DINH",
      issuer: "Ban Thường trực UBMTTQ Việt Nam xã Ea Súp",
      signer: "Chủ tịch Lê Hồng Hạnh",
      issueDate: new Date("2026-01-14"),
      fileUrl: "/docs/QD-12-MTTQ-Thanh-lap-Ban-Van-dong.pdf",
      fileSize: "1.8 MB",
      summary: "Kiện toàn Ban Vận động gồm Trưởng ban Lê Hồng Hạnh, Phó ban Nguyễn Bá Bân, Phó ban thường trực Nguyễn Thị Miên và 20 Trưởng ban CTMT thôn buôn."
    },
    {
      title: "Báo cáo công khai tài chính Quỹ 'Vì người nghèo' Quý I/2026 (Theo NĐ 30/2020/NĐ-CP)",
      docNumber: "08/BC-BVĐ",
      category: "BAO_CAO",
      issuer: "Ban Vận động Quỹ Vì Người Nghèo xã Ea Súp",
      signer: "Trưởng ban Lê Hồng Hạnh",
      issueDate: new Date("2026-03-31"),
      fileUrl: "/docs/BC-08-Thu-Chi-Quy-I-2026.pdf",
      fileSize: "3.1 MB",
      summary: "Tổng hợp toàn bộ thu chi từ 01/01/2026 đến 31/03/2026, đối soát 100% khớp lệnh với sao kê BIDV 8630100930."
    }
  ];

  for (const doc of documents) {
    const existing = await prisma.scanDocument.findFirst({ where: { docNumber: doc.docNumber } });
    if (!existing) {
      await prisma.scanDocument.create({ data: doc });
    }
  }

  // 5. Giao dịch mẫu minh chứng đối soát tài khoản BIDV 8630100930
  const sampleTransactions = [
    {
      cassoId: BigInt(102458),
      reference: "BIDV_FT262391001",
      type: "IN",
      amount: 5000000,
      runningBalance: 326000000,
      description: "VNN NDDK01 CONG TY CP CAO SU DAK LAK UNG HO NHA DAI DOAN KET",
      transactionDateTime: new Date("2026-09-10T09:15:00Z"),
      accountNumber: "8630100930",
      bankName: "BIDV",
      bankAbbreviation: "BIDV",
      donorName: "Công ty CP Cao Su Đắk Lắk",
      campaignCode: "NDDK01",
      isAnonymous: false,
    },
    {
      cassoId: BigInt(102459),
      reference: "BIDV_FT262391002",
      type: "IN",
      amount: 1000000,
      runningBalance: 327000000,
      description: "VNN TET NGUYEN VAN AN UNG HO NGUOI NGHEO",
      transactionDateTime: new Date("2026-09-10T10:20:00Z"),
      accountNumber: "8630100930",
      bankName: "BIDV",
      bankAbbreviation: "BIDV",
      donorName: "Nguyễn Văn An",
      campaignCode: "TET2026",
      isAnonymous: false,
    },
    {
      cassoId: BigInt(102460),
      reference: "BIDV_FT262391003",
      type: "IN",
      amount: 500000,
      runningBalance: 327500000,
      description: "VNN CT MOT NHA HAO TAM AN DANH UNG HO PHAU THUAT TIM",
      transactionDateTime: new Date("2026-09-10T11:05:00Z"),
      accountNumber: "8630100930",
      bankName: "BIDV",
      bankAbbreviation: "BIDV",
      donorName: "Nhà hảo tâm ẩn danh",
      campaignCode: "CT01",
      isAnonymous: true,
    },
    {
      cassoId: BigInt(102461),
      reference: "BIDV_FT262391004",
      type: "OUT",
      amount: 8000000,
      runningBalance: 319500000,
      description: "CHI GIAI NGAN HO TRO XAY NHA DAI DOAN KET HO BA Y THI BUON DRAI DOT 1",
      transactionDateTime: new Date("2026-09-09T14:30:00Z"),
      accountNumber: "8630100930",
      bankName: "BIDV",
      bankAbbreviation: "BIDV",
      campaignCode: "NDDK01",
      receiptNumber: "PC-2026-0042",
      verifiedBy: "Lê Hồng Hạnh",
      proofUrls: [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80"
      ],
      note: "Phiếu chi số 42/PC kèm Hóa đơn VAT vật liệu xây dựng Xi măng Sông Gianh & Tôn Đông Á, Biên bản khởi công có xác nhận của Trưởng ban CTMT Buôn Drai."
    },
    {
      cassoId: BigInt(102462),
      reference: "BIDV_FT262391005",
      type: "OUT",
      amount: 25000000,
      runningBalance: 294500000,
      description: "CHI HO TRO CHI PHI MO TIM CAP CUU CHAU H HEN MLO BUON A2",
      transactionDateTime: new Date("2026-09-08T08:45:00Z"),
      accountNumber: "8630100930",
      bankName: "BIDV",
      bankAbbreviation: "BIDV",
      campaignCode: "CT01",
      receiptNumber: "PC-2026-0041",
      verifiedBy: "Lê Hồng Hạnh",
      proofUrls: [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80"
      ],
      note: "Biên nhận thanh toán tạm ứng viện phí Bệnh viện Nhi Đồng 2 kèm đơn đề nghị có xác nhận của UBND xã Ea Súp."
    }
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.upsert({
      where: { cassoId: tx.cassoId },
      update: tx,
      create: tx,
    });
  }

  console.log("✅ Khởi tạo dữ liệu thành công cho xã Ea Súp!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
