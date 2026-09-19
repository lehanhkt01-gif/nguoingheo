import SocialWelfareList from "@/components/home/SocialWelfareList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nơi Gieo Hy Vọng - Danh Sách Cần Giúp Đỡ | Quỹ Vì Người Nghèo Xã Ea Súp",
  description: "Khảo sát và thẩm định trực tiếp từ 20 thôn buôn xã Ea Súp. Danh sách các hoàn cảnh khó khăn cần cộng đồng chung tay giúp đỡ qua Quỹ Vì Người Nghèo.",
};

export default function ChienDichPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      {/* 1. Nút Nơi gieo hi vọng: Sử dụng toàn bộ nội dung cần giúp đỡ */}
      <SocialWelfareList mode="CASES_ONLY" defaultTab="CASES" />
    </div>
  );
}
