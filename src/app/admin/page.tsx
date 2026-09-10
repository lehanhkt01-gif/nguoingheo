"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/utils";
import {
  Send,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Settings,
  ShieldCheck,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Key,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "NEW_EXPENSE" | "SETTINGS">("OVERVIEW");
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    currentBalance: 0,
    count: 0,
  });

  // Cài đặt hệ thống
  const [cassoSecret, setCassoSecret] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // Form giải ngân mới
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCampaign, setExpenseCampaign] = useState("NDDK01");
  const [expenseReceipt, setExpenseReceipt] = useState("");
  const [expenseProofs, setExpenseProofs] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  // Trạng thái dispatch email
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("vinguoingheo_user");
    if (!rawUser) {
      router.push("/admin/login");
      return;
    }
    const parsedUser = JSON.parse(rawUser);
    setUser(parsedUser);

    // Tải thống kê
    fetch("/api/v1/sao-ke?limit=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.summary) {
          setStats({
            totalIn: d.summary.totalIn,
            totalOut: d.summary.totalOut,
            currentBalance: d.summary.currentBalance,
            count: d.summary.totalDonationsCount,
          });
        }
      });

    // Tải cài đặt
    fetch("/api/v1/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCassoSecret(d.settings?.CASSO_SECURE_TOKEN || "");
          setGeminiApiKey(d.settings?.GEMINI_API_KEY || "");
          setGeminiPrompt(d.settings?.GEMINI_SYSTEM_PROMPT || "");
          setWebhookLogs(d.logs || []);
        }
      });
  }, [router]);

  // Hành động One-Click: Gửi báo cáo toàn hệ thống
  const handleDispatchEmail = async () => {
    if (!confirm("Xác nhận gửi báo cáo số liệu tài chính thời gian thực tới Thường trực Đảng ủy, HĐND, UBND xã và 20 Trưởng Ban CTMT thôn buôn?")) {
      return;
    }
    setDispatchLoading(true);
    setDispatchStatus(null);

    try {
      const res = await fetch("/api/v1/dispatch-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "Kỳ hiện tại (Tháng 09/2026)" }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus(data.message);
      } else {
        setDispatchStatus(`Lỗi: ${data.message}`);
      }
    } catch (err: any) {
      setDispatchStatus(`Lỗi kết nối: ${err.message}`);
    } finally {
      setDispatchLoading(false);
    }
  };

  // Tạo phiếu giải ngân
  const handleCreateDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const urls = expenseProofs
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch("/api/v1/admin/disbursements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(expenseAmount.replace(/\D/g, "")),
          description: expenseDesc,
          campaignCode: expenseCampaign,
          receiptNumber: expenseReceipt,
          proofUrls: urls,
          note: expenseNote,
          verifiedBy: user?.fullName || "Lê Hồng Hạnh",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã tạo phiếu giải ngân và lưu chứng từ scan thành công!");
        setExpenseAmount("");
        setExpenseDesc("");
        setExpenseProofs("");
        setExpenseNote("");
        setActiveTab("OVERVIEW");
      } else {
        alert(`Lỗi: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Lưu cài đặt
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cassoSecret,
          geminiApiKey,
          geminiPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage("Đã lưu cấu hình hệ thống thành công!");
        setTimeout(() => setSettingsMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vinguoingheo_user");
    router.push("/admin/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-700 text-amber-300 font-bold flex items-center justify-center text-base">
              MT
            </div>
            <div>
              <div className="text-xs text-red-700 font-bold uppercase tracking-wider">
                Hệ Thống Quản Trị • Ban Vận Động Quỹ Ea Súp
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                Đồng chí: {user.fullName}
                <span className="ml-2 text-xs font-mono font-normal bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Quyền: {user.role}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* NÚT HÀNH ĐỘNG ĐẶC BIỆT: ONE-CLICK DISPATCHER */}
        <div className="bg-gradient-to-r from-red-800 via-brand-700 to-red-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-400/40">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-300/30">
              <Send className="w-3 h-3" />
              <span>ONE-CLICK DISPATCHER (RESEND SMTP)</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Gửi Báo Cáo Tài Chính Đến Toàn Hệ Thống Lãnh Đạo & 20 Thôn Buôn
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Tự động tổng hợp số liệu thu chi, kết xuất văn bản và phát tán tức thời qua Resend SMTP (<code>noreply@easupso.com</code>) tới Thường trực Đảng ủy, HĐND, UBND xã và 20 Trưởng Ban CTMT.
            </p>
          </div>

          <button
            onClick={handleDispatchEmail}
            disabled={dispatchLoading}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{dispatchLoading ? "ĐANG PHÁT TÁN..." : "GỬI BÁO CÁO TOÀN HỆ THỐNG"}</span>
          </button>
        </div>

        {dispatchStatus && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{dispatchStatus}</span>
          </div>
        )}

        {/* Nút hành động nhanh: Xuất Excel & Word */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/api/v1/export/excel"
            target="_blank"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-3 text-slate-800"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Xuất Excel Sao Kê</div>
              <div className="text-[11px] text-slate-500">100% dòng tiền BIDV 8630100930</div>
            </div>
          </a>

          <a
            href="/api/v1/export/docx"
            target="_blank"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 text-slate-800"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Báo Cáo Thể Thức NĐ 30</div>
              <div className="text-[11px] text-slate-500">Tạo văn bản .docx chuẩn hành chính</div>
            </div>
          </a>

          <button
            onClick={() => setActiveTab("NEW_EXPENSE")}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3 text-slate-800 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Duyệt Chi Giải Ngân</div>
              <div className="text-[11px] text-slate-500">Upload hóa đơn VAT & biên bản scan</div>
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "OVERVIEW"
                ? "border-red-700 text-red-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Tổng Quan Thu - Chi
          </button>
          <button
            onClick={() => setActiveTab("NEW_EXPENSE")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "NEW_EXPENSE"
                ? "border-red-700 text-red-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Nhập Liệu Hồ Sơ Chi
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "SETTINGS"
                ? "border-red-700 text-red-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Cài Đặt Casso Webhook & Gemini AI
          </button>
        </div>

        {/* TAB 1: TỔNG QUAN */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Tổng tiếp nhận ủng hộ</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">{formatVND(stats.totalIn)}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Tổng đã giải ngân</span>
                <div className="text-2xl font-bold text-red-700 mt-1">{formatVND(stats.totalOut)}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Số dư tài khoản BIDV</span>
                <div className="text-2xl font-bold text-blue-800 mt-1">{formatVND(stats.currentBalance)}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Quy trình kiểm soát tài chính theo QĐ 13/QĐ-MTTQ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mọi lệnh chi giải ngân đều phải tuân thủ nghiêm ngặt theo định mức: Hỗ trợ xây nhà Đại đoàn kết 8 triệu đồng/nhà từ nguồn xã; sửa chữa 5 triệu đồng/nhà; sinh kế bò giống 5 triệu đồng/hộ; cứu trợ đột xuất 1-5 triệu đồng. Mọi chứng từ giải ngân đều được lưu giữ tại Cơ quan giúp việc UBMTTQ xã Ea Súp.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: NHẬP LIỆU HỒ SƠ CHI */}
        {activeTab === "NEW_EXPENSE" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-3xl space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Lập Phiếu Chi Giải Ngân An Sinh Xã Hội
              </h3>
              <p className="text-xs text-slate-500">
                Nhập số tiền và đính kèm đường link hóa đơn tài chính, phiếu chi hoặc biên bản nghiệm thu scan.
              </p>
            </div>

            <form onSubmit={handleCreateDisbursement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Số tiền giải ngân (VNĐ):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 8,000,000"
                    value={expenseAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setExpenseAmount(raw ? Number(raw).toLocaleString("vi-VN") : "");
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Số hiệu Phiếu chi / Quyết định:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: PC-2026-0045"
                    value={expenseReceipt}
                    onChange={(e) => setExpenseReceipt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Thuộc chiến dịch / Chương trình:
                </label>
                <select
                  value={expenseCampaign}
                  onChange={(e) => setExpenseCampaign(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600 bg-white"
                >
                  <option value="NDDK01">Xây nhà ĐĐK bà Y Thị (Buôn Drai) - Định mức 8tr</option>
                  <option value="NDDK02">Xây nhà ĐĐK ông Nguyễn Văn Sáng (Thôn 5)</option>
                  <option value="SK01">Bò giống sinh kế Thôn 12 & 14 - Định mức 5tr/hộ</option>
                  <option value="TET2026">Quà Tết Bính Ngọ vì người nghèo</option>
                  <option value="CT01">Cứu trợ mổ tim đột xuất cháu H'Hên Mlô (Buôn A2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nội dung chi tiết giải ngân:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Chi hỗ trợ vật liệu xây dựng đợt 2 cho gia đình bà Y Thị theo Biên bản nghiệm thu số 04..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Link ảnh Hóa đơn VAT, Phiếu chi scan (Mỗi link 1 dòng):
                </label>
                <textarea
                  rows={3}
                  placeholder="https://images.unsplash.com/...
https://images.unsplash.com/..."
                  value={expenseProofs}
                  onChange={(e) => setExpenseProofs(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ghi chú kiểm soát:
                </label>
                <input
                  type="text"
                  placeholder="Có xác nhận của Trưởng ban CTMT thôn buôn..."
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Lưu Phiếu Chi & Đưa Lên Bảng Sao Kê
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: CÀI ĐẶT HỆ THỐNG */}
        {activeTab === "SETTINGS" && (
          <div className="space-y-6 max-w-4xl">
            {settingsMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingsMessage}</span>
              </div>
            )}

            {/* Cài đặt Casso */}
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Key className="w-4 h-4 text-red-700" />
                <h3 className="font-bold text-sm text-slate-900">Cấu Hình Casso Banking Webhook</h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  URL Endpoint Webhook V2 (Cung cấp cho Casso.vn):
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://vinguoingheo.easupso.com/api/v1/webhook/casso"
                  className="w-full bg-slate-100 text-slate-600 rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Casso Secure Token / Secret Key (Header `secure-token`):
                </label>
                <input
                  type="text"
                  value={cassoSecret}
                  onChange={(e) => setCassoSecret(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-red-600"
                />
              </div>

              {/* Cài đặt Gemini AI */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2">
                  <Settings className="w-4 h-4 text-red-700" />
                  <h3 className="font-bold text-sm text-slate-900">Cấu Hình Trợ Lý AI Google Gemini</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Google Gemini API Key:
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      System Prompt & Tri thức địa phương:
                    </label>
                    <textarea
                      rows={3}
                      value={geminiPrompt}
                      onChange={(e) => setGeminiPrompt(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>

            {/* Bảng Nhật Ký Webhook Logs Gần Nhất */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span>Nhật Ký Casso Webhook Audit Logs Gần Nhất</span>
                </h3>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Casso ID</th>
                      <th className="p-3">Nội dung thông điệp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {webhookLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          Chưa có nhật ký Webhook nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      webhookLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 whitespace-nowrap text-slate-500">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === "SUCCESS"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : log.status === "DUPLICATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3">{log.cassoId || "N/A"}</td>
                          <td className="p-3 text-slate-700 truncate max-w-xs">{log.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
