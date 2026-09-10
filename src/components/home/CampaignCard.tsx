import { formatVND } from "@/lib/utils";
import { MapPin, ArrowRight } from "lucide-react";

export interface CampaignData {
  id: number;
  code: string;
  slug: string;
  title: string;
  description: string;
  beneficiaryName?: string | null;
  village?: string | null;
  targetAmount: number | string;
  currentAmount: number | string;
  category: string;
  status: string;
  imageUrl?: string | null;
}

export default function CampaignCard({ campaign }: { campaign: CampaignData }) {
  const target = Number(campaign.targetAmount) || 1;
  const current = Number(campaign.currentAmount) || 0;
  const percent = Math.min(100, Math.round((current / target) * 100));
  const isCompleted = campaign.status === "COMPLETED" || percent >= 100;

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Ảnh chiến dịch */}
      <div className="relative aspect-[16/10] overflow-hidden bg-rose-50">
        <img
          src={
            campaign.imageUrl ||
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
          }
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm ${
              isCompleted
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {isCompleted ? "Đã đạt mục tiêu" : "Đang quyên góp"}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-rose-200 backdrop-blur-sm">
            #{campaign.code}
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{campaign.village || "Xã Ea Súp"}</span>
            {campaign.beneficiaryName && (
              <>
                <span>•</span>
                <span className="text-slate-700 font-medium">{campaign.beneficiaryName}</span>
              </>
            )}
          </div>

          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Thanh tiến độ */}
        <div className="space-y-1.5 pt-2 border-t border-rose-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Đã vận động:</span>
            <span className="font-bold text-rose-700">{formatVND(current)}</span>
          </div>

          <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-pink-500 to-rose-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Tiến độ: <strong className="text-slate-800">{percent}%</strong></span>
            <span>Mục tiêu: <strong className="text-slate-800">{formatVND(target)}</strong></span>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-1">
          <a
            href={`#dong-gop`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-200 transition-colors"
          >
            <span>Ủng hộ hoàn cảnh này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
