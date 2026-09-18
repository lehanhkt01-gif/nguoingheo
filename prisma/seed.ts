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

  // 2. Khởi tạo 2 Chiến dịch trọng điểm với số dư ban đầu 0 đ
  console.log("📦 Đang tạo 2 chiến dịch an sinh xã hội chuẩn...");
  await prisma.campaign.create({
    data: {
      title: "Xây dựng Nhà Đại đoàn kết cho hộ nghèo khó khăn về nhà ở",
      targetAmount: 200000000,
      currentAmount: 0,
      status: "ACTIVE",
      description: "Xóa nhà tạm dột nát cho các hộ đồng bào và gia đình neo đơn có hoàn cảnh đặc biệt khó khăn tại 20 thôn buôn.",
    },
  });

  await prisma.campaign.create({
    data: {
      title: "Trao tặng Bò giống sinh kế giúp đồng bào thoát nghèo bền vững",
      targetAmount: 100000000,
      currentAmount: 0,
      status: "ACTIVE",
      description: "Hỗ trợ bò cái sinh sản giống địa phương cho các hộ nghèo chí thú làm ăn nhưng thiếu vốn sản xuất trên địa bàn xã Ea Súp.",
    },
  });

  console.log("✅ Hoàn tất khởi tạo chiến dịch với số liệu sạch (0 đ)! Sẵn sàng đón nhận giao dịch từ Casso.");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khởi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
