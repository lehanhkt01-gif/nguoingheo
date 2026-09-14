"use client";

import { useState, useEffect } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { Search, Filter, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export const EA_SUP_VILLAGES = [
  "Thôn 1", "Thôn 2", "Thôn 3", "Thôn 4", "Thôn 5",
  "Thôn 6", "Thôn 7", "Thôn 8", "Thôn 9", "Thôn 10",
  "Thôn 11", "Thôn 12", "Thôn 13", "Thôn 14", "Thôn 15",
  "Thôn 16", "Thôn 17", "Buôn A2", "Buôn Drai", "Buôn Cổng"
];

interface DonationItem {
  id: number;
  transactionId: string;
  donorName: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
  campaign?: {
    id: number;
    title: string;
  };
}

export default function LiveLedgerTable() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (selectedVillage !== "ALL") params.append("village", selectedVillage);

      const res = await fetch(`/api/donations?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDonations(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      }
    } catch (error) {
      console.error("Fetch donations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [page, selectedVillage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  return (
    <section id="sao-ke" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl border border-rose-100 shadow-xl overflow-hidden">
        {/* Header Phân Hệ */}
        <div className="p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-rose-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Minh Bạch 100% Thu - Chi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Sổ Sao Kê Đóng Góp Trực Tuyến
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Dữ liệu ngân hàng BIDV STK <strong>8630100930</strong> tự động đối soát thời gian thực qua Casso Webhook.
              </p>
            </div>

            {/* Thanh tìm kiếm và bộ lọc */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên nhà hảo tâm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 w-48 sm:w-60 shadow-2xs"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedVillage}
                  onChange={(e) => {
                    setSelectedVillage(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Lọc theo 20 thôn buôn"
                  className="pl-9 pr-6 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none shadow-2xs text-slate-700 font-medium"
                >
                  <option value="ALL">Toàn bộ 20 thôn, buôn</option>
                  {EA_SUP_VILLAGES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={fetchDonations}
                disabled={loading}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-600" : ""}`} />
              </button>
            </form>
          </div>
        </div>

        {/* Bảng Dữ Liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Nhà hảo tâm</th>
                <th className="py-3.5 px-4">Số tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Nội dung chuyển khoản</th>
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {donations.length > 0 ? (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {formatDate(d.transactionDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.donorName}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 font-mono text-sm whitespace-nowrap">
                      +{formatVND(Number(d.amount))}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={d.description}>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800">
                        {d.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {d.transactionId}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Thành công</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    {loading ? "Đang tải dữ liệu sao kê..." : "Không tìm thấy giao dịch nào phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân Trang */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Hiển thị <strong>{donations.length}</strong> trên tổng số <strong>{totalCount}</strong> giao dịch
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">Trang {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
