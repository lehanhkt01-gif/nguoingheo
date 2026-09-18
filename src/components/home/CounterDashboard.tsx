"use client";

import { useEffect, useState } from "react";
import { formatVND, formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet, Users } from "lucide-react";

interface StatsData {
  totalDonations: number;
  totalDisbursed: number;
  netBalance: number;
  donationCount: number;
}

export default function CounterDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalDonations: 0,
    totalDisbursed: 0,
    netBalance: 0,
    donationCount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.success && json.data) {
          setStats({
            totalDonations: json.data.totalDonations,
            totalDisbursed: json.data.totalDisbursed,
            netBalance: json.data.netBalance,
            donationCount: json.data.donationCount,
          });
        }
      } catch (err) {
        console.error("Fetch /api/stats error:", err);
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

        {/* 4 Khối Thống Kê Chuẩn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng vận động */}
          <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Tổng vận động (+)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-800 tracking-tight font-mono">
              {formatVND(stats.totalDonations)}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">
              Tiếp nhận từ nhà hảo tâm & kiều bào
            </p>
          </div>

          {/* Card 2: Đã giải ngân */}
          <div className="bg-rose-50/80 rounded-xl p-4 border border-rose-200/80">
            <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Đã giải ngân (-)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-800 tracking-tight font-mono">
              {formatVND(stats.totalDisbursed)}
            </div>
            <p className="text-[11px] text-rose-700/80 mt-1 font-medium">
              Chi đúng đối tượng, có biên bản mộc đỏ
            </p>
          </div>

          {/* Card 3: Số dư quỹ */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 border border-emerald-500 shadow-sm text-white">
            <div className="flex items-center justify-between text-yellow-300 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Số dư tài khoản (Hiện có)</span>
              <Wallet className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-yellow-300 tracking-tight font-mono">
              {formatVND(stats.netBalance)}
            </div>
            <p className="text-[11px] text-yellow-100 mt-1 font-medium">
              Số dư tài khoản BIDV 8630100930
            </p>
          </div>

          {/* Card 4: Lượt đóng góp */}
          <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Lượt đóng góp</span>
              <Users className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-900 tracking-tight font-mono">
              {formatNumber(stats.donationCount)} <span className="text-sm font-sans font-normal">lượt</span>
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1 font-medium">
              Chung tay vì 20 thôn buôn xã Ea Súp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
