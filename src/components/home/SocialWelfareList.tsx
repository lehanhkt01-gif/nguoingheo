"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload,
  File,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Copy,
  QrCode,
  DollarSign
} from "lucide-react";

export interface WelfareFileItem {
  url: string;
  name: string;
  type: "image" | "pdf";
  size?: number;
}

export interface WelfareCase {
  id: number;
  recipientName: string;
  village: string;
  situation: string;
  amount: number; // "Số tiền trao"
  targetAmount?: number;
  currentAmount?: number;
  imageUrl?: string;
  files?: WelfareFileItem[];
  createdAt?: string;
}

export interface GiftBatch {
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

export default function SocialWelfareList() {
  const [activeTab, setActiveTab] = useState<"CASES" | "GIFTS">("CASES");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Danh sách dữ liệu
  const [cases, setCases] = useState<WelfareCase[]>([]);
  const [giftBatches, setGiftBatches] = useState<GiftBatch[]>([]);

  // Modal Chi tiết mở rộng hoàn cảnh
  const [detailCase, setDetailCase] = useState<WelfareCase | null>(null);
  const [activePreviewImg, setActivePreviewImg] = useState<string>("");

  // Modal Ủng hộ qua VietQR cho từng hoàn cảnh
  const [donateCase, setDonateCase] = useState<WelfareCase | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(200000);
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Modal Tạo / Sửa Hoàn cảnh
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caseForm, setCaseForm] = useState<{
    recipientName: string;
    village: string;
    situation: string;
    amount: number;
    imageUrl: string;
    files: WelfareFileItem[];
  }>({
    recipientName: "",
    village: "Buôn A",
    situation: "",
    amount: 5000000,
    imageUrl: "",
    files: [],
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

  // Tải dữ liệu chuẩn từ Hệ Thống máy chủ Backend
  useEffect(() => {
    try {
      const oldCached = localStorage.getItem("vinguoingheo_cases");
      if (oldCached && (oldCached.includes("photo-1542601906990") || oldCached.includes("Bà Y Thị"))) {
        localStorage.removeItem("vinguoingheo_cases");
      }
    } catch {}

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

  // Lưu hoàn cảnh vào Backend
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

  // Lưu đợt trao quà vào Backend
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

  // Mở modal tạo mới hoàn cảnh
  const handleOpenAddCase = () => {
    setEditingCaseId(null);
    setUploadError(null);
    setCaseForm({
      recipientName: "",
      village: "Buôn A",
      situation: "",
      amount: 5000000,
      imageUrl: "",
      files: [],
    });
    setIsCaseModalOpen(true);
  };

  // Mở modal sửa hoàn cảnh
  const handleOpenEditCase = (item: WelfareCase) => {
    setEditingCaseId(item.id);
    setUploadError(null);
    const amountVal = item.amount !== undefined ? item.amount : (item.currentAmount || 0);
    setCaseForm({
      recipientName: item.recipientName,
      village: item.village,
      situation: item.situation,
      amount: amountVal,
      imageUrl: item.imageUrl || "",
      files: Array.isArray(item.files) ? item.files : [],
    });
    setIsCaseModalOpen(true);
  };

  // Xử lý upload ảnh / file PDF (tối đa 5 file)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFiles = caseForm.files || [];
    if (currentFiles.length + selectedFiles.length > 5) {
      alert(`Hệ thống chỉ cho phép tải lên tối đa 5 file (ảnh hoặc PDF chứng từ). Hiện tại đã có ${currentFiles.length} file.`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedItems: WelfareFileItem[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.file) {
          uploadedItems.push(data.file);
        } else {
          throw new Error(data.error || `Lỗi tải tệp: ${file.name}`);
        }
      }

      const updatedFiles = [...currentFiles, ...uploadedItems].slice(0, 5);

      // Nếu chưa có ảnh đại diện, lấy ảnh đầu tiên trong danh sách file làm ảnh đại diện
      let newImageUrl = caseForm.imageUrl;
      if (!newImageUrl) {
        const firstImg = updatedFiles.find((f) => f.type === "image");
        if (firstImg) {
          newImageUrl = firstImg.url;
        }
      }

      setCaseForm((prev) => ({
        ...prev,
        files: updatedFiles,
        imageUrl: newImageUrl,
      }));
    } catch (err: any) {
      console.error("Lỗi upload file:", err);
      setUploadError(err.message || "Không thể tải tệp lên máy chủ. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setCaseForm((prev) => {
      const removedFile = prev.files[indexToRemove];
      const updatedFiles = prev.files.filter((_, idx) => idx !== indexToRemove);
      let newImageUrl = prev.imageUrl;
      if (removedFile?.url === prev.imageUrl) {
        const nextImg = updatedFiles.find((f) => f.type === "image");
        newImageUrl = nextImg ? nextImg.url : "";
      }
      return {
        ...prev,
        files: updatedFiles,
        imageUrl: newImageUrl,
      };
    });
  };

  const handleSetCoverImage = (url: string) => {
    setCaseForm((prev) => ({ ...prev, imageUrl: url }));
  };

  // Lưu hoàn cảnh (Tạo mới hoặc Sửa)
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.recipientName.trim()) return;

    const resolvedImageUrl =
      caseForm.imageUrl.trim() ||
      caseForm.files.find((f) => f.type === "image")?.url ||
      "";

    if (editingCaseId !== null) {
      const updated = cases.map((c) =>
        c.id === editingCaseId
          ? {
              ...c,
              recipientName: caseForm.recipientName.trim(),
              village: caseForm.village,
              situation: caseForm.situation.trim(),
              amount: Number(caseForm.amount) || 0,
              imageUrl: resolvedImageUrl,
              files: caseForm.files,
            }
          : c
      );
      updateCases(updated);
    } else {
      const newCase: WelfareCase = {
        id: Date.now(),
        recipientName: caseForm.recipientName.trim(),
        village: caseForm.village,
        situation: caseForm.situation.trim(),
        amount: Number(caseForm.amount) || 0,
        imageUrl: resolvedImageUrl,
        files: caseForm.files,
        createdAt: new Date().toISOString(),
      };
      updateCases([newCase, ...cases]);
    }
    setIsCaseModalOpen(false);
  };

  const handleDeleteCase = (id: number) => {
    if (window.confirm("Quý vị có chắc chắn muốn xóa hoàn cảnh khó khăn này?")) {
      const updated = cases.filter((c) => c.id !== id);
      updateCases(updated);
      if (detailCase?.id === id) {
        setDetailCase(null);
      }
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

  // Xóa sạch toàn bộ dữ liệu cũ
  const handleClearAllData = async () => {
    if (
      window.confirm(
        "CẢNH BÁO XÓA DỮ LIỆU RÁC:\n\nQuý vị có chắc chắn muốn XÓA SẠCH TOÀN BỘ dữ liệu mẫu cũ để bắt đầu nhập dữ liệu thực tế mới?\n\nThao tác này sẽ làm sạch hoàn toàn hệ thống và trình duyệt."
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

  // Mở modal xem chi tiết
  const handleOpenDetail = (c: WelfareCase) => {
    setDetailCase(c);
    const firstImg = c.imageUrl || c.files?.find((f) => f.type === "image")?.url || "";
    setActivePreviewImg(firstImg);
  };

  // Mở modal ủng hộ VietQR
  const handleOpenDonate = (c: WelfareCase) => {
    setDonateCase(c);
    setDonateAmount(200000);
    setCopiedStk(false);
    setCopiedMemo(false);
  };

  const copyToClipboard = (text: string, type: "stk" | "memo") => {
    navigator.clipboard.writeText(text);
    if (type === "stk") {
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2500);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2500);
    }
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
              Hồ Sơ Hoàn Cảnh Khó Khăn &amp; Các Đợt Trao Quà Thực Tế
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
              Khảo sát trực tiếp từ 20 thôn buôn xã Ea Súp. Lưu trữ hình ảnh và hồ sơ chứng từ PDF minh bạch. Bấm vào từng hoàn cảnh để xem đầy đủ thông tin.
            </p>
          </div>

          {/* Tab Chuyển Đổi */}
          <div className="grid grid-cols-2 sm:inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("CASES")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all text-center cursor-pointer ${
                activeTab === "CASES"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hoàn cảnh cần giúp ({cases.length})
            </button>
            <button
              onClick={() => setActiveTab("GIFTS")}
              className={`px-2 sm:px-4 py-2 rounded-lg transition-all text-center cursor-pointer ${
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
                  Bạn đang đăng nhập admin: có toàn quyền thêm mới, sửa, upload ảnh, chứng từ PDF và xóa thông tin.
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
                  Hệ thống đã sẵn sàng nhập dữ liệu thực tế
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Hiện chưa có hoàn cảnh nào. Quý Cán bộ hãy bấm nút <strong>&quot;Tạo hoàn cảnh mới&quot;</strong> ở trên để cập nhật thông tin, số tiền trao, kèm tải lên hình ảnh và tệp PDF chứng từ thực tế từ 20 thôn buôn.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {cases.map((item) => {
                const amountValue = item.amount !== undefined ? item.amount : (item.currentAmount || 0);
                const coverImage = item.imageUrl || item.files?.find((f) => f.type === "image")?.url || "";
                const fileCount = item.files?.length || 0;
                const pdfCount = item.files?.filter((f) => f.type === "pdf").length || 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-rose-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <div>
                      {/* Ảnh bìa & Thông tin vị trí */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={item.recipientName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-rose-50/30">
                            <ImageIcon className="w-10 h-10 stroke-1 mb-1 text-rose-300" />
                            <span className="text-[11px] font-medium text-slate-500">Chưa có ảnh bìa</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 flex items-center gap-1 shadow-xs">
                          <MapPin className="w-3 h-3" />
                          <span>{item.village}</span>
                        </div>

                        {/* File badge nếu có đính kèm file */}
                        {fileCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1 shadow-xs">
                            <FileText className="w-3 h-3 text-rose-300" />
                            <span>{fileCount} tệp lưu trữ {pdfCount > 0 ? `(${pdfCount} PDF)` : ""}</span>
                          </div>
                        )}

                        {/* Nút Sửa / Xóa cho Admin trên từng thẻ */}
                        {isAdmin && (
                          <div
                            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEditCase(item)}
                              className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                              title="Chỉnh sửa hoàn cảnh này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCase(item.id)}
                              className="p-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                              title="Xóa hoàn cảnh này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Nội dung thông tin tóm tắt */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-rose-600 transition-colors">
                            {item.recipientName}
                          </h3>
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold border border-rose-200">
                            Chi tiết &raquo;
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.situation}
                        </p>

                        {/* Số tiền trao */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                            Số tiền trao:
                          </span>
                          <span className="font-extrabold text-rose-600 font-mono text-base">
                            {formatVND(amountValue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div
                      className="p-3 bg-rose-50/40 border-t border-rose-100 flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenDonate(item)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Ủng hộ hoàn cảnh này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="py-2 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem đủ</span>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditCase(item)}
                          className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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
              <p className="text-sm font-semibold text-slate-700">Chưa ghi nhận đợt trao quà nào</p>
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
                        Đã trao quà thực tế
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
                        {formatVND(gift.amount)}
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
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Chỉnh sửa đợt trao quà"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGift(gift.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* ================= MODAL XEM CHI TIẾT MỞ RỘNG (ĐẦY ĐỦ THÔNG TIN) ================= */}
      {detailCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">
                    {detailCase.recipientName}
                  </h3>
                  <p className="text-rose-100 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{detailCase.village}, Xã Ea Súp</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chi tiết cuộn được */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Thẻ số tiền trao nổi bật */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                    Số tiền trao
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                    {formatVND(detailCase.amount !== undefined ? detailCase.amount : (detailCase.currentAmount || 0))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã xác minh UBMTTQ
                  </span>
                </div>
              </div>

              {/* Mô tả hoàn cảnh đầy đủ */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Mô tả hoàn cảnh gia đình:
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {detailCase.situation}
                </div>
              </div>

              {/* Hình ảnh và Thư viện ảnh */}
              {(() => {
                const imgFiles = detailCase.files?.filter((f) => f.type === "image") || [];
                const allImages = [...(detailCase.imageUrl ? [detailCase.imageUrl] : []), ...imgFiles.map((f) => f.url)];
                const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));
                const currentPreview = activePreviewImg || uniqueImages[0] || "";

                if (uniqueImages.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hình ảnh thực tế ({uniqueImages.length} ảnh):</span>
                    </h4>

                    {/* Preview ảnh lớn */}
                    {currentPreview && (
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                        <img
                          src={currentPreview}
                          alt={detailCase.recipientName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Danh sách ảnh thu nhỏ nếu có nhiều hơn 1 ảnh */}
                    {uniqueImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {uniqueImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePreviewImg(imgUrl)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              currentPreview === imgUrl ? "border-rose-600 scale-105 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Chứng từ / File PDF đính kèm */}
              {(() => {
                const pdfFiles = detailCase.files?.filter((f) => f.type === "pdf") || [];
                if (pdfFiles.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>Chứng từ xác nhận &amp; Hồ sơ lưu trữ ({pdfFiles.length} file PDF):</span>
                    </h4>
                    <div className="space-y-2">
                      {pdfFiles.map((pdf, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                              PDF
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-semibold text-slate-800 block truncate">
                                {pdf.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Chứng từ lưu trữ bền vững trên máy chủ
                              </span>
                            </div>
                          </div>
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                          >
                            <span>Xem / Tải PDF</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Đóng lại
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = detailCase;
                  setDetailCase(null);
                  handleOpenDonate(target);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Ủng hộ hoàn cảnh này (VietQR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ỦNG HỘ VIETQR TỰ ĐỘNG THEO TỪNG HOÀN CẢNH ================= */}
      {donateCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Ủng Hộ Hoàn Cảnh Khó Khăn</h3>
                  <p className="text-[11px] text-rose-100">
                    {donateCase.recipientName} - {donateCase.village}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDonateCase(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Chọn mức ủng hộ nhanh */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2 text-[11px]">
                  Chọn số tiền ủng hộ (VNĐ):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[100000, 200000, 500000, 1000000, 2000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmount(amt)}
                      className={`py-2 px-1 rounded-xl font-mono font-bold text-xs transition-all border cursor-pointer ${
                        donateAmount === amt
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300"
                      }`}
                    >
                      {formatVND(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mã VietQR tạo động theo số tiền và tên đối tượng */}
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-200 flex flex-col items-center text-center">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 max-w-[220px]">
                  <img
                    src={`https://img.vietqr.io/image/970418-8630100930-compact2.png?amount=${donateAmount}&addInfo=${encodeURIComponent(`VNN ${donateCase.recipientName}`)}&accountName=UBMTTQVN%20XA%20EA%20SUP`}
                    alt="Mã VietQR Chuyển Khoản"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Quét mã bằng ứng dụng ngân hàng bất kỳ để chuyển tiền tự động đúng cú pháp.
                </p>
              </div>

              {/* Thông tin tài khoản tiếp nhận chính thức */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-medium">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-900">BIDV Ea Súp - Đắk Lắk</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-600 text-sm">8630100930</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("8630100930", "stk")}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedStk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900 text-[11px]">UBMTTQVN XÃ EA SÚP</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-700 text-xs">VNN {donateCase.recipientName}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`VNN ${donateCase.recipientName}`, "memo")}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedMemo ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDonateCase(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Đã hoàn tất / Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CHỈNH SỬA / TẠO MỚI HOÀN CẢNH ================= */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Form */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingCaseId ? "Chỉnh Sửa Hoàn Cảnh Khó Khăn" : "Tạo Hoàn Cảnh Khó Khăn Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form inputs */}
            <form onSubmit={handleSaveCase} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
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
                    Số tiền trao (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    required
                    value={caseForm.amount}
                    onChange={(e) =>
                      setCaseForm({ ...caseForm, amount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono"
                  />
                </div>
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

              {/* KHU VỰC TẢI LÊN ẢNH VÀ CHỨNG TỪ PDF (TỐI ĐA 5 FILE) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-rose-900 uppercase text-[11px]">
                    Hình ảnh &amp; Chứng từ (File PDF) - Tối đa 5 file:
                  </label>
                  <span className="text-[11px] font-bold text-rose-600 font-mono">
                    {caseForm.files.length}/5 file
                  </span>
                </div>

                {/* Nút bấm tải lên */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading || caseForm.files.length >= 5}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || caseForm.files.length >= 5}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      caseForm.files.length >= 5
                        ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isUploading
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-rose-300 bg-white hover:bg-rose-50 text-rose-700 shadow-2xs"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải tệp lên hệ thống máy chủ...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-rose-600" />
                        <span>
                          {caseForm.files.length >= 5
                            ? "Đã đạt tối đa 5 file"
                            : "Up ảnh, chứng từ (file PDF) vào hệ thống"}
                        </span>
                      </>
                    )}
                  </button>

                  {uploadError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">
                      ⚠️ {uploadError}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    Hỗ trợ tệp ảnh (JPG, PNG, WEBP) và chứng từ PDF (tối đa 15MB/tệp). Toàn bộ dữ liệu được lưu trữ vĩnh viễn trong máy chủ hệ thống.
                  </p>
                </div>

                {/* Danh sách các file đã upload */}
                {caseForm.files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {caseForm.files.map((file, idx) => {
                      const isCover = file.url === caseForm.imageUrl;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-[11px]"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {file.type === "image" ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                PDF
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block truncate">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {file.type === "image" ? "Ảnh chụp" : "Tài liệu PDF"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.type === "image" && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(file.url)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                  isCover
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                                }`}
                              >
                                {isCover ? "Ảnh đại diện" : "Đặt làm bìa"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Xóa tệp này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Nhập URL ảnh thủ công (tùy chọn dự phòng) */}
                <div className="pt-2 border-t border-rose-200/60">
                  <label className="block font-semibold text-slate-600 text-[10px] mb-1">
                    Hoặc nhập trực tiếp URL đường dẫn ảnh:
                  </label>
                  <input
                    type="text"
                    value={caseForm.imageUrl}
                    onChange={(e) => setCaseForm({ ...caseForm, imageUrl: e.target.value })}
                    placeholder="https://... hoặc đường dẫn nội bộ"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:border-rose-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingGiftId ? "Chỉnh Sửa Đợt Trao Quà Thực Tế" : "Tạo Đợt Trao Quà Thực Tế Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGift} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tiêu đề đợt trao quà: *
                </label>
                <input
                  type="text"
                  required
                  value={giftForm.title}
                  onChange={(e) => setGiftForm({ ...giftForm, title: e.target.value })}
                  placeholder="Ví dụ: Trao tặng quà cứu trợ đợt 1, Hỗ trợ xây nhà ĐĐK..."
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
                    Số tiền trao (VNĐ): *
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
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200 cursor-pointer"
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
