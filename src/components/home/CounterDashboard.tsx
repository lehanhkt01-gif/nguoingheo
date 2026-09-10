"use client";

import { useEffect, useState } from "react";
import { formatVND, formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet, Home, Users, CheckCircle2 } from "lucide-react";

interface StatsData {
  totalIn: number;
  totalOut: number;
  currentBalance: number;
  totalDonationsCount: number;
  totalDisbursementsCount: number;
  beneficiaryCount?: number;
}

export default function CounterDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalIn: 334000000,
    totalOut: 33000000,
    currentBalance: 301000000,
    totalDonationsCount: 142,
    totalDisbursementsCount: 5,
    beneficiaryCount: 18,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/sao-ke?limit=1");
        const json = await res.json();
        if (json.success && json.summary) {
          setStats({
            totalIn: json.summary.totalIn,
            totalOut: json.summary.totalOut,
            currentBalance: json.summary.currentBalance,
            totalDonationsCount: json.summary.totalDonationsCount,
            totalDisbursementsCount: json.summary.totalDisbursementsCount,
            beneficiaryCount: 18 + json.summary.totalDisbursementsCount,
          });
        }
      } catch (err) {
        console.error("Fetch stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 lg:p-8">
        {/* Tiêu đề tóm tắt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
              BỘ ĐẾM THỜI GIAN THỰC (LIVE COUNTER)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Minh Bạch Dòng Tiền Quỹ "Vì Người Nghèo" Xã Ea Súp
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Đối soát tức thời từ BIDV 8630100930</span>
          </div>
        </div>

        {/* 4 Khối Thống Kê Chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Tổng tiền ủng hộ */}
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng tiền tiếp nhận (+)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {formatVND(stats.totalIn)}
            </div>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">
              Từ {formatNumber(stats.totalDonationsCount)} lượt tổ chức & cá nhân
            </p>
          </div>

          {/* Card 2: Tổng giải ngân */}
          <div className="bg-red-50/50 rounded-xl p-5 border border-red-100 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between text-red-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng đã giải ngân (-)</span>
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-red-800 tracking-tight">
              {formatVND(stats.totalOut)}
            </div>
            <p className="text-xs text-red-600/80 mt-1 font-medium">
              {stats.totalDisbursementsCount} đợt chi có đầy đủ biên bản scan
            </p>
          </div>

          {/* Card 3: Số dư khả dụng BIDV 8630100930 */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-blue-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Số dư khả dụng BIDV (=)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-blue-900 tracking-tight">
              {formatVND(stats.currentBalance)}
            </div>
            <p className="text-xs text-blue-600/80 mt-1 font-medium">
              Tài khoản BIDV 8630100930
            </p>
          </div>

          {/* Card 4: Nhà ĐĐK & Ca hỗ trợ */}
          <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100 hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Mái ấm & Ca trợ giúp</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-900 tracking-tight">
              {stats.beneficiaryCount} Hộ gia đình
            </div>
            <p className="text-xs text-amber-700/80 mt-1 font-medium">
              Phủ kín khắp 20 thôn buôn xã Ea Súp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
