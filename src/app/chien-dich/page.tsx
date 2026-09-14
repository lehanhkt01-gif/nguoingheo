import { prisma } from "@/lib/prisma";
import CampaignCard from "@/components/home/CampaignCard";
import { Heart, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChienDichPage() {
  let campaigns: any[] = [];
  try {
    campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    campaigns = [
      {
        id: 1,
        title: "Xây dựng Nhà Đại đoàn kết cho hộ nghèo khó khăn về nhà ở",
        targetAmount: 200000000,
        currentAmount: 85500000,
        status: "ACTIVE",
        description: "Xóa nhà tạm dột nát cho các hộ đồng bào và gia đình neo đơn có hoàn cảnh đặc biệt khó khăn tại 20 thôn buôn.",
      },
      {
        id: 2,
        title: "Trao tặng Bò giống sinh kế giúp đồng bào thoát nghèo bền vững",
        targetAmount: 100000000,
        currentAmount: 42000000,
        status: "ACTIVE",
        description: "Hỗ trợ bò cái sinh sản giống địa phương cho các hộ nghèo chí thú làm ăn nhưng thiếu vốn sản xuất trên địa bàn xã Ea Súp.",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>NƠI GIEO HY VỌNG • 20 THÔN BUÔN EA SÚP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Danh Mục Chiến Dịch & Hoàn Cảnh Khó Khăn Cần Giúp Đỡ
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Mỗi hoàn cảnh đều được Ban Công tác Mặt trận 20 thôn buôn thẩm định trực tiếp, đảm bảo trợ cấp đúng người, đúng việc, minh bạch từng đồng vốn.
          </p>
        </div>

        {/* Lưới chiến dịch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={{
                id: c.id,
                code: `CD-${c.id}`,
                slug: `chien-dich-${c.id}`,
                title: c.title,
                description: c.description || "",
                beneficiaryName: "Đồng bào khó khăn",
                village: "Xã Ea Súp",
                targetAmount: Number(c.targetAmount),
                currentAmount: Number(c.currentAmount),
                category: "An sinh xã hội",
                status: c.status,
                imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
