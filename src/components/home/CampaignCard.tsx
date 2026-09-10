import Link from "next/link";
import { formatVND } from "@/lib/utils";
import { MapPin, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Ảnh chiến dịch */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={
            campaign.imageUrl ||
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
          }
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
              isCompleted
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {isCompleted ? "Đã đạt mục tiêu" : "Đang quyên góp"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900/80 text-amber-300 backdrop-blur-sm">
            #{campaign.code}
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>{campaign.village || "Xã Ea Súp"}</span>
            {campaign.beneficiaryName && (
              <>
                <span>•</span>
                <span className="font-semibold text-slate-700">{campaign.beneficiaryName}</span>
              </>
            )}
          </div>

          <h3 className="font-bold text-base text-slate-900 line-clamp-2 group-hover:text-red-700 transition-colors leading-snug">
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Thanh tiến độ */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Đã vận động:</span>
            <span className="font-bold text-red-700">{formatVND(current)}</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-red-600 to-amber-500"
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
        <div className="pt-2">
          <a
            href={`#dong-gop`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-700 text-white text-xs font-semibold transition-colors group-hover:shadow-md"
          >
            <span>Ủng hộ hoàn cảnh này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
