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
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Copy,
  QrCode,
  DollarSign,
  Calendar,
  Users,
  Check
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
  villages?: string[];
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
  villages?: string[];
  recipientCount: number;
  amount: number;
  date: string;
  proofNote: string;
  imageUrl?: string;
  files?: WelfareFileItem[];
  createdAt?: string;
}

const VILLAGES_LIST = [
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
  const [activeCasePreviewImg, setActiveCasePreviewImg] = useState<string>("");

  // Modal Chi tiết mở rộng Đợt trao quà
  const [detailGift, setDetailGift] = useState<GiftBatch | null>(null);
  const [activeGiftPreviewImg, setActiveGiftPreviewImg] = useState<string>("");

  // Modal Ủng hộ qua VietQR cho từng hoàn cảnh
  const [donateCase, setDonateCase] = useState<WelfareCase | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(200000);
  const [copiedStk, setCopiedStk] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Modal Tạo / Sửa Hoàn cảnh
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  const [isUploadingCase, setIsUploadingCase] = useState(false);
  const [uploadErrorCase, setUploadErrorCase] = useState<string | null>(null);
  const caseFileInputRef = useRef<HTMLInputElement>(null);

  const [caseForm, setCaseForm] = useState<{
    recipientName: string;
    village: string;
    villages: string[];
    situation: string;
    amount: number;
    imageUrl: string;
    files: WelfareFileItem[];
  }>({
    recipientName: "",
    village: "Buôn A",
    villages: ["Buôn A"],
    situation: "",
    amount: 5000000,
    imageUrl: "",
    files: [],
  });

  // Modal Tạo / Sửa Đợt trao quà
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<number | null>(null);
  const [isUploadingGift, setIsUploadingGift] = useState(false);
  const [uploadErrorGift, setUploadErrorGift] = useState<string | null>(null);
  const giftFileInputRef = useRef<HTMLInputElement>(null);

  const [giftForm, setGiftForm] = useState<{
    title: string;
    villages: string[];
    recipientCount: number;
    amount: number;
    date: string;
    proofNote: string;
    imageUrl: string;
    files: WelfareFileItem[];
  }>({
    title: "",
    villages: ["Buôn A"],
    recipientCount: 1,
    amount: 5000000,
    date: new Date().toISOString().split("T")[0],
    proofNote: "Biên bản bàn giao có xác nhận của UBMTTQ xã Ea Súp",
    imageUrl: "",
    files: [],
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

  // Tải dữ liệu từ Backend
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
        setSaveStatus("Đã lưu hoàn cảnh vào hệ thống máy chủ vĩnh viễn!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi lưu hoàn cảnh:", err);
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
        setSaveStatus("Đã lưu đợt trao quà vào hệ thống máy chủ vĩnh viễn!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi lưu đợt trao quà:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers Hoàn Cảnh ---
  const handleOpenAddCase = () => {
    setEditingCaseId(null);
    setUploadErrorCase(null);
    setCaseForm({
      recipientName: "",
      village: "Buôn A",
      villages: ["Buôn A"],
      situation: "",
      amount: 5000000,
      imageUrl: "",
      files: [],
    });
    setIsCaseModalOpen(true);
  };

  const handleOpenEditCase = (item: WelfareCase) => {
    setEditingCaseId(item.id);
    setUploadErrorCase(null);
    const amountVal = item.amount !== undefined ? item.amount : (item.currentAmount || 0);
    const resolvedVillages =
      Array.isArray(item.villages) && item.villages.length > 0
        ? item.villages
        : item.village
        ? item.village.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Buôn A"];

    setCaseForm({
      recipientName: item.recipientName,
      village: item.village || resolvedVillages.join(", "),
      villages: resolvedVillages,
      situation: item.situation,
      amount: amountVal,
      imageUrl: item.imageUrl || "",
      files: Array.isArray(item.files) ? item.files : [],
    });
    setIsCaseModalOpen(true);
  };

  const handleToggleCaseVillage = (vName: string) => {
    setCaseForm((prev) => {
      const exists = prev.villages.includes(vName);
      let updated: string[];
      if (exists) {
        updated = prev.villages.filter((v) => v !== vName);
        if (updated.length === 0) updated = [vName]; // giữ ít nhất 1
      } else {
        updated = [...prev.villages, vName];
      }
      return {
        ...prev,
        villages: updated,
        village: updated.join(", "),
      };
    });
  };

  const handleSelectAllCaseVillages = () => {
    setCaseForm((prev) => ({
      ...prev,
      villages: [...VILLAGES_LIST],
      village: "Tất cả các thôn (20 thôn buôn)",
    }));
  };

  const handleToggleAllCaseVillages = () => {
    setCaseForm((prev) => {
      if (prev.villages.length === VILLAGES_LIST.length) {
        return { ...prev, villages: ["Buôn A"], village: "Buôn A" };
      } else {
        return { ...prev, villages: [...VILLAGES_LIST], village: "Tất cả các thôn (20 thôn buôn)" };
      }
    });
  };

  const handleClearAllCaseVillages = () => {
    setCaseForm((prev) => ({ ...prev, villages: [], village: "" }));
  };

  const handleCaseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFiles = caseForm.files || [];
    if (currentFiles.length + selectedFiles.length > 5) {
      alert(`Hệ thống chỉ cho phép tải lên tối đa 5 file (ảnh hoặc PDF). Đang có ${currentFiles.length} file.`);
      e.target.value = "";
      return;
    }

    setIsUploadingCase(true);
    setUploadErrorCase(null);

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
          throw new Error(data.error || data.message || `Lỗi tải: ${file.name}`);
        }
      }

      const updatedFiles = [...currentFiles, ...uploadedItems].slice(0, 5);
      let newImageUrl = caseForm.imageUrl;
      if (!newImageUrl) {
        const firstImg = updatedFiles.find((f) => f.type === "image");
        if (firstImg) newImageUrl = firstImg.url;
      }

      setCaseForm((prev) => ({
        ...prev,
        files: updatedFiles,
        imageUrl: newImageUrl,
      }));
    } catch (err: any) {
      console.error("Lỗi upload hoàn cảnh:", err);
      setUploadErrorCase(err.message || "Không thể tải tệp lên máy chủ.");
    } finally {
      setIsUploadingCase(false);
      e.target.value = "";
    }
  };

  const handleRemoveCaseFile = (indexToRemove: number) => {
    setCaseForm((prev) => {
      const removed = prev.files[indexToRemove];
      const updated = prev.files.filter((_, idx) => idx !== indexToRemove);
      let newImg = prev.imageUrl;
      if (removed?.url === prev.imageUrl) {
        const nextImg = updated.find((f) => f.type === "image");
        newImg = nextImg ? nextImg.url : "";
      }
      return { ...prev, files: updated, imageUrl: newImg };
    });
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.recipientName.trim()) return;

    const resolvedVillage =
      caseForm.villages.length > 0 ? caseForm.villages.join(", ") : caseForm.village || "Buôn A";
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
              village: resolvedVillage,
              villages: caseForm.villages,
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
        village: resolvedVillage,
        villages: caseForm.villages,
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
      if (detailCase?.id === id) setDetailCase(null);
    }
  };

  // --- Handlers Đợt Trao Quà Thực Tế (GiftBatch) ---
  const handleOpenAddGift = () => {
    setEditingGiftId(null);
    setUploadErrorGift(null);
    setGiftForm({
      title: "",
      villages: ["Buôn A"],
      recipientCount: 1,
      amount: 5000000,
      date: new Date().toISOString().split("T")[0],
      proofNote: "Biên bản bàn giao có xác nhận của UBMTTQ xã Ea Súp",
      imageUrl: "",
      files: [],
    });
    setIsGiftModalOpen(true);
  };

  const handleOpenEditGift = (item: GiftBatch) => {
    setEditingGiftId(item.id);
    setUploadErrorGift(null);
    const resolvedVillages =
      Array.isArray(item.villages) && item.villages.length > 0
        ? item.villages
        : item.village
        ? item.village.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Buôn A"];

    setGiftForm({
      title: item.title,
      villages: resolvedVillages,
      recipientCount: item.recipientCount || 1,
      amount: item.amount || 0,
      date: item.date || new Date().toISOString().split("T")[0],
      proofNote: item.proofNote || "Biên bản bàn giao có xác nhận của UBMTTQ xã Ea Súp",
      imageUrl: item.imageUrl || "",
      files: Array.isArray(item.files) ? item.files : [],
    });
    setIsGiftModalOpen(true);
  };

  const handleToggleGiftVillage = (vName: string) => {
    setGiftForm((prev) => {
      const exists = prev.villages.includes(vName);
      let updated: string[];
      if (exists) {
        updated = prev.villages.filter((v) => v !== vName);
        if (updated.length === 0) updated = [vName]; // giữ ít nhất 1
      } else {
        updated = [...prev.villages, vName];
      }
      return {
        ...prev,
        villages: updated,
      };
    });
  };

  const handleSelectAllGiftVillages = () => {
    setGiftForm((prev) => ({
      ...prev,
      villages: [...VILLAGES_LIST],
    }));
  };

  const handleToggleAllGiftVillages = () => {
    setGiftForm((prev) => {
      if (prev.villages.length === VILLAGES_LIST.length) {
        return { ...prev, villages: ["Buôn A"] };
      } else {
        return { ...prev, villages: [...VILLAGES_LIST] };
      }
    });
  };

  const handleClearAllGiftVillages = () => {
    setGiftForm((prev) => ({ ...prev, villages: [] }));
  };

  const handleGiftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFiles = giftForm.files || [];
    if (currentFiles.length + selectedFiles.length > 5) {
      alert(`Hệ thống chỉ cho phép tải lên tối đa 5 file (ảnh hoặc PDF). Đang có ${currentFiles.length} file.`);
      e.target.value = "";
      return;
    }

    setIsUploadingGift(true);
    setUploadErrorGift(null);

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
          throw new Error(data.error || data.message || `Lỗi tải tệp: ${file.name}`);
        }
      }

      const updatedFiles = [...currentFiles, ...uploadedItems].slice(0, 5);
      let newImageUrl = giftForm.imageUrl;
      if (!newImageUrl) {
        const firstImg = updatedFiles.find((f) => f.type === "image");
        if (firstImg) newImageUrl = firstImg.url;
      }

      setGiftForm((prev) => ({
        ...prev,
        files: updatedFiles,
        imageUrl: newImageUrl,
      }));
    } catch (err: any) {
      console.error("Lỗi upload đợt trao quà:", err);
      setUploadErrorGift(err.message || "Không thể tải tệp lên máy chủ.");
    } finally {
      setIsUploadingGift(false);
      e.target.value = "";
    }
  };

  const handleRemoveGiftFile = (indexToRemove: number) => {
    setGiftForm((prev) => {
      const removed = prev.files[indexToRemove];
      const updated = prev.files.filter((_, idx) => idx !== indexToRemove);
      let newImg = prev.imageUrl;
      if (removed?.url === prev.imageUrl) {
        const nextImg = updated.find((f) => f.type === "image");
        newImg = nextImg ? nextImg.url : "";
      }
      return { ...prev, files: updated, imageUrl: newImg };
    });
  };

  const handleSaveGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftForm.title.trim()) return;

    const resolvedVillage =
      giftForm.villages.length === VILLAGES_LIST.length
        ? "Toàn xã (20 thôn buôn)"
        : giftForm.villages.join(", ");

    const resolvedImageUrl =
      giftForm.imageUrl.trim() ||
      giftForm.files.find((f) => f.type === "image")?.url ||
      "";

    if (editingGiftId !== null) {
      const updated = giftBatches.map((g) =>
        g.id === editingGiftId
          ? {
              ...g,
              title: giftForm.title.trim(),
              village: resolvedVillage,
              villages: giftForm.villages,
              recipientCount: Number(giftForm.recipientCount) || 1,
              amount: Number(giftForm.amount) || 0,
              date: giftForm.date,
              proofNote: giftForm.proofNote.trim(),
              imageUrl: resolvedImageUrl,
              files: giftForm.files,
            }
          : g
      );
      updateGifts(updated);
    } else {
      const newGift: GiftBatch = {
        id: Date.now(),
        title: giftForm.title.trim(),
        village: resolvedVillage,
        villages: giftForm.villages,
        recipientCount: Number(giftForm.recipientCount) || 1,
        amount: Number(giftForm.amount) || 0,
        date: giftForm.date,
        proofNote: giftForm.proofNote.trim(),
        imageUrl: resolvedImageUrl,
        files: giftForm.files,
        createdAt: new Date().toISOString(),
      };
      updateGifts([newGift, ...giftBatches]);
    }
    setIsGiftModalOpen(false);
  };

  const handleDeleteGift = (id: number) => {
    if (window.confirm("Quý vị có chắc chắn muốn xóa đợt trao quà này?")) {
      const updated = giftBatches.filter((g) => g.id !== id);
      updateGifts(updated);
      if (detailGift?.id === id) setDetailGift(null);
    }
  };

  // Mở modal xem chi tiết
  const handleOpenCaseDetail = (c: WelfareCase) => {
    setDetailCase(c);
    const firstImg = c.imageUrl || c.files?.find((f) => f.type === "image")?.url || "";
    setActiveCasePreviewImg(firstImg);
  };

  const handleOpenGiftDetail = (g: GiftBatch) => {
    setDetailGift(g);
    const firstImg = g.imageUrl || g.files?.find((f) => f.type === "image")?.url || "";
    setActiveGiftPreviewImg(firstImg);
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
              Khảo sát trực tiếp từ 20 thôn buôn xã Ea Súp. Ảnh thumbnail hiển thị rõ nét, bấm vào để mở rộng xem trọn vẹn hình ảnh và biên bản nghiệm thu PDF.
            </p>
          </div>

          {/* Tab Chuyển Đổi */}
          <div className="grid grid-cols-2 sm:inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold w-full sm:w-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("CASES")}
              className={`px-2.5 sm:px-4 py-2 rounded-lg transition-all text-center font-bold cursor-pointer shadow-xs ${
                activeTab === "CASES"
                  ? "bg-rose-600 text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              CẦN GIÚP ĐỠ ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("GIFTS")}
              className={`px-2.5 sm:px-4 py-2 rounded-lg transition-all text-center font-bold cursor-pointer shadow-xs ${
                activeTab === "GIFTS"
                  ? "bg-rose-600 text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              ĐÃ TRAO/GIẢI NGÂN ({giftBatches.length})
            </button>
          </div>
        </div>

        {/* Thanh công cụ Cán bộ Quản trị khi ĐÃ ĐĂNG NHẬP */}
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
                  Toàn quyền thêm mới, sửa, chọn nhiều thôn buôn, upload ảnh &amp; chứng từ PDF tối đa 5 file.
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
            </div>
          </div>
        )}

        {/* TAB 1: CÁC HOÀN CẢNH KHÓ KHĂN CẦN GIÚP ĐỠ */}
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
                  Hiện chưa có hoàn cảnh nào. Quý Cán bộ hãy bấm nút <strong>&quot;Tạo hoàn cảnh mới&quot;</strong> ở trên để cập nhật thông tin hộ gia đình, số tiền trao, kèm tải lên ảnh và tệp PDF chứng từ.
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
                    onClick={() => handleOpenCaseDetail(item)}
                  >
                    <div>
                      {/* Ảnh Thumbnail hoàn cảnh */}
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

                        {/* Địa chỉ Thôn & Huy hiệu CẦN GIÚP ĐỠ */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 max-w-[80%] flex-wrap">
                          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 flex items-center gap-1 shadow-xs truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.village}</span>
                          </div>
                          <div className="bg-rose-600 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs tracking-wider uppercase flex items-center gap-1 shrink-0">
                            <Heart className="w-2.5 h-2.5 fill-white shrink-0" />
                            <span>CẦN GIÚP ĐỠ</span>
                          </div>
                        </div>

                        {fileCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1 shadow-xs">
                            <FileText className="w-3 h-3 text-rose-300" />
                            <span>{fileCount} tệp {pdfCount > 0 ? `(${pdfCount} PDF)` : ""}</span>
                          </div>
                        )}

                        {isAdmin && (
                          <div
                            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEditCase(item)}
                              className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCase(item.id)}
                              className="p-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Nội dung tóm tắt */}
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

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                            Số tiền dự kiến vận động:
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
                        onClick={() => handleOpenCaseDetail(item)}
                        className="py-2 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem đủ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* TAB 2: CÁC ĐỢT TRAO QUÀ THỰC TẾ (CÓ ẢNH THUMBNAIL, CHỌN NHIỀU THÔN, BẤM VÀO HIỆN RỘNG CHI TIẾT) */}
        {activeTab === "GIFTS" && (
          giftBatches.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-rose-100 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <Gift className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                  Chưa ghi nhận đợt trao quà nào
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Mọi khoản trao quà cứu trợ thực tế kèm ảnh chụp và biên bản nghiệm thu có xác nhận của UBMTTQ xã Ea Súp sẽ được lưu trữ minh bạch tại đây.
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddGift}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo đợt trao quà đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {giftBatches.map((gift) => {
                const coverImage = gift.imageUrl || gift.files?.find((f) => f.type === "image")?.url || "";
                const fileCount = gift.files?.length || 0;
                const pdfCount = gift.files?.filter((f) => f.type === "pdf").length || 0;

                return (
                  <div
                    key={gift.id}
                    onClick={() => handleOpenGiftDetail(gift)}
                    className="bg-white rounded-2xl border border-rose-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* ẢNH THUMBNAIL BÊN NGOÀI ĐƯỢC UP LÊN */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={gift.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-rose-50 to-pink-50/40">
                            <Gift className="w-10 h-10 stroke-1 mb-1 text-rose-400" />
                            <span className="text-[11px] font-medium text-slate-500">Đợt trao quà thực tế</span>
                          </div>
                        )}

                        {/* Địa chỉ Thôn & Huy hiệu ĐÃ TRAO/GIẢI NGÂN */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 max-w-[80%] flex-wrap">
                          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-emerald-600" />
                            <span className="truncate">{gift.village}</span>
                          </div>
                          <div className="bg-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs tracking-wider uppercase flex items-center gap-1 shrink-0">
                            <Gift className="w-2.5 h-2.5 text-white shrink-0" />
                            <span>ĐÃ TRAO/GIẢI NGÂN</span>
                          </div>
                        </div>

                        {/* Badge số file */}
                        {fileCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1 shadow-xs">
                            <FileText className="w-3 h-3 text-rose-300" />
                            <span>{fileCount} tệp {pdfCount > 0 ? `(${pdfCount} PDF)` : ""}</span>
                          </div>
                        )}

                        {/* Nút sửa xóa cho Admin */}
                        {isAdmin && (
                          <div
                            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEditGift(gift)}
                              className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                              title="Chỉnh sửa đợt trao quà"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGift(gift.id)}
                              className="p-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                              title="Xóa đợt trao quà"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Nội dung đợt trao quà */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Đã trao quà thực tế
                          </span>
                          <span className="text-slate-400 text-xs font-mono">• {formatDate(gift.date)}</span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-rose-600 transition-colors">
                          {gift.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-rose-500" />
                            <span>{gift.recipientCount} hộ thụ hưởng</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{gift.proofNote}</span>
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                            Số tiền trao:
                          </span>
                          <span className="font-extrabold text-rose-700 font-mono text-base">
                            {formatVND(gift.amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div
                      className="p-3 bg-rose-50/40 border-t border-rose-100 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mộc đỏ đầy đủ</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenGiftDetail(gift)}
                        className="py-1.5 px-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem đủ nội dung &amp; ảnh</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ================= MODAL XEM CHI TIẾT MỞ RỘNG HOÀN CẢNH KHÓ KHĂN ================= */}
      {detailCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
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

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                    Số tiền dự kiến vận động
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

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Mô tả hoàn cảnh gia đình:
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {detailCase.situation}
                </div>
              </div>

              {/* Thư viện hình ảnh */}
              {(() => {
                const imgFiles = detailCase.files?.filter((f) => f.type === "image") || [];
                const allImages = [...(detailCase.imageUrl ? [detailCase.imageUrl] : []), ...imgFiles.map((f) => f.url)];
                const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));
                const currentPreview = activeCasePreviewImg || uniqueImages[0] || "";

                if (uniqueImages.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hình ảnh thực tế ({uniqueImages.length} ảnh):</span>
                    </h4>

                    {currentPreview && (
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                        <img src={currentPreview} alt={detailCase.recipientName} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 flex items-center gap-1 shadow-xs">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{detailCase.village}</span>
                          </div>
                          <div className="bg-rose-600 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs tracking-wider uppercase flex items-center gap-1">
                            <Heart className="w-2.5 h-2.5 fill-white shrink-0" />
                            <span>CẦN GIÚP ĐỠ</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {uniqueImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {uniqueImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCasePreviewImg(imgUrl)}
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

              {/* Danh sách PDF */}
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
                              <span className="text-xs font-semibold text-slate-800 block truncate">{pdf.name}</span>
                              <span className="text-[10px] text-slate-400">Lưu trữ vĩnh viễn trên máy chủ</span>
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

      {/* ================= MODAL XEM CHI TIẾT MỞ RỘNG ĐỢT TRAO QUÀ (ĐẦY ĐỦ HÌNH ẢNH & NỘI DUNG) ================= */}
      {detailGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">
                    {detailGift.title}
                  </h3>
                  <p className="text-rose-100 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{detailGift.village}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailGift(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Thẻ số tiền và quy mô */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                    Số tiền trao thực tế
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
                    {formatVND(detailGift.amount)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Quy mô đợt trao:</span>
                    <span className="font-bold text-slate-900">{detailGift.recipientCount} hộ thụ hưởng</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1 border-t border-slate-200">
                    <span>Ngày thực hiện:</span>
                    <span className="font-mono text-slate-800">{formatDate(detailGift.date)}</span>
                  </div>
                </div>
              </div>

              {/* Danh sách các thôn buôn thụ hưởng */}
              <div className="space-y-1.5">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Địa bàn thôn / buôn thụ hưởng:</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(detailGift.villages && detailGift.villages.length > 0
                    ? detailGift.villages
                    : detailGift.village.split(",").map((s) => s.trim())
                  ).map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chứng từ / Biên bản nghiệm thu */}
              <div className="space-y-1.5">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Biên bản nghiệm thu &amp; Chứng từ mộc đỏ:</span>
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  {detailGift.proofNote}
                </div>
              </div>

              {/* Thư viện hình ảnh của đợt trao quà */}
              {(() => {
                const imgFiles = detailGift.files?.filter((f) => f.type === "image") || [];
                const allImages = [...(detailGift.imageUrl ? [detailGift.imageUrl] : []), ...imgFiles.map((f) => f.url)];
                const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));
                const currentPreview = activeGiftPreviewImg || uniqueImages[0] || "";

                if (uniqueImages.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hình ảnh thực tế đợt trao quà ({uniqueImages.length} ảnh):</span>
                    </h4>

                    {currentPreview && (
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                        <img src={currentPreview} alt={detailGift.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs">
                            <MapPin className="w-3 h-3 shrink-0 text-emerald-600" />
                            <span>{detailGift.village}</span>
                          </div>
                          <div className="bg-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs tracking-wider uppercase flex items-center gap-1">
                            <Gift className="w-2.5 h-2.5 text-white shrink-0" />
                            <span>ĐÃ TRAO/GIẢI NGÂN</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {uniqueImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {uniqueImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveGiftPreviewImg(imgUrl)}
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

              {/* Danh sách file PDF chứng từ của đợt trao quà */}
              {(() => {
                const pdfFiles = detailGift.files?.filter((f) => f.type === "pdf") || [];
                if (pdfFiles.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hồ sơ chứng từ PDF đính kèm ({pdfFiles.length} file):</span>
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
                              <span className="text-xs font-semibold text-slate-800 block truncate">{pdf.name}</span>
                              <span className="text-[10px] text-slate-400">Chứng từ lưu trữ vĩnh viễn trên máy chủ</span>
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setDetailGift(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ỦNG HỘ VIETQR TỰ ĐỘNG ================= */}
      {donateCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
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
                      title="Sao chép STK"
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

      {/* ================= MODAL TẠO / SỬA HOÀN CẢNH KHÓ KHĂN ================= */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
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

              {/* CHỌN NHIỀU THÔN / BUÔN THU NHỎ GỌN GÀNG */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block font-bold text-slate-700 uppercase text-xs">
                    Thôn / Buôn: * (Chọn một hoặc nhiều thôn)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleAllCaseVillages}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        caseForm.villages.length === VILLAGES_LIST.length
                          ? "bg-rose-600 text-white shadow-2xs"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {caseForm.villages.length === VILLAGES_LIST.length && <Check className="w-3 h-3" />}
                      <span>Tất cả (20 thôn)</span>
                    </button>
                    {caseForm.villages.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllCaseVillages}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-red-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {VILLAGES_LIST.map((v) => {
                    const isSelected = caseForm.villages.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleToggleCaseVillage(v)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white font-bold shadow-2xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-rose-300 hover:text-rose-600"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        <span>{v}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  {caseForm.villages.length === VILLAGES_LIST.length
                    ? "✓ Đang chọn: Tất cả các thôn (20 thôn buôn)"
                    : `Đã chọn (${caseForm.villages.length}/20 thôn): ${caseForm.villages.join(", ")}`}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Số tiền dự kiến vận động (VNĐ): *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={caseForm.amount === 0 ? "" : caseForm.amount}
                  onChange={(e) => setCaseForm({ ...caseForm, amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                  placeholder="Nhập số tiền dự kiến vận động (không giới hạn)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono text-sm"
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

              {/* UPLOAD ẢNH VÀ FILE PDF */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-rose-900 uppercase text-[11px]">
                    Hình ảnh &amp; Chứng từ (File PDF) - Tối đa 5 file:
                  </label>
                  <span className="text-[11px] font-bold text-rose-600 font-mono">
                    {caseForm.files.length}/5 file
                  </span>
                </div>

                <div>
                  <input
                    ref={caseFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleCaseFileUpload}
                    className="hidden"
                    disabled={isUploadingCase || caseForm.files.length >= 5}
                  />

                  <button
                    type="button"
                    onClick={() => caseFileInputRef.current?.click()}
                    disabled={isUploadingCase || caseForm.files.length >= 5}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      caseForm.files.length >= 5
                        ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isUploadingCase
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-rose-300 bg-white hover:bg-rose-50 text-rose-700 shadow-2xs"
                    }`}
                  >
                    {isUploadingCase ? (
                      <>
                        <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải tệp lên máy chủ...</span>
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

                  {uploadErrorCase && <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {uploadErrorCase}</p>}
                </div>

                {caseForm.files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {caseForm.files.map((file, idx) => {
                      const isCover = file.url === caseForm.imageUrl;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {file.type === "image" ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-slate-400 absolute" />
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                PDF
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400">{file.type === "image" ? "Ảnh chụp thực tế" : "Chứng từ PDF"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.type === "image" && (
                              <button
                                type="button"
                                onClick={() => setCaseForm((prev) => ({ ...prev, imageUrl: file.url }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                                  isCover
                                    ? "bg-rose-600 text-white shadow-2xs font-bold"
                                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                                }`}
                              >
                                {isCover ? "★ Ảnh bìa ngoài" : "Chọn làm ảnh bìa"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveCaseFile(idx)}
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
              </div>

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

      {/* ================= MODAL TẠO / SỬA ĐỢT TRAO QUÀ THỰC TẾ (HỖ TRỢ CHỌN NHIỀU THÔN & UP ẢNH/PDF) ================= */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-white" />
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
              {/* Tiêu đề */}
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

              {/* CHỌN NHIỀU THÔN / BUÔN THU NHỎ GỌN GÀNG */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block font-bold text-slate-700 uppercase text-xs">
                    Thôn / Buôn: * (Chọn một hoặc nhiều thôn)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleAllGiftVillages}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        giftForm.villages.length === VILLAGES_LIST.length
                          ? "bg-rose-600 text-white shadow-2xs"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {giftForm.villages.length === VILLAGES_LIST.length && <Check className="w-3 h-3" />}
                      <span>Tất cả (20 thôn)</span>
                    </button>
                    {giftForm.villages.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllGiftVillages}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-red-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {VILLAGES_LIST.map((v) => {
                    const isSelected = giftForm.villages.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleToggleGiftVillage(v)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white font-bold shadow-2xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-rose-300 hover:text-rose-600"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        <span>{v}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  {giftForm.villages.length === VILLAGES_LIST.length
                    ? "✓ Đang chọn: Tất cả các thôn (20 thôn buôn)"
                    : `Đã chọn (${giftForm.villages.length}/20 thôn): ${giftForm.villages.join(", ")}`}
                </p>
              </div>

              {/* Số hộ & Số tiền trao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số hộ / người thụ hưởng: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={giftForm.recipientCount}
                    onChange={(e) => setGiftForm({ ...giftForm, recipientCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số tiền trao (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={giftForm.amount === 0 ? "" : giftForm.amount}
                    onChange={(e) => setGiftForm({ ...giftForm, amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                    placeholder="Nhập số tiền bất kỳ (VD: 770000000)..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium font-mono text-sm"
                  />
                </div>
              </div>

              {/* Ngày thực hiện */}
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

              {/* Chứng từ / Biên bản nghiệm thu */}
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

              {/* PHẦN UP HÌNH ẢNH, CHỨNG TỪ (FILE HÌNH ẢNH, PDF TỐI ĐA 5 FILE) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-rose-900 uppercase text-[11px]">
                    Hình ảnh &amp; Chứng từ (File PDF) - Tối đa 5 file:
                  </label>
                  <span className="text-[11px] font-bold text-rose-600 font-mono">
                    {giftForm.files.length}/5 file
                  </span>
                </div>

                <div>
                  <input
                    ref={giftFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleGiftFileUpload}
                    className="hidden"
                    disabled={isUploadingGift || giftForm.files.length >= 5}
                  />

                  <button
                    type="button"
                    onClick={() => giftFileInputRef.current?.click()}
                    disabled={isUploadingGift || giftForm.files.length >= 5}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      giftForm.files.length >= 5
                        ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isUploadingGift
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-rose-300 bg-white hover:bg-rose-50 text-rose-700 shadow-2xs"
                    }`}
                  >
                    {isUploadingGift ? (
                      <>
                        <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải tệp lên hệ thống máy chủ...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-rose-600" />
                        <span>
                          {giftForm.files.length >= 5
                            ? "Đã đạt tối đa 5 file"
                            : "Up ảnh, chứng từ (file PDF) vào hệ thống"}
                        </span>
                      </>
                    )}
                  </button>

                  {uploadErrorGift && <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {uploadErrorGift}</p>}
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ảnh đầu tiên sẽ làm ảnh thumbnail bên ngoài thẻ. Hỗ trợ ảnh JPG, PNG và file tài liệu PDF (tối đa 15MB/file).
                  </p>
                </div>

                {/* Danh sách file đã upload */}
                {giftForm.files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {giftForm.files.map((file, idx) => {
                      const isCover = file.url === giftForm.imageUrl;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {file.type === "image" ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-slate-400 absolute" />
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                PDF
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400">{file.type === "image" ? "Ảnh chụp thực tế" : "Chứng từ PDF"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.type === "image" && (
                              <button
                                type="button"
                                onClick={() => setGiftForm((prev) => ({ ...prev, imageUrl: file.url }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                                  isCover
                                    ? "bg-rose-600 text-white shadow-2xs font-bold"
                                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                                }`}
                              >
                                {isCover ? "★ Ảnh bìa ngoài" : "Chọn làm ảnh bìa"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGiftFile(idx)}
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
              </div>

              {/* Nút lưu */}
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
