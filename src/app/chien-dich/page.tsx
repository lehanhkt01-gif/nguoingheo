import { prisma } from "@/lib/prisma";
import CampaignCard from "@/components/home/CampaignCard";
import { Heart, Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function ChienDichPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

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
                code: c.code,
                slug: c.slug,
                title: c.title,
                description: c.description,
                beneficiaryName: c.beneficiaryName,
                village: c.village,
                targetAmount: Number(c.targetAmount),
                currentAmount: Number(c.currentAmount),
                category: c.category,
                status: c.status,
                imageUrl: c.imageUrl,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
