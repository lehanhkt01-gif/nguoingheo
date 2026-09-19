import { getCampaignsData } from "@/lib/campaigns";
import CampaignsManager from "@/components/campaigns/CampaignsManager";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Danh Mục Hoàn Cảnh Khó Khăn & Chiến Dịch An Sinh | Quỹ Vì Người Nghèo Ea Súp",
  description: "Khảo sát và thẩm định trực tiếp từ 20 thôn buôn xã Ea Súp. Minh bạch 100% tài chính và giải ngân đúng đối tượng.",
};

export default function ChienDichPage() {
  const store = getCampaignsData();
  const initialCampaigns = store.campaigns || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Header Giới thiệu */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-current" />
            <span>NƠI GIEO HY VỌNG • 20 THÔN BUÔN EA SÚP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Danh Mục Chiến Dịch &amp; Hoàn Cảnh Khó Khăn Cần Giúp Đỡ
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Mỗi hoàn cảnh đều được Ban Công tác Mặt trận 20 thôn buôn thẩm định trực tiếp, đảm bảo trợ cấp đúng người, đúng việc, minh bạch từng đồng vốn. Quý vị bấm vào từng hoàn cảnh để xem hình ảnh và hồ sơ chi tiết.
          </p>
        </div>

        {/* Trình quản lý chiến dịch / hoàn cảnh tương tác đầy đủ */}
        <CampaignsManager initialCampaigns={initialCampaigns} />
      </div>
    </div>
  );
}
