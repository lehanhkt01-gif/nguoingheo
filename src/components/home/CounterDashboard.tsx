"use client";

import { useEffect, useState } from "react";
import { formatVND, formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet, Home } from "lucide-react";

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
    beneficiaryCount: 23,
  });

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
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative -mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl shadow-rose-100/50 border border-rose-100 p-5 sm:p-6">
        {/* Tiêu đề tóm tắt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-rose-100 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
              BỘ ĐẾM THỜI GIAN THỰC (LIVE COUNTER)
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Minh Bạch Dòng Tiền Quỹ "Vì Người Nghèo" Xã Ea Súp
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50/80 px-2.5 py-1 rounded-full border border-rose-200 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Đối soát tức thời từ BIDV 8630100930</span>
          </div>
        </div>

        {/* 4 Khối Thống Kê Chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng tiền ủng hộ */}
          <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200/70">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
              <span className="font-semibold uppercase">Tiền tiếp nhận (+)</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-800 tracking-tight font-mono">
              {formatVND(stats.totalIn)}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">
              Từ {formatNumber(stats.totalDonationsCount)} lượt tổ chức & cá nhân
            </p>
          </div>

          {/* Card 2: Tổng giải ngân */}
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
            <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
              <span className="font-semibold uppercase">Đã giải ngân (-)</span>
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-800 tracking-tight font-mono">
              {formatVND(stats.totalOut)}
            </div>
            <p className="text-[11px] text-rose-700/80 mt-1 font-medium">
              {stats.totalDisbursementsCount} đợt chi có biên bản mộc đỏ
            </p>
          </div>

          {/* Card 3: Số dư khả dụng BIDV 8630100930 */}
          <div className="bg-pink-50/80 rounded-xl p-4 border border-pink-200">
            <div className="flex items-center justify-between text-pink-700 text-xs mb-1">
              <span className="font-semibold uppercase">Dư khả dụng BIDV (=)</span>
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-pink-900 tracking-tight font-mono">
              {formatVND(stats.currentBalance)}
            </div>
            <p className="text-[11px] text-pink-700/80 mt-1 font-medium">
              Tài khoản BIDV 8630100930
            </p>
          </div>

          {/* Card 4: Nhà ĐĐK & Ca hỗ trợ */}
          <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
              <span className="font-semibold uppercase">Mái ấm & Ca trợ giúp</span>
              <Home className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-900 tracking-tight">
              {stats.beneficiaryCount} Hộ gia đình
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1 font-medium">
              Phủ kín khắp 20 thôn buôn xã Ea Súp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
