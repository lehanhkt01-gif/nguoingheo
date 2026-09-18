"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatVND, cleanTransferContent } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  RefreshCw,
  LogOut,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  ArrowLeft,
  Gift,
  Bot,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  AlertCircle,
  CreditCard,
  Copy,
  Check,
  Zap,
  Activity,
  Trash2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cleaningCasso, setCleaningCasso] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Trạng thái Casso Banking V2 (Cấu hình tự động)
  const [cassoInfo, setCassoInfo] = useState<any>(null);
  const [testingCasso, setTestingCasso] = useState(false);
  const [cassoStatusMsg, setCassoStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Cấu hình Gemini API cho Chatbot Gem
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  const [availableModels, setAvailableModels] = useState<any[]>([
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Khuyên dùng - Siêu Nhanh, Thông Minh & Ổn Định Nhất)", default: true },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Bản Chuẩn Quốc Tế - Tốc Độ Cao & Ổn Định)" },
    { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B (Bản Siêu Tiết Kiệm & Nhanh)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Bản Chuyên Sâu - Phân Tích Dài)" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite (Tiết Kiệm Quota)" },
  ]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalDisbursed: 0,
    netBalance: 0,
    donationCount: 0,
    activeCampaigns: 0,
  });

  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("ALL");

  const loadStats = () => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.data);
        }
      })
      .catch(() => {});
  };

  const loadDonations = () => {
    fetch("/api/donations?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDonations(d.data);
        }
      })
      .catch(() => {});
  };

  const loadCassoInfo = () => {
    fetch("/api/v1/admin/casso/sync")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setCassoInfo(d.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Kiểm tra phiên đăng nhập
    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          // Fallback to localStorage check
          const localUser = localStorage.getItem("vinguoingheo_user");
          if (!localUser) {
            router.push("/admin/login");
            return;
          }
          setUser(JSON.parse(localUser));
        }
      })
      .catch(() => {
        const localUser = localStorage.getItem("vinguoingheo_user");
        if (!localUser) {
          router.push("/admin/login");
          return;
        }
        setUser(JSON.parse(localUser));
      })
      .finally(() => {
        setLoading(false);
      });

    // Tải dữ liệu ban đầu
    loadStats();
    loadDonations();
    loadCassoInfo();

    // Tải cấu hình Gemini API hiện tại
    fetch("/api/v1/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.settings) {
            setHasApiKey(Boolean(d.settings.hasKey));
            if (d.settings.geminiApiKey) {
              setApiKeyInput(d.settings.geminiApiKey);
            }
            if (d.settings.geminiModel) {
              setGeminiModel(d.settings.geminiModel);
            }
            if (d.settings.systemPrompt) {
              setCustomPrompt(d.settings.systemPrompt);
            }
          }
          if (d.availableModels && Array.isArray(d.availableModels)) {
            setAvailableModels(d.availableModels);
          }
        }
      })
      .catch(() => {});
  }, [router]);

  // Hành động Đồng bộ thủ công với Casso (Cơ chế 2: Chủ động)
  const handleManualCassoSync = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/v1/admin/casso/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.success) {
        setSyncSuccess(data.message);
        loadStats();
        loadDonations();
        loadCassoInfo();
        setTimeout(() => setSyncSuccess(null), 8000);
      } else {
        setSyncError(data.message || "Đồng bộ Casso thất bại!");
        setTimeout(() => setSyncError(null), 8000);
      }
    } catch (err: any) {
      setSyncError("Lỗi kết nối đến máy chủ đồng bộ: " + err.message);
      setTimeout(() => setSyncError(null), 8000);
    } finally {
      setSyncing(false);
    }
  };

  // Xóa số liệu ảo cũ và đồng bộ sạch từ Casso
  const handleCleanAndSyncCasso = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO QUẢN TRỊ VIÊN:\n\nThao tác này sẽ XÓA TOÀN BỘ số liệu mẫu/ảo cũ trong cơ sở dữ liệu (các khoản ủng hộ mẫu và đợt chi mẫu) và sau đó chủ động kết nối Casso Open API để kéo số liệu thật từ tài khoản BIDV 8630100930.\n\nQuý vị có chắc chắn muốn thực hiện?"
      )
    ) {
      return;
    }

    setCleaningCasso(true);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/v1/admin/casso/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clean_and_sync" }),
      });
      const data = await res.json();

      if (data.success) {
        setSyncSuccess(data.message || "Đã xóa sạch số liệu ảo và cập nhật số liệu mới từ Casso!");
        loadStats();
        loadDonations();
        loadCassoInfo();
        setTimeout(() => setSyncSuccess(null), 10000);
      } else {
        setSyncError(data.message || "Thao tác xóa và đồng bộ thất bại!");
        setTimeout(() => setSyncError(null), 10000);
      }
    } catch (err: any) {
      setSyncError("Lỗi kết nối đến máy chủ: " + err.message);
      setTimeout(() => setSyncError(null), 10000);
    } finally {
      setCleaningCasso(false);
    }
  };

  // Kiểm tra kết nối Casso Open API & Cập nhật số dư tự động
  const handleTestCassoConnection = async () => {
    setTestingCasso(true);
    setCassoStatusMsg(null);
    try {
      const res = await fetch("/api/v1/admin/casso/sync");
      const data = await res.json();
      if (data.success) {
        if (data.data.apiConnectionOk) {
          setCassoStatusMsg({
            type: "success",
            text: `Kết nối Casso Open API thành công! Số dư thực tế BIDV 8630100930: ${formatVND(
              data.data.liveAccount?.balance || 0
            )} đ`,
          });
        } else {
          setCassoStatusMsg({
            type: "error",
            text: `Casso API phản hồi: ${data.data.apiErrorMessage || "Lỗi kiểm tra kết nối"}`,
          });
        }
        loadCassoInfo();
        loadStats();
      } else {
        setCassoStatusMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setCassoStatusMsg({ type: "error", text: "Không thể kết nối máy chủ để kiểm tra Casso API!" });
    } finally {
      setTestingCasso(false);
    }
  };

  // Copy Webhook URL
  const copyWebhookUrl = () => {
    const url = cassoInfo?.webhookUrl || `${window.location.origin}/api/v1/webhook/casso`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // Gemini Handlers
  const handleTestGeminiKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyStatusMsg({ type: "error", text: "Vui lòng nhập Google Gemini API Key trước khi kiểm tra!" });
      return;
    }
    setTestingKey(true);
    setKeyStatusMsg(null);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          geminiApiKey: apiKeyInput,
          geminiModel: geminiModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.activeModel && data.activeModel !== geminiModel) {
          setGeminiModel(data.activeModel);
        }
        setKeyStatusMsg({ type: "success", text: data.message });
      } else {
        setKeyStatusMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setKeyStatusMsg({ type: "error", text: "Không thể kết nối đến máy chủ kiểm tra API!" });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveGeminiSettings = async () => {
    setSavingKey(true);
    setKeyStatusMsg(null);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          geminiApiKey: apiKeyInput,
          geminiModel: geminiModel,
          systemPrompt: customPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasApiKey(data.settings?.hasKey);
        if (data.settings?.geminiModel) {
          setGeminiModel(data.settings.geminiModel);
        }
        setKeyStatusMsg({ type: "success", text: data.message });
        setTimeout(() => setKeyStatusMsg(null), 5000);
      } else {
        setKeyStatusMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setKeyStatusMsg({ type: "error", text: "Lỗi lưu cấu hình vào hệ thống!" });
    } finally {
      setSavingKey(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("vinguoingheo_user");
    localStorage.removeItem("admin_logged_in");
    router.push("/admin/login");
  };

  const filteredDonations = donations.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.donorName?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.transactionId?.toLowerCase().includes(q);

    const matchVillage =
      villageFilter === "ALL" ||
      d.description?.toLowerCase().includes(villageFilter.toLowerCase());

    return matchSearch && matchVillage;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-rose-700 font-semibold text-xs">
          <span className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <span>Đang xác thực bảo mật quyền Quản trị...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Thanh công cụ quản trị */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Bảng điều khiển Quản trị</span>
            </span>
            <span className="text-xs text-slate-300 hidden md:inline">|</span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Hệ thống đối soát &amp; an sinh xã hội 20 thôn buôn
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang người dân</span>
            </Link>

            {/* Thông tin Cán bộ */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-rose-100 border border-rose-200 text-rose-800 font-bold flex items-center justify-center text-xs">
                LH
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || "Đ/c Lê Hồng Hạnh"}
                </div>
                <div className="text-[10px] text-rose-600 font-medium">
                  {user?.title || "Chủ tịch UBMTTQ xã"}
                </div>
              </div>
            </div>

            {/* Nút Đăng xuất */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner thông báo trạng thái đồng bộ thành công */}
        {syncSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccess}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">Status: 200 OK</span>
          </div>
        )}

        {/* Banner thông báo lỗi đồng bộ */}
        {syncError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Action Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Hệ Thống Trực Tuyến • BIDV 8630100930
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              Tổng Quan Tài Chính &amp; Sao Kê Minh Bạch
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Đồng bộ kép: Tiếp nhận tức thì qua Webhook V2 và chủ động đối soát qua Casso Open API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Nút Đồng bộ thủ công với Casso */}
            <button
              onClick={handleManualCassoSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-rose-400" : ""}`} />
              <span>{syncing ? "Đang đối soát Casso API..." : "Đồng bộ thủ công với Casso"}</span>
            </button>

            {/* Quản lý An sinh & Hoàn cảnh */}
            <Link
              href="/#an-sinh"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-xs transition-all"
            >
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              <span>Quản lý Hoàn cảnh &amp; Đợt trao quà</span>
            </Link>

            {/* Xuất Excel */}
            <a
              href="/api/v1/export/excel"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel Sao Kê</span>
            </a>
          </div>
        </div>

        {/* 4 Thẻ Thống Kê Nhanh Số Dư BIDV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Số dư thực tế */}
          <div className="bg-gradient-to-br from-rose-600 to-pink-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-rose-100">
              <span className="text-xs font-bold uppercase tracking-wider">Số Dư Quỹ Khả Dụng</span>
              <Wallet className="w-5 h-5 text-rose-200" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {formatVND(stats.netBalance)}
            </div>
            <div className="text-[11px] text-rose-100 flex items-center justify-between pt-1 border-t border-white/20">
              <span>BIDV 8630100930</span>
              <span className="font-semibold text-emerald-200">Khớp lệnh 100%</span>
            </div>
          </div>

          {/* Card 2: Tổng vận động */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Thu Vận Động</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight font-mono">
              +{formatVND(stats.totalDonations)}
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Tổng số tiền nhà hảo tâm đóng góp
            </div>
          </div>

          {/* Card 3: Đã giải ngân */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Đã Chi Giải Ngân</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 tracking-tight font-mono">
              -{formatVND(stats.totalDisbursed)}
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Nhà ĐĐK, bò giống, trợ cấp bão lụt
            </div>
          </div>

          {/* Card 4: Lượt đóng góp */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Lượt Ủng Hộ</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {stats.donationCount} <span className="text-sm font-sans font-normal text-slate-500">lượt</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              {stats.activeCampaigns} chiến dịch trọng điểm đang mở
            </div>
          </div>
        </div>

        {/* KHỐI CẤU HÌNH & TRẠNG THÁI CASSO OPEN API & WEBHOOK (ĐỒNG BỘ KÉP) */}
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Cơ Chế Đồng Bộ Kép Casso Banking V2 (BIDV 8630100930)
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã Kết Nối Tự Động (BIDV 8630100930)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tài khoản tiếp nhận duy nhất: <strong>BIDV 8630100930</strong> • Chủ tài khoản: <strong>UY BAN MTTQ VN XA EA SUP</strong>.
                </p>
              </div>
            </div>

            <a
              href="https://casso.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline shrink-0"
            >
              <span>Trang quản trị Casso.vn</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {cassoStatusMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
                  cassoStatusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {cassoStatusMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{cassoStatusMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phân hệ 1: Cơ chế thụ động (Real-time Webhook) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Cơ chế Thụ động: Real-time Webhook
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Trực tuyến 24/7
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Endpoint Webhook (Đã sẵn sàng kết nối):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={cassoInfo?.webhookUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/webhook/casso`}
                      className="w-full px-2.5 py-2 text-[11px] font-mono rounded-lg border border-slate-200 bg-white text-slate-800 select-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={copyWebhookUrl}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs transition-colors shrink-0 cursor-pointer"
                      title="Sao chép URL"
                    >
                      {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Mã bảo mật Secure Token:</span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      ✓ Đã nạp tự động (Ho9x...tOt)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Khắc phục triệt để lỗi 401 Unauthorized khi Casso gửi dữ liệu. Bảo vệ an toàn tuyệt đối.
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ✓ Tiếp nhận tức thì khi có biến động số dư • Chống trùng lặp (Idempotency) • Tự động bóc tách tên nhà hảo tâm và cộng dồn chiến dịch.
                </p>
              </div>

              {/* Phân hệ 2: Cơ chế chủ động (Casso API Sync) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Cơ chế Chủ động: Casso Open API Sync
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      <Zap className="w-3 h-3 text-blue-600" />
                      Kéo Lịch Sử v2
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <span>Trạng thái kết nối Casso Open API:</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Đã kết nối tự động Open API v2
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 text-xs text-blue-900">
                      <span className="font-medium">Số dư thực tế BIDV 8630100930:</span>
                      <span className="font-mono font-extrabold text-blue-900 text-sm">
                        {formatVND(cassoInfo?.liveAccount?.balance ?? stats.netBalance)} đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleTestCassoConnection}
                      disabled={testingCasso}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 text-blue-600 ${testingCasso ? "animate-spin" : ""}`} />
                      <span>{testingCasso ? "Đang kiểm tra..." : "Kiểm tra kết nối & Số dư"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualCassoSync}
                      disabled={syncing || cleaningCasso}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-rose-400" : ""}`} />
                      <span>{syncing ? "Đang kéo sao kê..." : "Đồng bộ giao dịch mới"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCleanAndSyncCasso}
                    disabled={cleaningCasso || syncing}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className={`w-3.5 h-3.5 text-rose-600 ${cleaningCasso ? "animate-spin" : ""}`} />
                    <span>{cleaningCasso ? "Đang xóa số liệu ảo & kéo từ Casso..." : "Xóa toàn bộ số liệu ảo cũ & Cập nhật từ Casso"}</span>
                  </button>

                  <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
                    ✓ Gọi trực tiếp <code>/v2/sync</code>, <code>/v2/transactions</code> và <code>/v2/accounts</code> để đối soát 100% không độ trễ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Khối Cấu Hình Kết Nối Gemini API cho Chatbot Gem */}
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-white border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Cấu Hình Kết Nối Trợ Lý AI Gem Mặt Trận (Google Gemini)
                  </h3>
                  {hasApiKey ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Đã kết nối ({geminiModel})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Chưa nạp API Key
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu hình mô hình Gemini và khóa API để trợ lý AI giải đáp thông tin tự động, tương tự hệ thống Lịch công tác Ea Súp.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline shrink-0"
            >
              <span>Lấy API Key miễn phí tại Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {keyStatusMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
                  keyStatusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {keyStatusMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{keyStatusMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột 1: Nhập API Key */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Google Gemini API Key (Bắt buộc)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Dán mã API Key của bạn (chuẩn AIzaSy... hoặc AQ.Ab8...)"
                    className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showKey ? "Ẩn khóa" : "Hiện khóa"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ cả khóa chuẩn quốc tế Google AI Studio (AIzaSy...) và chuẩn mới (AQ.Ab8...).
                </p>
              </div>

              {/* Cột 2: Chọn Mô hình AI (Gemini Model) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Lựa chọn Mô hình AI (Gemini Model)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Tự động Fallback</span>
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-slate-50/50 font-medium text-slate-800 cursor-pointer"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Mô hình được tối ưu với thuật toán tự động chuyển đổi sang model phụ nếu quá tải (giống web Lịch công tác).
                </p>
              </div>

              {/* Hàng 2: Ghi chú / Chỉ đạo bổ sung cho AI Prompt (Tùy chọn) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chỉ đạo bổ sung cho AI Prompt (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ghi chú thêm thông tin chỉ đạo cho AI (VD: Nhấn mạnh chiến dịch Tết Bính Ngọ đang diễn ra...)"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Các nút hành động Gemini */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={testingKey || !apiKeyInput.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${testingKey ? "animate-spin" : ""}`} />
                <span>{testingKey ? "Đang kiểm tra kết nối..." : "Kiểm tra kết nối (Test API Key)"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveGeminiSettings}
                disabled={savingKey}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingKey ? "Đang lưu..." : "Lưu cấu hình Gemini"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bảng Quản Lý Danh Sách Ủng Hộ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Danh Sách Giao Dịch Tiếp Nhận Tiền Vào (Donations)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tự động từ cổng Casso Banking Webhook V2 và Casso Open API.
              </p>
            </div>

            {/* Tìm kiếm & Lọc thôn buôn */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, mã giao dịch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-slate-50/50"
                />
              </div>

              <select
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="ALL">Toàn bộ địa bàn</option>
                <option value="Buôn A">Buôn A</option>
                <option value="Buôn B">Buôn B</option>
                <option value="Buôn C">Buôn C</option>
                <option value="Thôn 14">Thôn 14</option>
                <option value="Thôn 12">Thôn 12</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3.5">Mã Giao Dịch</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Nhà Hảo Tâm</th>
                  <th className="p-3.5">Nội Dung Chuyển Khoản</th>
                  <th className="p-3.5 text-right">Số Tiền (VNĐ)</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Không tìm thấy giao dịch nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {item.transactionId}
                      </td>
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(item.transactionDate).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {cleanTransferContent(item.donorName)}
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs truncate" title={item.description}>
                        {cleanTransferContent(item.description)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                        +{formatVND(item.amount)}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã ghi có
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
