"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatVND, formatDateTime, formatTimeAgo } from "@/lib/utils";
import {
  ShieldCheck,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  FileText,
  Eye,
  Calendar,
  Filter,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface TransactionItem {
  id: number;
  reference?: string | null;
  type: string;
  amount: number | string;
  runningBalance?: number | string | null;
  description: string;
  transactionDateTime: string;
  campaignCode?: string | null;
  donorName?: string | null;
  receiptNumber?: string | null;
  proofUrls?: string[];
  note?: string | null;
  campaign?: {
    title: string;
    code: string;
    slug: string;
  } | null;
}

interface SummaryData {
  accountNumber: string;
  bankName: string;
  accountName: string;
  totalIn: number;
  totalOut: number;
  currentBalance: number;
  runningBalanceBank: number;
  totalDonationsCount: number;
  totalDisbursementsCount: number;
  lastSync: string;
}

export default function SaoKePage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [activeMainTab, setActiveMainTab] = useState<"TRANSACTIONS" | "SCANNED_DOCS">("TRANSACTIONS");
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = typeof window !== "undefined" && localStorage.getItem("admin_logged_in") === "true";
      setIsAdmin(loggedIn);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Modal xem chứng từ
  const [viewingProof, setViewingProof] = useState<TransactionItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("type", activeTab);
      if (searchTerm) params.append("search", searchTerm);
      if (campaignFilter) params.append("campaign", campaignFilter);
      params.append("page", page.toString());
      params.append("limit", "20");
      params.append("_t", Date.now().toString());

      const res = await fetch(`/api/v1/sao-ke?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        let list: TransactionItem[] = data.transactions || [];
        if (activeTab !== "ALL") {
          list = list.filter((t) => t.type === activeTab);
        }
        setTransactions(list);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalRecords(activeTab === "ALL" ? (data.pagination.totalRecords || list.length) : list.length);
      }
    } catch (err) {
      console.error("Error loading sao-ke data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, campaignFilter, page]);

  // Bảo đảm hiển thị chuẩn 100%, sắp xếp thời gian mới nhất lên đầu, khử trùng lặp và đánh STT ngược
  const displayTransactions = useMemo(() => {
    let list = [...transactions];

    if (activeTab !== "ALL") {
      list = list.filter((t) => t.type === activeTab);
    }

    // Khử trùng lặp theo mã giao dịch / reference
    const seen = new Set<string>();
    list = list.filter((t) => {
      const key = t.reference ? `${t.type}_${t.reference}` : `${t.type}_${t.id}_${t.transactionDateTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sắp xếp thời gian giảm dần (mới nhất lên trước)
    list.sort((a, b) => {
      const timeA = new Date(a.transactionDateTime).getTime();
      const timeB = new Date(b.transactionDateTime).getTime();
      return timeB - timeA;
    });

    return list;
  }, [transactions, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Tiêu đề & Chứng thực */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>CỔNG SAO KÊ THỜI GIAN THỰC (LIVE LEDGER)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Báo Cáo Thu - Chi Minh Bạch Quỹ "Vì Người Nghèo" Xã Ea Súp
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Toàn bộ dòng tiền tiếp nhận và giải ngân đối soát tự động từ tài khoản BIDV <strong>8630100930</strong>.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <a
                href="/api/v1/export/excel"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Excel Sao Kê BIDV</span>
              </a>
            </div>
          )}
        </div>

        {/* Thẻ Thống Kê Tài Khoản BIDV 8630100930 */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-500/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="text-amber-400 text-xs font-mono tracking-wider uppercase flex items-center gap-2">
                <span>TÀI KHOẢN TIẾP NHẬN DUY NHẤT: BIDV EA SÚP</span>
                <span>•</span>
                <span>BIN: 970418</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                QUY VI NGUOI NGHEO XA EA SUP - 8630100930
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Chủ tài khoản: <strong>UY BAN MTTQ VN XA EA SUP</strong> (Ban Vận Động Quỹ)
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-medium self-start lg:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>NGUỒN DỮ LIỆU TỪ NGÂN HÀNG - Chứng nhận bởi Casso</span>
            </div>
          </div>

          {/* 3 Chỉ Số Nổi Bật: Vào (+), Ra (-), Dư (=) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
                <span>SỐ TIỀN ĐƯỢC ỦNG HỘ (+)</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {formatVND(summary?.totalIn || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {summary?.totalDonationsCount || 0} lượt đóng góp tiếp nhận
              </span>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-red-400 text-xs font-semibold mb-1">
                <span>SỐ TIỀN ĐÃ GIẢI NGÂN (-)</span>
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400">
                {formatVND(summary?.totalOut || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {summary?.totalDisbursementsCount || 0} phiếu chi có scan mộc đỏ
              </span>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/40">
              <div className="flex items-center justify-between text-amber-300 text-xs font-semibold mb-1">
                <span>SỐ DƯ TÀI KHOẢN THỰC TẾ (=)</span>
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {formatVND(summary?.currentBalance || 0)}
              </div>
              <span className="text-[11px] text-amber-200/70 mt-1 block">
                Đối soát khớp 100% BIDV 8630100930
              </span>
            </div>
          </div>
        </div>

        {/* Tab Chuyển Đổi: Bảng Sao Kê Trực Tuyến & File Chứng Từ Scan */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveMainTab("TRANSACTIONS")}
            className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeMainTab === "TRANSACTIONS"
                ? "border-red-700 text-red-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Bảng Kê Chi Tiết Giao Dịch Trực Tuyến</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {totalRecords}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("SCANNED_DOCS")}
            className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeMainTab === "SCANNED_DOCS"
                ? "border-red-700 text-red-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>File Báo Cáo - Chứng Từ Scan (Mộc Đỏ)</span>
          </button>
        </div>

        {/* NỘI DUNG TAB 1: BẢNG KÊ SAO KÊ */}
        {activeMainTab === "TRANSACTIONS" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-6">
            {/* Thanh công cụ: Tabs phân loại, Tìm kiếm, Lọc chiến dịch */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* 3 Tab phân loại dòng tiền */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => {
                    setActiveTab("ALL");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "ALL"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả giao dịch
                </button>
                <button
                  onClick={() => {
                    setActiveTab("IN");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "IN"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  Tiền vào (+)
                </button>
                <button
                  onClick={() => {
                    setActiveTab("OUT");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "OUT"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-red-700 hover:bg-red-50"
                  }`}
                >
                  Tiền ra (-)
                </button>
              </div>

              {/* Ô tìm kiếm & Lọc chiến dịch */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên, nội dung, mã TID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <select
                  value={campaignFilter}
                  onChange={(e) => {
                    setCampaignFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:border-red-600"
                >
                  <option value="">-- Mọi chiến dịch --</option>
                  <option value="NDDK01">Nhà ĐĐK bà Y Thị (Buôn A)</option>
                  <option value="NDDK02">Nhà ĐĐK ông Sáng (Thôn 5)</option>
                  <option value="SK01">Bò giống sinh kế (Thôn 12 & 14)</option>
                  <option value="TET2026">Tết Bính Ngọ vì người nghèo</option>
                  <option value="CT01">Cứu trợ mổ tim cháu H'Hên (Buôn C)</option>
                </select>
              </div>
            </div>

            {/* BẢNG KÊ DỮ LIỆU */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3.5 text-center w-16 whitespace-nowrap">STT</th>
                    <th className="p-3.5 whitespace-nowrap">Thời gian</th>
                    <th className="p-3.5 whitespace-nowrap">Mã TID / Ngân hàng</th>
                    <th className="p-3.5 min-w-[260px]">Nội dung giao dịch & Tag chiến dịch</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Số tiền (VNĐ)</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Minh chứng giải ngân</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Đang đồng bộ dữ liệu sao kê BIDV 8630100930...
                      </td>
                    </tr>
                  ) : displayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        Không tìm thấy giao dịch nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    displayTransactions.map((tx, idx) => {
                      const isIncome = tx.type === "IN";
                      // Đánh số thứ tự ngược từ tổng số giao dịch về 1 cho mỗi phần
                      const stt = displayTransactions.length - idx;
                      const sttStr = String(stt).padStart(2, "0");

                      return (
                        <tr key={tx.reference ? `${tx.type}_${tx.reference}` : `${tx.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          {/* STT đếm ngược */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                                !isIncome
                                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              }`}
                            >
                              #{sttStr}
                            </span>
                          </td>
                          {/* Thời gian */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-medium text-slate-900" title={formatDateTime(tx.transactionDateTime)}>
                              {formatTimeAgo(tx.transactionDateTime)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatDateTime(tx.transactionDateTime)}
                            </div>
                          </td>

                          {/* Reference TID */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-[11px]">
                              {tx.reference || `TX-${tx.id}`}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">BIDV Ea Súp</div>
                          </td>

                          {/* Nội dung giao dịch */}
                          <td className="p-3.5">
                            <div className="text-slate-800 font-medium leading-relaxed">
                              {tx.description}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {tx.campaignCode && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-100 text-red-800 font-semibold">
                                  #{tx.campaignCode}
                                </span>
                              )}
                              {tx.donorName && (
                                <span className="text-[11px] text-slate-500">
                                  Người gửi: <strong>{tx.donorName}</strong>
                                </span>
                              )}
                              {tx.receiptNumber && (
                                <span className="text-[11px] text-red-700 font-mono">
                                  {tx.receiptNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Số tiền */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isIncome ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatVND(tx.amount)}
                            </span>
                          </td>

                          {/* Minh chứng giải ngân */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {!isIncome && tx.proofUrls && tx.proofUrls.length > 0 ? (
                              <button
                                onClick={() => setViewingProof(tx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors border border-red-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem hóa đơn ({tx.proofUrls.length})</span>
                              </button>
                            ) : !isIncome ? (
                              <span className="text-[11px] text-slate-400 italic">Đang lưu trữ hồ sơ</span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">Ủng hộ trực tuyến</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 text-xs text-slate-600">
                <span>
                  Trang {page} / {totalPages} (Tổng {totalRecords} dòng sao kê)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    Trang trước
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 2: FILE BÁO CÁO - CHỨNG TỪ SCAN MỘC ĐỎ */}
        {activeMainTab === "SCANNED_DOCS" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Văn Bản Pháp Lý & Báo Cáo Tài Chính Có Dấu Mộc Đỏ
            </h3>
            <p className="text-xs text-slate-500">
              Các quyết định ban hành và báo cáo tài chính định kỳ theo đúng quy định của Đảng ủy, HĐND và UBMTTQ xã Ea Súp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                    QUYẾT ĐỊNH BAN HÀNH
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Quyết định số 13/QĐ-MTTQ-BTT
                  </h4>
                  <p className="text-xs text-slate-600">
                    Ban hành Quy chế vận động, quản lý và sử dụng Quỹ "Vì người nghèo" xã Ea Súp (14/01/2026).
                  </p>
                </div>
                <a
                  href="/api/v1/export/docx?reportNumber=13/QĐ-MTTQ-BTT"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file bản gốc (Word / PDF)</span>
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                    QUYẾT ĐỊNH KIỆN TOÀN
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Quyết định số 12/QĐ-MTTQ-BTT
                  </h4>
                  <p className="text-xs text-slate-600">
                    Thành lập Ban Vận động Quỹ "Vì người nghèo", Quỹ Cứu trợ xã Ea Súp (14/01/2026).
                  </p>
                </div>
                <a
                  href="/api/v1/export/docx?reportNumber=12/QĐ-MTTQ-BTT"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file bản gốc (Word / PDF)</span>
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    BÁO CÁO TÀI CHÍNH NĐ 30
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Báo cáo Công khai Tài chính Quý I/2026
                  </h4>
                  <p className="text-xs text-slate-600">
                    Xuất chuẩn thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP gửi Đảng ủy, HĐND xã.
                  </p>
                </div>
                <a
                  href="/api/v1/export/docx"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Báo cáo Thể thức NĐ 30 (.docx)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal Xem Minh Chứng Hóa Đơn Giải Ngân */}
        {viewingProof && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Hồ Sơ Chứng Từ Chi - {viewingProof.receiptNumber}</h4>
                  <span className="text-xs text-slate-400">Số tiền: {formatVND(viewingProof.amount)}</span>
                </div>
                <button
                  onClick={() => setViewingProof(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nội dung chi:</label>
                  <p className="text-sm font-semibold text-slate-900">{viewingProof.description}</p>
                </div>

                {viewingProof.note && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <strong>Ghi chú kiểm soát:</strong> {viewingProof.note}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Hình ảnh Hóa đơn VAT, Phiếu chi & Biên bản nghiệm thu:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingProof.proofUrls?.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                        <img src={url} alt="Chứng từ chi" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                <button
                  onClick={() => setViewingProof(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
