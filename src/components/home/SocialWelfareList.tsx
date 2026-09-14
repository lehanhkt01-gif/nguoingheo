"use client";

import { useState } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { Heart, Gift, CheckCircle2, FileText, MapPin, Eye } from "lucide-react";

interface WelfareCase {
  id: number;
  recipientName: string;
  village: string;
  situation: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
}

interface GiftBatch {
  id: number;
  title: string;
  village: string;
  recipientCount: number;
  amount: number;
  date: string;
  proofNote: string;
}

const SAMPLE_CASES: WelfareCase[] = [
  {
    id: 1,
    recipientName: "Bà Y Thị",
    village: "Buôn Drai",
    situation: "Hộ nghèo đặc biệt khó khăn, neo đơn bệnh tật. Căn nhà vách nứa dột nát cần hỗ trợ xây nhà Đại đoàn kết.",
    targetAmount: 80000000,
    currentAmount: 48500000,
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    recipientName: "Hộ ông Nguyễn Văn Sáng",
    village: "Thôn 5",
    situation: "Gia đình có 2 con nhỏ, mẹ già ốm đau, thiếu tư liệu sản xuất và nhà ở kiên cố.",
    targetAmount: 60000000,
    currentAmount: 35000000,
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    recipientName: "10 Hộ nghèo đồng bào dân tộc",
    village: "Thôn 14 & Thôn 12",
    situation: "Hỗ trợ bò cái giống sinh sản địa phương nhằm tạo sinh kế thoát nghèo bền vững lâu dài.",
    targetAmount: 50000000,
    currentAmount: 32000000,
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80",
  },
];

const SAMPLE_GIFT_BATCHES: GiftBatch[] = [
  {
    id: 1,
    title: "Trao tặng hỗ trợ xây nhà Đại đoàn kết đợt 1 (Đổ móng kiên cố)",
    village: "Buôn Drai",
    recipientCount: 1,
    amount: 8000000,
    date: "2026-09-08",
    proofNote: "Biên bản bàn giao kinh phí đợt 1 có chữ ký Trưởng ban CTMT Buôn Drai",
  },
  {
    id: 2,
    title: "Bàn giao 05 con bò giống sinh sản cho hộ nghèo vươn lên",
    village: "Thôn 14",
    recipientCount: 5,
    amount: 25000000,
    date: "2026-09-09",
    proofNote: "Hóa đơn VAT vật tư con giống và biên bản nhận bò của 05 hộ dân",
  },
  {
    id: 3,
    title: "Cứu trợ sửa mái nhà dột nát trước mùa mưa bão Tây Nguyên",
    village: "Buôn Cổng",
    recipientCount: 1,
    amount: 5000000,
    date: "2026-09-10",
    proofNote: "Phiếu chi số PC-2026-0044 xác nhận của UBMTTQ xã Ea Súp",
  },
];

export default function SocialWelfareList() {
  const [activeTab, setActiveTab] = useState<"CASES" | "GIFTS">("CASES");

  return (
    <section id="an-sinh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-6">
        {/* Header Phân Hệ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-2">
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              <span>An Sinh Xã Hội 20 Thôn Buôn</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hoàn Cảnh Khó Khăn & Các Đợt Trao Quà Thực Tế
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Khảo sát trực tiếp từ 20 thôn buôn. Mọi khoản giải ngân đều có biên bản nghiệm thu và chứng từ mộc đỏ.
            </p>
          </div>

          {/* Tab Chuyển Đổi */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("CASES")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "CASES"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hoàn cảnh cần giúp đỡ
            </button>
            <button
              onClick={() => setActiveTab("GIFTS")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "GIFTS"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đợt trao quà đã chi
            </button>
          </div>
        </div>

        {/* Tab 1: Các Hoàn Cảnh Cần Giúp Đỡ */}
        {activeTab === "CASES" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_CASES.map((item) => {
              const percent = Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100));
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-rose-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.recipientName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 flex items-center gap-1 shadow-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{item.village}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.recipientName}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.situation}
                      </p>

                      {/* Thanh Tiến Độ */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Đã vận động:</span>
                          <span className="font-extrabold text-rose-600 font-mono">
                            {formatVND(item.currentAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Tiến độ: {percent}%</span>
                          <span>Mục tiêu: {formatVND(item.targetAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/40 border-t border-rose-100">
                    <a
                      href="#dong-gop"
                      className="w-full block text-center py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs shadow-xs transition-all"
                    >
                      Ủng hộ hoàn cảnh này
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Các Đợt Trao Quà An Sinh Đã Giải Ngân */}
        {activeTab === "GIFTS" && (
          <div className="space-y-3">
            {SAMPLE_GIFT_BATCHES.map((gift) => (
              <div
                key={gift.id}
                className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rose-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Đã giải ngân
                    </span>
                    <span className="text-slate-400 text-xs font-mono">• {formatDate(gift.date)}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{gift.village}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{gift.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{gift.proofNote}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
                    -{formatVND(gift.amount)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Chứng từ mộc đỏ đầy đủ</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
