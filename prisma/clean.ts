import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Đang dọn sạch toàn bộ số liệu ảo cũ trong cơ sở dữ liệu...");

  const [delDonations, delDisbursements] = await Promise.all([
    prisma.donation.deleteMany({}),
    prisma.disbursement.deleteMany({}),
  ]);

  const campaigns = await prisma.campaign.updateMany({
    data: { currentAmount: 0 },
  });

  console.log(`✅ Đã xóa ${delDonations.count} khoản ủng hộ ảo/cũ.`);
  console.log(`✅ Đã xóa ${delDisbursements.count} đợt giải ngân ảo/cũ.`);
  console.log(`✅ Đã đặt lại số tiền vận động của ${campaigns.count} chiến dịch về 0 đ.`);
  console.log("🎉 Cơ sở dữ liệu đã sạch 100%, sẵn sàng đồng bộ số liệu thật từ Casso!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi dọn sạch dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
