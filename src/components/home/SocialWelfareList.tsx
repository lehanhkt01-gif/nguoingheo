"use client";

import { useState, useEffect } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import {
  Heart,
  Gift,
  CheckCircle2,
  FileText,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  ShieldCheck,
  Save,
  RotateCcw
} from "lucide-react";

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

const VILLAGES = [
  "Buôn A",
  "Buôn B",
  "Buôn C",
  "Thôn 1",
  "Thôn 2",
  "Thôn 3",
  "Thôn 4",
  "Thôn 5",
  "Thôn 6",
  "Thôn 7",
  "Thôn 8",
  "Thôn 9",
  "Thôn 10",
  "Thôn 11",
  "Thôn 12",
  "Thôn 13",
  "Thôn 14",
  "Thôn 15",
  "Thôn 16",
  "Thôn 17",
];

const DEFAULT_CASES: WelfareCase[] = [];

const DEFAULT_GIFT_BATCHES: GiftBatch[] = [];

export default function SocialWelfareList() {
  const [activeTab, setActiveTab] = useState<"CASES" | "GIFTS">("CASES");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Danh sách dữ liệu
  const [cases, setCases] = useState<WelfareCase[]>(DEFAULT_CASES);
  const [giftBatches, setGiftBatches] = useState<GiftBatch[]>(DEFAULT_GIFT_BATCHES);

  // Modal Hoàn cảnh
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  const [caseForm, setCaseForm] = useState<Omit<WelfareCase, "id">>({
    recipientName: "",
    village: "Buôn A",
    situation: "",
    targetAmount: 50000000,
    currentAmount: 0,
    imageUrl: "/images/hero-charity-bg.jpg",
  });

  // Modal Đợt trao quà
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<number | null>(null);
  const [giftForm, setGiftForm] = useState<Omit<GiftBatch, "id">>({
    title: "",
    village: "Buôn A",
    recipientCount: 1,
    amount: 5000000,
    date: new Date().toISOString().split("T")[0],
    proofNote: "Biên bản bàn giao có xác nhận của UBMTTQ xã Ea Súp",
  });

  // Kiểm tra quyền admin
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = typeof window !== "undefined" && localStorage.getItem("admin_logged_in") === "true";
      setIsAdmin(loggedIn);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Tải dữ liệu chuẩn từ Hệ Thống máy chủ Backend (Xóa bỏ hoàn toàn cache dữ liệu rác cũ)
  useEffect(() => {
    // Xóa bộ nhớ đệm trình duyệt cũ nếu có chứa dữ liệu mẫu
    try {
      const oldCached = localStorage.getItem("vinguoingheo_cases");
      if (oldCached && (oldCached.includes("photo-1542601906990") || oldCached.includes("Bà Y Thị"))) {
        localStorage.removeItem("vinguoingheo_cases");
      }
    } catch {}

    // Truy vấn dữ liệu thực tế từ Hệ Thống máy chủ
    fetch("/api/v1/welfare")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const serverCases = Array.isArray(res.data.cases) ? res.data.cases : [];
          const serverGifts = Array.isArray(res.data.gifts) ? res.data.gifts : [];
          setCases(serverCases);
          setGiftBatches(serverGifts);
          try {
            localStorage.setItem("vinguoingheo_cases", JSON.stringify(serverCases));
            localStorage.setItem("vinguoingheo_gifts", JSON.stringify(serverGifts));
          } catch {}
        }
      })
      .catch((err) => console.warn("Không thể tải dữ liệu an sinh từ API máy chủ:", err));
  }, []);

  // Lưu dữ liệu vĩnh viễn vào Hệ Thống máy chủ (Backend + Database/JSON File)
  const updateCases = async (newCases: WelfareCase[]) => {
    setCases(newCases);
    try {
      localStorage.setItem("vinguoingheo_cases", JSON.stringify(newCases));
    } catch {}

    try {
      setIsSaving(true);
      const res = await fetch("/api/v1/welfare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases: newCases }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Đã lưu vào hệ thống máy chủ vĩnh viễn!");
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err) {
      console.error("Lỗi lưu hoàn cảnh vào hệ thống:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateGifts = async (newGifts: GiftBatch[]) => {
    setGiftBatches(newGifts);
    try {
      localStorage.setItem("vinguoingheo_gifts", JSON.stringify(newGifts));
    } catch {}

    try {
      setIsSaving(true);
      const res = await fetch("/api/v1/welfare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gifts: newGifts }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Đã lưu vào hệ thống máy chủ vĩnh viễn!");
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err) {
      console.error("Lỗi lưu đợt trao quà vào hệ thống:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Xử lý Hoàn cảnh ---
  const handleOpenAddCase = () => {
    setEditingCaseId(null);
    setCaseForm({
      recipientName: "",
      village: "Buôn A",
      situation: "",
      targetAmount: 50000000,
      currentAmount: 0,
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    });
    setIsCaseModalOpen(true);
  };

  const handleOpenEditCase = (item: WelfareCase) => {
    setEditingCaseId(item.id);
    setCaseForm({
      recipientName: item.recipientName,
      village: item.village,
      situation: item.situation,
      targetAmount: item.targetAmount,
      currentAmount: item.currentAmount,
      imageUrl: item.imageUrl,
    });
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.recipientName.trim()) return;

    if (editingCaseId !== null) {
      // Cập nhật
      const updated = cases.map((c) =>
        c.id === editingCaseId ? { ...c, ...caseForm } : c
      );
      updateCases(updated);
    } else {
      // Tạo mới
      const newCase: WelfareCase = {
        id: Date.now(),
        ...caseForm,
      };
      updateCases([newCase, ...cases]);
    }
    setIsCaseModalOpen(false);
  };

  const handleDeleteCase = (id: number) => {
    if (window.confirm("Quý vị có chắc chắn muốn xóa hoàn cảnh khó khăn này?")) {
      const updated = cases.filter((c) => c.id !== id);
      updateCases(updated);
    }
  };

  // --- Xử lý Đợt trao quà ---
  const handleOpenAddGift = () => {
    setEditingGiftId(null);
    setGiftForm({
      title: "",
      village: "Buôn A",
      recipientCount: 1,
      amount: 5000000,
      date: new Date().toISOString().split("T")[0],
      proofNote: "Biên bản bàn giao có xác nhận của UBMTTQ xã Ea Súp",
    });
    setIsGiftModalOpen(true);
  };

  const handleOpenEditGift = (item: GiftBatch) => {
    setEditingGiftId(item.id);
    setGiftForm({
      title: item.title,
      village: item.village,
      recipientCount: item.recipientCount,
      amount: item.amount,
      date: item.date,
      proofNote: item.proofNote,
    });
    setIsGiftModalOpen(true);
  };

  const handleSaveGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftForm.title.trim()) return;

    if (editingGiftId !== null) {
      const updated = giftBatches.map((g) =>
        g.id === editingGiftId ? { ...g, ...giftForm } : g
      );
      updateGifts(updated);
    } else {
      const newGift: GiftBatch = {
        id: Date.now(),
        ...giftForm,
      };
      updateGifts([newGift, ...giftBatches]);
    }
    setIsGiftModalOpen(false);
  };

  const handleDeleteGift = (id: number) => {
    if (window.confirm("Quý vị có chắc chắn muốn xóa đợt trao quà này?")) {
      const updated = giftBatches.filter((g) => g.id !== id);
      updateGifts(updated);
    }
  };

  // Khôi phục mặc định
  // Xóa toàn bộ dữ liệu mẫu cũ để bắt đầu cập nhật dữ liệu thực tế
  const handleClearAllData = async () => {
    if (
      window.confirm(
        "CẢNH BÁO XÓA DỮ LIỆU RÁC:\n\nQuý vị có chắc chắn muốn XÓA SẠCH TOÀN BỘ dữ liệu mẫu cũ (Bà Y Thị, bò giống, v.v.) để bắt đầu nhập dữ liệu thực tế mới?\n\nThao tác này sẽ làm sạch hoàn toàn hệ thống và trình duyệt."
      )
    ) {
      try {
        setIsSaving(true);
        const res = await fetch("/api/v1/welfare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clear_all" }),
        });
        const resData = await res.json();
        if (resData.success) {
          setCases([]);
          setGiftBatches([]);
          try {
            localStorage.removeItem("vinguoingheo_cases");
            localStorage.removeItem("vinguoingheo_gifts");
          } catch {}
          setSaveStatus("Đã xóa sạch toàn bộ dữ liệu mẫu cũ!");
          setTimeout(() => setSaveStatus(null), 5000);
        }
      } catch (e) {
        console.error("Lỗi xóa dữ liệu:", e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleResetDefaults = async () => {
    handleClearAllData();
  };

  return (
    <section id="an-sinh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Phân Hệ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-rose-100 pb-3 sm:pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              <span>An Sinh Xã Hội 20 Thôn Buôn</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hoàn Cảnh Khó Khăn &amp; Các Đợt Trao Quà Thực Tế
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
              Khảo sát trực tiếp từ 20 thôn buôn. Mọi khoản giải ngân đều có biên bản nghiệm thu và chứng từ mộc đỏ.
            </p>
          </div>

          {/* Tab Chuyển Đổi */}
          <div className="grid grid-cols-2 sm:inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("CASES")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all text-center ${
                activeTab === "CASES"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hoàn cảnh cần giúp ({cases.length})
            </button>
            <button
              onClick={() => setActiveTab("GIFTS")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all text-center ${
                activeTab === "GIFTS"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đợt trao quà ({giftBatches.length})
            </button>
          </div>
        </div>

        {/* Thanh công cụ dành cho Cán bộ Quản trị khi ĐÃ ĐĂNG NHẬP ADMIN */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-900 block">
                  Quyền Quản Trị Cán Bộ UBMTTQ Xã Ea Súp
                </span>
                <span className="text-[11px] text-slate-600">
                  Bạn đang đăng nhập admin: có toàn quyền thêm mới, sửa và xóa thông tin.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {saveStatus && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveStatus}</span>
                </div>
              )}
              {isSaving && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs animate-in fade-in">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu vào hệ thống...</span>
                </div>
              )}

              {activeTab === "CASES" ? (
                <button
                  type="button"
                  onClick={handleOpenAddCase}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo hoàn cảnh mới</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAddGift}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo đợt trao quà mới</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearAllData}
                title="Xóa toàn bộ dữ liệu mẫu cũ"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa sạch dữ liệu mẫu cũ</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Các Hoàn Cảnh Cần Giúp Đỡ */}
        {activeTab === "CASES" && (
          cases.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-rose-100 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                  Hệ thống đã dọn sạch toàn bộ dữ liệu mẫu cũ
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Hiện chưa có hoàn cảnh nào. Quý Cán bộ hãy bấm nút <strong>&quot;Tạo hoàn cảnh mới&quot;</strong> ở trên để bắt đầu cập nhật hồ sơ các hộ gia đình thực tế từ 20 thôn buôn.
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddCase}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo hoàn cảnh thực tế đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {cases.map((item) => {
              const percent = Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100));
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-rose-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
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

                      {/* Nút Sửa / Xóa cho Admin trên từng thẻ */}
                      {isAdmin && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCase(item)}
                            className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs"
                            title="Chỉnh sửa hoàn cảnh này"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCase(item.id)}
                            className="p-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs"
                            title="Xóa hoàn cảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {item.recipientName}
                        </h3>
                        {isAdmin && (
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold border border-rose-200">
                            Có thể sửa
                          </span>
                        )}
                      </div>
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

                  <div className="p-4 bg-rose-50/40 border-t border-rose-100 flex items-center gap-2">
                    <a
                      href="#dong-gop"
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs shadow-xs transition-all"
                    >
                      Ủng hộ hoàn cảnh này
                    </a>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditCase(item)}
                        className="py-2 px-3 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                      >
                        Sửa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

        {/* Tab 2: Các Đợt Trao Quà An Sinh Đã Giải Ngân */}
        {activeTab === "GIFTS" && (
          giftBatches.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-rose-100 text-center space-y-2">
              <Gift className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Chưa ghi nhận đợt giải ngân nào</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Mọi khoản chi cứu trợ thực tế kèm biên bản nghiệm thu và chứng từ mộc đỏ sẽ được công khai minh bạch tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {giftBatches.map((gift) => (
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
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({gift.recipientCount} hộ thụ hưởng)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{gift.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{gift.proofNote}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-base sm:text-lg font-extrabold text-rose-700 font-mono">
                        -{formatVND(gift.amount)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Chứng từ mộc đỏ đầy đủ</span>
                      </span>
                    </div>

                    {/* Nút Sửa / Xóa đợt trao quà cho Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleOpenEditGift(gift)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                          title="Chỉnh sửa đợt trao quà"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGift(gift.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                          title="Xóa đợt trao quà"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ================= MODAL CHỈNH SỬA / TẠO MỚI HOÀN CẢNH ================= */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingCaseId ? "Chỉnh Sửa Hoàn Cảnh Khó Khăn" : "Tạo Hoàn Cảnh Khó Khăn Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên đối tượng / Hộ gia đình: *
                </label>
                <input
                  type="text"
                  required
                  value={caseForm.recipientName}
                  onChange={(e) => setCaseForm({ ...caseForm, recipientName: e.target.value })}
                  placeholder="Ví dụ: Hộ bà H'Nghê, Hộ ông Triệu Văn Long..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Thôn / Buôn: *
                  </label>
                  <select
                    value={caseForm.village}
                    onChange={(e) => setCaseForm({ ...caseForm, village: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 bg-white font-medium"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Mục tiêu vận động (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="1000000"
                    step="1000000"
                    required
                    value={caseForm.targetAmount}
                    onChange={(e) =>
                      setCaseForm({ ...caseForm, targetAmount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Số tiền đã vận động được (VNĐ):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={caseForm.currentAmount}
                  onChange={(e) =>
                    setCaseForm({ ...caseForm, currentAmount: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mô tả hoàn cảnh khó khăn: *
                </label>
                <textarea
                  rows={3}
                  required
                  value={caseForm.situation}
                  onChange={(e) => setCaseForm({ ...caseForm, situation: e.target.value })}
                  placeholder="Ghi rõ hoàn cảnh gia đình, bệnh tật, nhà ở dột nát, con nhỏ..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Đường dẫn ảnh chụp thực tế (URL hoặc ảnh nội bộ):
                </label>
                <input
                  type="text"
                  value={caseForm.imageUrl}
                  onChange={(e) => setCaseForm({ ...caseForm, imageUrl: e.target.value })}
                  placeholder="/images/hero-charity-bg.jpg hoặc https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCaseId ? "Lưu thay đổi" : "Tạo hoàn cảnh"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA / TẠO MỚI ĐỢT TRAO QUÀ ================= */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingGiftId ? "Chỉnh Sửa Đợt Trao Quà Giải Ngân" : "Tạo Đợt Trao Quà Giải Ngân Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGift} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tiêu đề đợt trao quà / giải ngân: *
                </label>
                <input
                  type="text"
                  required
                  value={giftForm.title}
                  onChange={(e) => setGiftForm({ ...giftForm, title: e.target.value })}
                  placeholder="Ví dụ: Trao tặng bò giống sinh sản, Hỗ trợ xây nhà ĐĐK đợt 1..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Thôn / Buôn: *
                  </label>
                  <select
                    value={giftForm.village}
                    onChange={(e) => setGiftForm({ ...giftForm, village: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 bg-white font-medium"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số hộ / người thụ hưởng: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={giftForm.recipientCount}
                    onChange={(e) =>
                      setGiftForm({ ...giftForm, recipientCount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số tiền giải ngân (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="500000"
                    required
                    value={giftForm.amount}
                    onChange={(e) =>
                      setGiftForm({ ...giftForm, amount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Ngày thực hiện: *
                  </label>
                  <input
                    type="date"
                    required
                    value={giftForm.date}
                    onChange={(e) => setGiftForm({ ...giftForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Chứng từ / Biên bản nghiệm thu: *
                </label>
                <input
                  type="text"
                  required
                  value={giftForm.proofNote}
                  onChange={(e) => setGiftForm({ ...giftForm, proofNote: e.target.value })}
                  placeholder="Ví dụ: Biên bản bàn giao có chữ ký Trưởng ban CTMT, Hóa đơn VAT..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingGiftId ? "Lưu thay đổi" : "Tạo đợt trao quà"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
