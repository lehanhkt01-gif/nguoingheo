import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const EA_SUP_VILLAGES = [
  "Thôn 1", "Thôn 2", "Thôn 3", "Thôn 4", "Thôn 5",
  "Thôn 6", "Thôn 7", "Thôn 8", "Thôn 9", "Thôn 10",
  "Thôn 11", "Thôn 12", "Thôn 13", "Thôn 14", "Thôn 15",
  "Thôn 16", "Thôn 17", "Buôn A2", "Buôn Drai", "Buôn Cổng"
];

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu cho Quỹ Vì Người Nghèo xã Ea Súp...");

  // 1. Xóa dữ liệu cũ để chuẩn hóa
  await prisma.donation.deleteMany({});
  await prisma.disbursement.deleteMany({});
  await prisma.campaign.deleteMany({});

  // 2. Khởi tạo 2 Chiến dịch trọng điểm
  console.log("📦 Đang tạo 2 chiến dịch an sinh xã hội...");
  const campaignNha = await prisma.campaign.create({
    data: {
      title: "Xây dựng Nhà Đại đoàn kết cho hộ nghèo khó khăn về nhà ở",
      targetAmount: 200000000,
      currentAmount: 85500000,
      status: "ACTIVE",
      description: "Xóa nhà tạm dột nát cho các hộ đồng bào và gia đình neo đơn có hoàn cảnh đặc biệt khó khăn tại 20 thôn buôn.",
    },
  });

  const campaignBo = await prisma.campaign.create({
    data: {
      title: "Trao tặng Bò giống sinh kế giúp đồng bào thoát nghèo bền vững",
      targetAmount: 100000000,
      currentAmount: 42000000,
      status: "ACTIVE",
      description: "Hỗ trợ bò cái sinh sản giống địa phương cho các hộ nghèo chí thú làm ăn nhưng thiếu vốn sản xuất trên địa bàn xã Ea Súp.",
    },
  });

  // 3. Khởi tạo 5 Khoản ủng hộ mẫu qua BIDV 8630100930
  console.log("💳 Đang tạo 5 khoản ủng hộ từ nhà hảo tâm...");
  await prisma.donation.createMany({
    data: [
      {
        transactionId: "BIDV_FT262391001",
        donorName: "Đoàn Hoàng Phúc",
        amount: 15000000,
        description: "VNN NDDK UNG HO XAY NHA DAI DOAN KET",
        transactionDate: new Date("2026-09-10T08:30:00Z"),
        status: "COMPLETED",
        campaignId: campaignNha.id,
      },
      {
        transactionId: "BIDV_FT262391002",
        donorName: "Nguyễn Thị Mai",
        amount: 5000000,
        description: "VNN SK UNG HO BO GIONG SINH KE",
        transactionDate: new Date("2026-09-11T09:15:00Z"),
        status: "COMPLETED",
        campaignId: campaignBo.id,
      },
      {
        transactionId: "BIDV_FT262391003",
        donorName: "Công ty Cổ phần Ea Súp Xanh",
        amount: 50000000,
        description: "CONG TY EA SUP XANH UNG HO QUY VI NGUOI NGHEO",
        transactionDate: new Date("2026-09-11T14:20:00Z"),
        status: "COMPLETED",
        campaignId: campaignNha.id,
      },
      {
        transactionId: "BIDV_FT262391004",
        donorName: "Lê Văn Tám (Kiều bào Úc)",
        amount: 10000000,
        description: "KIEU BAO UC UNG HO HO NGHEO BUON DRAI",
        transactionDate: new Date("2026-09-12T10:00:00Z"),
        status: "COMPLETED",
        campaignId: campaignNha.id,
      },
      {
        transactionId: "BIDV_FT262391005",
        donorName: "Trần Minh Tú",
        amount: 2000000,
        description: "VNN UNG HO BA CON KHO KHAN",
        transactionDate: new Date("2026-09-13T16:45:00Z"),
        status: "COMPLETED",
      },
    ],
  });

  // 4. Khởi tạo các Đợt giải ngân hỗ trợ thực tế
  console.log("🤝 Đang tạo các đợt giải ngân an sinh xã hội...");
  await prisma.disbursement.createMany({
    data: [
      {
        recipientName: "Bà Y Thị",
        village: "Buôn Drai",
        amount: 8000000,
        proofImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        notes: "Hỗ trợ xây nhà Đại đoàn kết đợt 1 (khởi công đổ móng nhà kiên cố)",
        date: new Date("2026-09-08T09:00:00Z"),
      },
      {
        recipientName: "Hộ Triệu Văn Dũng",
        village: "Thôn 14",
        amount: 5000000,
        proofImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        notes: "Trao tặng bò giống cái sinh sản sinh kế thoát nghèo",
        date: new Date("2026-09-09T14:30:00Z"),
      },
      {
        recipientName: "Hộ H'Ngoan H'Đơk",
        village: "Buôn Cổng",
        amount: 5000000,
        proofImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        notes: "Hỗ trợ sửa chữa nhà tranh dột nát trước mùa mưa bão",
        date: new Date("2026-09-10T10:15:00Z"),
      },
    ],
  });

  console.log("✅ Hoàn tất nạp dữ liệu mẫu thành công!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khởi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
