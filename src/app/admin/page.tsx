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
  Settings,
  UserPlus,
  KeyRound,
  Lock,
  FileText,
  Plus,
  Edit3,
  Gift,
  X,
  UserCheck,
  Globe,
  Tag,
  Calendar,
  User,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cleaningCasso, setCleaningCasso] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Tab chuyển đổi chính
  const [activeMainTab, setActiveMainTab] = useState<"DASHBOARD" | "POSTS" | "SETTINGS">("DASHBOARD");

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
    disbursementCount: 0,
    activeCampaigns: 0,
  });

  const [activeTableTab, setActiveTableTab] = useState<"IN" | "OUT">("IN");
  const [donations, setDonations] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("ALL");

  // ==========================================
  // Quản lý Cán bộ quản lý & Phân quyền
  // ==========================================
  const [officers, setOfficers] = useState<any[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [officerForm, setOfficerForm] = useState({
    fullName: "",
    title: "",
    username: "",
    password: "",
    phone: "",
    role: "OFFICER",
    canPost: true,
    canDelete: true,
    canManageOfficers: false,
  });
  const [officerMsg, setOfficerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Đổi mật khẩu cán bộ đang đăng nhập
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // Quản lý Bài đăng & Đăng tin an sinh
  // ==========================================
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState<any | null>(null);
  const [postCategoryFilter, setPostCategoryFilter] = useState("ALL");
  const [postSearch, setPostSearch] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postMsg, setPostMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [postForm, setPostForm] = useState({
    title: "",
    category: "TIN_TUC" as "TIN_TUC" | "HOAN_CANH" | "TRAO_QUA" | "THONG_BAO",
    village: "Toàn xã Ea Súp",
    summary: "",
    content: "",
    imageUrl: "/images/hero-charity-bg.jpg",
  });

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
    fetch("/api/donations?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDonations(d.data);
        }
      })
      .catch(() => {});
  };

  const loadDisbursements = () => {
    fetch("/api/v1/admin/disbursements?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDisbursements(d.data || []);
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

  const loadOfficers = () => {
    setLoadingOfficers(true);
    fetch("/api/v1/admin/officers")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOfficers(d.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOfficers(false));
  };

  const loadPosts = () => {
    setLoadingPosts(true);
    fetch("/api/v1/admin/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPosts(d.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
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
    loadDisbursements();
    loadCassoInfo();
    loadOfficers();
    loadPosts();

    // Tự động làm mới dữ liệu thời gian thực mỗi 15 giây
    const autoRefreshInterval = setInterval(() => {
      loadStats();
      loadDonations();
      loadDisbursements();
      loadCassoInfo();
    }, 15000);

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

    return () => clearInterval(autoRefreshInterval);
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
        loadDisbursements();
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
        "CẢNH BÁO QUẢN TRỊ VIÊN:\n\nThao tác này sẽ XÓA TOÀN BỘ số liệu mẫu/ảo cũ trong cơ sở dữ liệu và chủ động kết nối Casso Open API để kéo số liệu thật từ tài khoản BIDV 8630100930.\n\nQuý vị có chắc chắn muốn thực hiện?"
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
        loadDisbursements();
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

  // ==========================================
  // Xử lý Cán bộ quản lý
  // ==========================================
  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerMsg(null);
    try {
      const res = await fetch("/api/v1/admin/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...officerForm }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficerMsg({ type: "success", text: data.message });
        setShowAddOfficerModal(false);
        setOfficerForm({
          fullName: "",
          title: "",
          username: "",
          password: "",
          phone: "",
          role: "OFFICER",
          canPost: true,
          canDelete: true,
          canManageOfficers: false,
        });
        loadOfficers();
        setTimeout(() => setOfficerMsg(null), 6000);
      } else {
        setOfficerMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setOfficerMsg({ type: "error", text: err.message || "Lỗi tạo tài khoản cán bộ" });
    }
  };

  const handleDeleteOfficer = async (id: string, name: string) => {
    if (!window.confirm(`Đồng chí có chắc chắn muốn xóa cán bộ "${name}" khỏi danh sách quản lý?`)) {
      return;
    }
    setOfficerMsg(null);
    try {
      const res = await fetch("/api/v1/admin/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficerMsg({ type: "success", text: data.message });
        loadOfficers();
        setTimeout(() => setOfficerMsg(null), 5000);
      } else {
        setOfficerMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setOfficerMsg({ type: "error", text: err.message || "Lỗi xóa cán bộ" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "Mật khẩu xác nhận không khớp với mật khẩu mới." });
      return;
    }
    setChangingPass(true);
    try {
      const currentUsername = user?.username || "admin_easup";
      const res = await fetch("/api/v1/admin/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          username: currentUsername,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg({ type: "success", text: data.message });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPassMsg(null), 8000);
      } else {
        setPassMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setPassMsg({ type: "error", text: err.message || "Lỗi cập nhật mật khẩu" });
    } finally {
      setChangingPass(false);
    }
  };

  // ==========================================
  // Xử lý Bài đăng & Đăng tin
  // ==========================================
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPost(true);
    setPostMsg(null);
    try {
      const res = await fetch("/api/v1/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...postForm,
          authorName: user?.fullName || "Đ/c Lê Hồng Hạnh",
          authorUsername: user?.username || "admin_easup",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostMsg({ type: "success", text: data.message });
        setShowAddPostModal(false);
        setPostForm({
          title: "",
          category: "TIN_TUC",
          village: "Toàn xã Ea Súp",
          summary: "",
          content: "",
          imageUrl: "/images/hero-charity-bg.jpg",
        });
        loadPosts();
        setTimeout(() => setPostMsg(null), 6000);
      } else {
        setPostMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setPostMsg({ type: "error", text: err.message || "Lỗi đăng thông tin bài viết" });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!window.confirm(`Đồng chí có chắc chắn muốn xóa bài đăng: "${title}"?`)) {
      return;
    }
    setPostMsg(null);
    try {
      const res = await fetch("/api/v1/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setPostMsg({ type: "success", text: data.message });
        loadPosts();
        setTimeout(() => setPostMsg(null), 5000);
      } else {
        setPostMsg({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setPostMsg({ type: "error", text: err.message || "Lỗi xóa bài đăng" });
    }
  };

  // Bộ lọc
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

  const filteredDisbursements = disbursements.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.recipientName?.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q) ||
      d.village?.toLowerCase().includes(q) ||
      String(d.id).includes(q);

    const matchVillage =
      villageFilter === "ALL" ||
      d.village?.toLowerCase().includes(villageFilter.toLowerCase()) ||
      d.notes?.toLowerCase().includes(villageFilter.toLowerCase());

    return matchSearch && matchVillage;
  });

  const filteredPosts = posts.filter((p) => {
    const matchCategory = postCategoryFilter === "ALL" || p.category === postCategoryFilter;
    const q = postSearch.toLowerCase();
    const matchSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.summary?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q) ||
      p.village?.toLowerCase().includes(q);
    return matchCategory && matchSearch;
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
      {/* Thanh công cụ quản trị (Sub-header) */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Bảng điều khiển Quản trị</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Nút Thiết lập Quản trị (Chuyển tab hoặc mở thiết lập) */}
            <button
              onClick={() => setActiveMainTab("SETTINGS")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                activeMainTab === "SETTINGS"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Thiết lập quản trị, quản lý cán bộ và phân quyền"
            >
              <Settings className="w-3.5 h-3.5 text-rose-600" />
              <span>Thiết lập quản trị</span>
            </button>

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
        {/* THANH ĐIỀU HƯỚNG TABS QUẢN TRỊ HIỆN ĐẠI */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveMainTab("DASHBOARD")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === "DASHBOARD"
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tổng quan tài chính &amp; Sao kê</span>
          </button>

          <button
            onClick={() => setActiveMainTab("POSTS")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === "POSTS"
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Đăng tin &amp; Quản lý bài đăng</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeMainTab === "POSTS"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("SETTINGS")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === "SETTINGS"
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Thiết lập quản trị &amp; Cán bộ</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeMainTab === "SETTINGS"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {officers.length}
            </span>
          </button>
        </div>

        {/* Thông báo thao tác chung */}
        {officerMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in ${
              officerMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                : "bg-rose-50 border border-rose-300 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {officerMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{officerMsg.text}</span>
            </div>
            <button onClick={() => setOfficerMsg(null)} className="cursor-pointer text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {postMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in ${
              postMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                : "bg-rose-50 border border-rose-300 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {postMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{postMsg.text}</span>
            </div>
            <button onClick={() => setPostMsg(null)} className="cursor-pointer text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: TỔNG QUAN TÀI CHÍNH & SAO KÊ THỜI GIAN THỰC                      */}
        {/* ========================================================================= */}
        {activeMainTab === "DASHBOARD" && (
          <div className="space-y-6 animate-in fade-in">
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

            {/* Action Header */}
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
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-2xl shadow-sm space-y-2 border border-emerald-500">
                <div className="flex items-center justify-between text-yellow-300">
                  <span className="text-xs font-bold uppercase tracking-wider">Số Dư Tài Khoản (Hiện Có)</span>
                  <Wallet className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-yellow-300">
                  {formatVND(stats.netBalance)}
                </div>
                <div className="text-[11px] text-yellow-100 flex items-center justify-between pt-1 border-t border-emerald-500/50">
                  <span>BIDV 8630100930</span>
                  <span className="font-semibold text-yellow-200">Khớp lệnh 100%</span>
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
              <div
                onClick={() => setActiveTableTab("OUT")}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-rose-400 hover:shadow-sm transition-all group"
                title="Nhấn để xem bảng chi tiết các đợt giải ngân / tiền ra"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-rose-600 transition-colors">
                    Tổng Chi Giải Ngân
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-600 tracking-tight font-mono">
                  -{formatVND(stats.totalDisbursed)}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  Đã hỗ trợ cho hộ nghèo 20 thôn buôn
                </div>
              </div>

              {/* Card 4: Số lượt */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Lượt Giao Dịch</span>
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

            {/* KHỐI CẤU HÌNH & TRẠNG THÁI CASSO OPEN API & WEBHOOK */}
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
                  {/* Cột 1: Thông số Webhook V2 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Cơ chế 1: Webhook Tiếp Nhận Tức Thì
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {cassoInfo?.hasWebhookSecret ? "Đã cài Secret" : "Đang chờ Secret"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Đường dẫn nhận thông báo Webhook từ Casso khi có biến động số dư:
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={cassoInfo?.webhookUrl || "Đang tạo URL..."}
                        className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={copyWebhookUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shrink-0 cursor-pointer"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWebhook ? "Đã chép" : "Sao chép"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Cột 2: Casso Open API Chủ Động */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                        Cơ chế 2: Chủ Động Kéo Số Dư Thực Tế
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {cassoInfo?.hasApiKey ? "Đã cài API Key" : "Chưa cài API Key"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tự động đối soát trực tiếp từ Casso Open API với số tài khoản BIDV 8630100930:
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono text-slate-700">
                        Số dư BIDV khớp lệnh:{" "}
                        <strong>{formatVND(cassoInfo?.liveAccount?.balance || stats.netBalance)} đ</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleTestCassoConnection}
                        disabled={testingCasso}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                      >
                        <Activity className={`w-3.5 h-3.5 ${testingCasso ? "animate-spin" : ""}`} />
                        <span>{testingCasso ? "Đang kiểm tra..." : "Kiểm tra kết nối"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nút hành động dọn số liệu ảo và kéo số liệu thật */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500 italic">
                    * Lưu ý: Hệ thống đối soát 100% khớp lệnh từng giao dịch, không cho phép ghi nhận trùng lặp.
                  </p>
                  <button
                    type="button"
                    onClick={handleCleanAndSyncCasso}
                    disabled={cleaningCasso}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{cleaningCasso ? "Đang xử lý làm sạch..." : "Làm sạch số liệu ảo & Kéo giao dịch thật"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KHỐI CẤU HÌNH GOOGLE GEMINI API */}
            <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-white border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        Cấu Hình Trợ Lý AI Mặt Trận Ea Súp (Gemini API)
                      </h3>
                      {hasApiKey ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã Kích Hoạt AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Chưa có API Key
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
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        Tự động Fallback
                      </span>
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
                      Mô hình được tối ưu với thuật toán tự động chuyển đổi sang model phụ nếu quá tải.
                    </p>
                  </div>

                  {/* Hàng 2: Ghi chú / Chỉ đạo bổ sung cho AI Prompt */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Chỉ đạo bổ sung cho AI Prompt (Tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ghi chú thêm thông tin chỉ đạo cho AI (VD: Nhấn mạnh chiến dịch vận động Tết 2026...)"
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

            {/* Bảng Quản Lý Danh Sách Giao Dịch Thu / Chi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTableTab("IN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTableTab === "IN"
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Tiền Vào / Tiếp Nhận ({donations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTableTab("OUT")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTableTab === "OUT"
                          ? "bg-white text-rose-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Tiền Ra / Giải Ngân ({disbursements.length})
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {activeTableTab === "IN"
                      ? "Danh Sách Giao Dịch Tiếp Nhận Tiền Vào (Donations)"
                      : "Danh Sách Giao Dịch Tiền Ra / Đã Giải Ngân (Disbursements)"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTableTab === "IN"
                      ? "Cập nhật tự động từ cổng Casso Banking Webhook V2 và Casso Open API."
                      : "Tổng hợp từ các đợt giải ngân, trao quà an sinh xã hội và giao dịch tiền ra BIDV."}
                  </p>
                </div>

                {/* Tìm kiếm & Lọc thôn buôn */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={activeTableTab === "IN" ? "Tìm tên, mã giao dịch..." : "Tìm tên hộ, nội dung, thôn..."}
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
                    <option value="Buôn A2">Buôn A2</option>
                    <option value="Buôn Drai">Buôn Drai</option>
                    <option value="Buôn Cổng">Buôn Cổng</option>
                    <option value="Thôn 1">Thôn 1</option>
                    <option value="Thôn 2">Thôn 2</option>
                    <option value="Thôn 3">Thôn 3</option>
                    <option value="Thôn 4">Thôn 4</option>
                    <option value="Thôn 5">Thôn 5</option>
                    <option value="Thôn 6">Thôn 6</option>
                    <option value="Thôn 7">Thôn 7</option>
                    <option value="Thôn 8">Thôn 8</option>
                    <option value="Thôn 9">Thôn 9</option>
                    <option value="Thôn 10">Thôn 10</option>
                    <option value="Thôn 11">Thôn 11</option>
                    <option value="Thôn 12">Thôn 12</option>
                    <option value="Thôn 13">Thôn 13</option>
                    <option value="Thôn 14">Thôn 14</option>
                    <option value="Thôn 15">Thôn 15</option>
                    <option value="Thôn 16">Thôn 16</option>
                    <option value="Thôn 17">Thôn 17</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                {activeTableTab === "IN" ? (
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
                            Không tìm thấy giao dịch tiền vào nào phù hợp.
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
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-50/60 text-slate-700 font-semibold border-b border-rose-200">
                        <th className="p-3.5">Mã Phiếu Chi</th>
                        <th className="p-3.5">Thời Gian</th>
                        <th className="p-3.5">Đối Tượng Thụ Hưởng</th>
                        <th className="p-3.5">Địa Bàn / Thôn Buôn</th>
                        <th className="p-3.5">Nội Dung &amp; Ghi Chú</th>
                        <th className="p-3.5 text-right">Số Tiền Chi (VNĐ)</th>
                        <th className="p-3.5 text-center">Chứng Từ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDisbursements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 space-y-2">
                            <p>Chưa có giao dịch tiền ra / giải ngân nào.</p>
                            <Link
                              href="/#an-sinh"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Tạo đợt trao quà / giải ngân mới tại đây</span>
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        filteredDisbursements.map((item) => (
                          <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-rose-800">
                              {`PC-${String(item.id).padStart(4, "0")}`}
                            </td>
                            <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono">
                              {new Date(item.date).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {item.recipientName}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                                {item.village}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-700 max-w-xs truncate" title={item.notes}>
                              {item.notes || "Chi hỗ trợ"}
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                              -{formatVND(item.amount)}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              {item.proofImageUrl ? (
                                <a
                                  href={item.proofImageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Xem chứng từ</span>
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  Chứng từ lưu trữ
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ĐĂNG TIN & QUẢN LÝ THÔNG TIN BÀI ĐĂNG AN SINH                      */}
        {/* ========================================================================= */}
        {activeMainTab === "POSTS" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Action Bar của Tab Bài Đăng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cổng Tin Tức &amp; Thông Tin An Sinh Xã Hội
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Quản Lý Bài Đăng &amp; Đăng Thông Tin
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cán bộ được phân quyền có thể trực tiếp soạn, xuất bản bài viết và xóa thông tin bài đăng khi cần.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPostModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đăng bài viết mới</span>
              </button>
            </div>

            {/* Bộ lọc bài đăng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Chuyên mục:</span>
                {[
                  { id: "ALL", label: "Tất cả bài viết" },
                  { id: "THONG_BAO", label: "Thông báo Mặt trận" },
                  { id: "HOAN_CANH", label: "Hoàn cảnh cần giúp đỡ" },
                  { id: "TRAO_QUA", label: "Đợt trao quà" },
                  { id: "TIN_TUC", label: "Tin tức an sinh" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPostCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      postCategoryFilter === cat.id
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài đăng, tác giả..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Danh sách các bài đăng */}
            {loadingPosts ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <span className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Đang tải danh sách bài đăng...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Chưa có bài đăng nào trong chuyên mục này.</p>
                <button
                  type="button"
                  onClick={() => setShowAddPostModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bài đăng đầu tiên ngay</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Ảnh minh chứng / đại diện */}
                      <div className="h-40 bg-slate-100 overflow-hidden relative">
                        <img
                          src={post.imageUrl || "/images/hero-charity-bg.jpg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e: any) => {
                            e.target.src = "/images/logo-mttq.png";
                          }}
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                          {post.categoryLabel || post.category}
                        </span>
                        {post.village && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-600 text-white shadow-xs">
                            {post.village}
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{post.date}</span>
                          <span>•</span>
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700 truncate">{post.authorName}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {post.summary || post.content}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPostDetail(post)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>

                      {/* Nút Xóa bài đăng */}
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title="Xóa bài đăng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: THIẾT LẬP QUẢN TRỊ & QUẢN LÝ CÁN BỘ                                */}
        {/* ========================================================================= */}
        {activeMainTab === "SETTINGS" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header tab thiết lập */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phân Quyền &amp; Tài Khoản Cán Bộ Quản Trị
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Thiết Lập Quản Trị &amp; Quản Lý Cán Bộ
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Thêm, xóa cán bộ trong Ban Vận động Quỹ và cho phép cán bộ đổi mật khẩu đăng nhập an toàn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddOfficerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-300 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm cán bộ mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KHỐI 1: FORM ĐỔI MẬT KHẨU CỦA CÁN BỘ ĐANG ĐĂNG NHẬP */}
              <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Đổi Mật Khẩu Đăng Nhập</h3>
                    <p className="text-[11px] text-slate-500">Dành cho tài khoản cán bộ đang làm việc</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="text-slate-500">Cán bộ đang đăng nhập:</div>
                  <div className="font-bold text-slate-900 text-sm">{user?.fullName || "Đ/c Lê Hồng Hạnh"}</div>
                  <div className="text-[11px] text-rose-600 font-medium">{user?.title || "Chủ tịch UBMTTQ xã"}</div>
                  <div className="text-[11px] font-mono text-slate-600">
                    Tên tài khoản: <strong>{user?.username || "admin_easup"}</strong>
                  </div>
                </div>

                {passMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                      passMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-red-50 text-red-900 border border-red-200"
                    }`}
                  >
                    {passMsg.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Mật khẩu mới:</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 font-mono bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới:</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 font-mono bg-slate-50/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{changingPass ? "Đang lưu mật khẩu..." : "Cập nhật mật khẩu"}</span>
                  </button>
                </form>
              </div>

              {/* KHỐI 2: DANH SÁCH CÁN BỘ & THAO TÁC XÓA */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Danh Sách Cán Bộ Quản Trị ({officers.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cán bộ trong danh sách có thể đăng nhập vào hệ thống theo tài khoản và mật khẩu được cấp.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="p-3.5">Họ Và Tên</th>
                        <th className="p-3.5">Chức Vụ</th>
                        <th className="p-3.5">Tài Khoản</th>
                        <th className="p-3.5">Quyền Hạn</th>
                        <th className="p-3.5 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {officers.map((off) => (
                        <tr key={off.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                                {off.fullName
                                  .split(" ")
                                  .slice(-2)
                                  .map((n: string) => n[0])
                                  .join("")}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{off.fullName}</div>
                                {off.phone && <div className="text-[11px] text-slate-500">{off.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">{off.title}</td>
                          <td className="p-3.5 font-mono text-slate-800 font-bold">{off.username}</td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {off.role === "ADMIN" ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  ADMIN TỐI CAO
                                </span>
                              ) : (
                                <>
                                  {off.canPost && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                      Đăng tin
                                    </span>
                                  )}
                                  {off.canDelete && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                                      Xóa tin
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            {off.role === "ADMIN" || off.username === "admin_easup" ? (
                              <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteOfficer(off.id, off.fullName)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Xóa cán bộ này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: SOẠN BÀI ĐĂNG THÔNG TIN MỚI                                      */}
      {/* ========================================================================= */}
      {showAddPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-base">Đăng Bài Viết / Thông Tin An Sinh Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPostModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Tiêu đề bài đăng <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="VD: Thông báo tiếp nhận hỗ trợ, Kế hoạch xây nhà Đại đoàn kết..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Chuyên mục:</label>
                  <select
                    value={postForm.category}
                    onChange={(e: any) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 font-medium"
                  >
                    <option value="TIN_TUC">Tin tức Mặt trận</option>
                    <option value="HOAN_CANH">Hoàn cảnh cần giúp đỡ</option>
                    <option value="TRAO_QUA">Đợt trao quà an sinh</option>
                    <option value="THONG_BAO">Thông báo quan trọng</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Địa bàn liên quan:</label>
                  <select
                    value={postForm.village}
                    onChange={(e) => setPostForm({ ...postForm, village: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 font-medium"
                  >
                    <option value="Toàn xã Ea Súp">Toàn xã Ea Súp</option>
                    <option value="Buôn A">Buôn A</option>
                    <option value="Buôn B">Buôn B</option>
                    <option value="Buôn C">Buôn C</option>
                    <option value="Buôn A2">Buôn A2</option>
                    <option value="Buôn Drai">Buôn Drai</option>
                    <option value="Buôn Cổng">Buôn Cổng</option>
                    <option value="Thôn 1">Thôn 1</option>
                    <option value="Thôn 2">Thôn 2</option>
                    <option value="Thôn 3">Thôn 3</option>
                    <option value="Thôn 4">Thôn 4</option>
                    <option value="Thôn 5">Thôn 5</option>
                    <option value="Thôn 6">Thôn 6</option>
                    <option value="Thôn 7">Thôn 7</option>
                    <option value="Thôn 8">Thôn 8</option>
                    <option value="Thôn 9">Thôn 9</option>
                    <option value="Thôn 10">Thôn 10</option>
                    <option value="Thôn 11">Thôn 11</option>
                    <option value="Thôn 12">Thôn 12</option>
                    <option value="Thôn 13">Thôn 13</option>
                    <option value="Thôn 14">Thôn 14</option>
                    <option value="Thôn 15">Thôn 15</option>
                    <option value="Thôn 16">Thôn 16</option>
                    <option value="Thôn 17">Thôn 17</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Tóm tắt ngắn gọn:</label>
                <textarea
                  rows={2}
                  value={postForm.summary}
                  onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                  placeholder="Tóm tắt ngắn xuất hiện trên thẻ xem nhanh..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nội dung chi tiết bài viết <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={5}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Soạn thảo toàn văn nội dung thông tin bài đăng..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Đường dẫn ảnh đại diện / minh chứng:</label>
                <input
                  type="text"
                  value={postForm.imageUrl}
                  onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
                  placeholder="/images/hero-charity-bg.jpg hoặc link URL ảnh..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono text-slate-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submittingPost ? "Đang xuất bản..." : "Xuất bản bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM CÁN BỘ QUẢN LÝ MỚI                                          */}
      {/* ========================================================================= */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Thêm Cán Bộ Quản Trị Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOfficerModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Họ và tên cán bộ <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={officerForm.fullName}
                  onChange={(e) => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                  placeholder="VD: Đ/c Lê Văn A"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Chức vụ / Chức danh <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={officerForm.title}
                  onChange={(e) => setOfficerForm({ ...officerForm, title: e.target.value })}
                  placeholder="VD: Phó Chủ tịch UBMTTQ, Cán bộ phụ trách..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tên đăng nhập <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={officerForm.username}
                    onChange={(e) => setOfficerForm({ ...officerForm, username: e.target.value })}
                    placeholder="VD: le_vana"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu đăng nhập <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="password"
                    required
                    value={officerForm.password}
                    onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-600 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  value={officerForm.phone}
                  onChange={(e) => setOfficerForm({ ...officerForm, phone: e.target.value })}
                  placeholder="VD: 0912.345.678"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Phân quyền hạn */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Phân quyền hạn thao tác:</label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={officerForm.canPost}
                      onChange={(e) => setOfficerForm({ ...officerForm, canPost: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Có quyền đăng bài viết, tin tức &amp; thông tin an sinh</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={officerForm.canDelete}
                      onChange={(e) => setOfficerForm({ ...officerForm, canDelete: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Có quyền xóa bài viết &amp; thông tin bài đăng</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-300 transition-all cursor-pointer"
                >
                  Lưu cán bộ quản lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: XEM CHI TIẾT BÀI ĐĂNG                                            */}
      {/* ========================================================================= */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                {selectedPostDetail.categoryLabel || selectedPostDetail.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {selectedPostDetail.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span>Ngày: {selectedPostDetail.date}</span>
                <span>•</span>
                <span>Tác giả: <strong>{selectedPostDetail.authorName}</strong></span>
                <span>•</span>
                <span>Địa bàn: <strong>{selectedPostDetail.village || "Toàn xã"}</strong></span>
              </div>

              {selectedPostDetail.imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-64">
                  <img
                    src={selectedPostDetail.imageUrl}
                    alt={selectedPostDetail.title}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = "/images/logo-mttq.png";
                    }}
                  />
                </div>
              )}

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedPostDetail.content}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const id = selectedPostDetail.id;
                  const title = selectedPostDetail.title;
                  setSelectedPostDetail(null);
                  handleDeletePost(id, title);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bài đăng này</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
