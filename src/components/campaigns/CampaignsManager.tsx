"use client";

import { useState, useEffect } from "react";
import { formatVND, buildVietQRUrl } from "@/lib/utils";
import { CampaignItem } from "@/lib/campaigns";
import {
  Heart,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  QrCode,
  Copy,
  Check,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  Sparkles,
  Layers
} from "lucide-react";

const VILLAGES = [
  "Xã Ea Súp",
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

const PRESET_DONATION_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

interface CampaignsManagerProps {
  initialCampaigns: CampaignItem[];
}

export default function CampaignsManager({ initialCampaigns }: CampaignsManagerProps) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modal Chi Tiết Hoàn Cảnh (Khi người dùng click vào card)
  const [detailCampaign, setDetailCampaign] = useState<CampaignItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Modal Quyên Góp VietQR
  const [donateCampaign, setDonateCampaign] = useState<CampaignItem | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(200000);
  const [customAmountInput, setCustomAmountInput] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal Thêm / Chỉnh Sửa Cho Admin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<CampaignItem, "id">>({
    code: "",
    title: "",
    beneficiaryName: "Đồng bào khó khăn",
    village: "Xã Ea Súp",
    situation: "",
    targetAmount: 100000000,
    currentAmount: 0,
    status: "ACTIVE",
    images: ["/images/hero-charity-bg.jpg"],
  });
  const [newImageUrl, setNewImageUrl] = useState("");

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

  // Tải dữ liệu từ máy chủ API
  const reloadData = async () => {
    try {
      const res = await fetch("/api/v1/campaigns");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách chiến dịch:", err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // --- Handlers Admin ---
  const handleOpenAdd = () => {
    setEditingId(null);
    const nextCode = `CD-${campaigns.length + 1}`;
    setFormData({
      code: nextCode,
      title: "",
      beneficiaryName: "Đồng bào khó khăn",
      village: "Xã Ea Súp",
      situation: "",
      targetAmount: 100000000,
      currentAmount: 0,
      status: "ACTIVE",
      images: ["/images/hero-charity-bg.jpg"],
    });
    setNewImageUrl("");
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: CampaignItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(item.id);
    setFormData({
      code: item.code,
      title: item.title,
      beneficiaryName: item.beneficiaryName,
      village: item.village,
      situation: item.situation,
      targetAmount: item.targetAmount,
      currentAmount: item.currentAmount,
      status: item.status,
      images: item.images && item.images.length > 0 ? [...item.images] : ["/images/hero-charity-bg.jpg"],
    });
    setNewImageUrl("");
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Quý vị có chắc chắn muốn xóa hoàn cảnh / chiến dịch này khỏi hệ thống?")) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
        setSaveStatus("Đã xóa hoàn cảnh khỏi hệ thống máy chủ!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi xóa chiến dịch:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Khôi phục toàn bộ danh mục chiến dịch / hoàn cảnh về dữ liệu chuẩn của hệ thống?")) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
        setSaveStatus("Đã khôi phục dữ liệu chuẩn hệ thống!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi reset chiến dịch:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Thêm ảnh vào form (tối đa 5 ảnh)
  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (formData.images.length >= 5) {
      alert("Đã đạt tối đa 5 hình ảnh cho hoàn cảnh này!");
      return;
    }
    setFormData({
      ...formData,
      images: [...formData.images, url],
    });
    setNewImageUrl("");
  };

  // Xóa ảnh khỏi form
  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      alert("Cần giữ lại ít nhất 1 hình ảnh đại diện!");
      return;
    }
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  // Lưu form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSaving(true);
      const payload = {
        action: editingId ? "update" : "create",
        campaign: editingId ? { ...formData, id: editingId } : formData,
      };
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (resData.success) {
        setCampaigns(resData.data);
        setIsEditModalOpen(false);
        setSaveStatus("Đã lưu vào hệ thống máy chủ vĩnh viễn!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi lưu chiến dịch:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers Xem Chi Tiết & Quyên Góp ---
  const handleOpenDetail = (item: CampaignItem) => {
    setDetailCampaign(item);
    setSelectedImageIndex(0);
  };

  const handleOpenDonate = (item: CampaignItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDonateCampaign(item);
    setDonateAmount(200000);
    setCustomAmountInput("");
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Tính số tiền và URL QR VietQR
  const effectiveAmount = customAmountInput ? parseInt(customAmountInput.replace(/\D/g, "") || "0") : donateAmount;
  const cleanCode = donateCampaign?.code ? donateCampaign.code.replace(/[^A-Za-z0-9]/g, "") : "CHUNG";
  const memoText = `VNN ${cleanCode}`.toUpperCase();

  const qrUrl = buildVietQRUrl({
    amount: effectiveAmount,
    memo: memoText,
    accountNumber: "8630100930",
    accountName: "UY BAN MTTQ VN XA EA SUP",
  });

  return (
    <div className="space-y-8">
      {/* Thanh công cụ Quản Trị Cán Bộ */}
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
                Toàn quyền thêm mới, xóa, chỉnh sửa thông tin chi tiết và ảnh hoàn cảnh khó khăn.
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

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo hoàn cảnh mới</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Khôi phục dữ liệu chuẩn hệ thống"
              className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-100 text-slate-600 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lưới Danh Sách Các Chiến Dịch / Hoàn Cảnh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {campaigns.map((item) => {
          const target = Number(item.targetAmount) || 1;
          const current = Number(item.currentAmount) || 0;
          const percent = Math.min(100, Math.round((current / target) * 100));
          const isCompleted = item.status === "COMPLETED" || percent >= 100;
          const mainImage = item.images && item.images.length > 0 ? item.images[0] : "/images/hero-charity-bg.jpg";
          const imageCount = item.images ? item.images.length : 1;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Ảnh hoàn cảnh */}
                <div className="relative aspect-[16/10] overflow-hidden bg-rose-50">
                  <img
                    src={mainImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge trạng thái */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm ${
                        isCompleted ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      {isCompleted ? "Đã đạt mục tiêu" : "Đang quyên góp"}
                    </span>

                    {/* Số lượng ảnh */}
                    {imageCount > 1 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/70 text-white backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{imageCount} ảnh</span>
                      </span>
                    )}
                  </div>

                  {/* Mã định danh */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-rose-200 backdrop-blur-sm">
                      #{item.code}
                    </span>

                    {/* Nút Sửa / Xóa cho Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs"
                          title="Chỉnh sửa hoàn cảnh"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs"
                          title="Xóa hoàn cảnh"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nội dung tóm tắt */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.village || "Xã Ea Súp"}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{item.beneficiaryName || "Đồng bào khó khăn"}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.situation}
                  </p>
                </div>
              </div>

              {/* Phần chân Card: Tiến độ & Nút ủng hộ */}
              <div className="p-5 pt-0 space-y-3">
                {/* Thanh tiến độ */}
                <div className="space-y-1.5 pt-2 border-t border-rose-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Đã vận động:</span>
                    <span className="font-bold text-rose-700">{formatVND(current)}</span>
                  </div>

                  <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-pink-500 to-rose-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tiến độ: <strong className="text-slate-800">{percent}%</strong></span>
                    <span>Mục tiêu: <strong className="text-slate-800">{formatVND(target)}</strong></span>
                  </div>
                </div>

                {/* Các nút bấm */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(item);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenDonate(item, e)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-sm shadow-rose-200 transition-all cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Ủng hộ ngay</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL CHI TIẾT HOÀN CẢNH (KHI BẤM VÀO CARD SẼ HIỆN NHIỀU NỘI DUNG)    */}
      {/* ========================================================================= */}
      {detailCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-current" />
                <h3 className="font-bold text-sm sm:text-base line-clamp-1">
                  Thông Tin Hoàn Cảnh &amp; Chiến Dịch Cần Giúp Đỡ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailCampaign(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chi tiết cuộn được */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Gallery tối đa 5 hình ảnh */}
              {detailCampaign.images && detailCampaign.images.length > 0 && (
                <div className="space-y-2">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                    <img
                      src={detailCampaign.images[selectedImageIndex] || detailCampaign.images[0]}
                      alt={detailCampaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs backdrop-blur-xs font-mono">
                      Ảnh {selectedImageIndex + 1} / {detailCampaign.images.length}
                    </div>
                  </div>

                  {/* Danh sách thumbnail */}
                  {detailCampaign.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {detailCampaign.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                            selectedImageIndex === idx
                              ? "border-rose-600 ring-2 ring-rose-200 scale-105"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Thẻ định danh & tiêu đề */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    #{detailCampaign.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      detailCampaign.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {detailCampaign.status === "COMPLETED" ? "Đã đạt mục tiêu" : "Đang kêu gọi quyên góp"}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {detailCampaign.title}
                </h2>
              </div>

              {/* Thông tin Đối tượng & Địa chỉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Đối tượng thụ hưởng:</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {detailCampaign.beneficiaryName || "Đồng bào khó khăn"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Địa chỉ sinh sống:</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {detailCampaign.village || "Xã Ea Súp"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiến độ tài chính */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Mục tiêu vận động:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatVND(detailCampaign.targetAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Số tiền đã tiếp nhận:</span>
                  <span className="font-extrabold text-rose-600 font-mono text-sm sm:text-base">
                    {formatVND(detailCampaign.currentAmount)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((Number(detailCampaign.currentAmount) / Number(detailCampaign.targetAmount || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mô tả hoàn cảnh chi tiết */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <Info className="w-4 h-4 text-rose-600" />
                  <span>Nội dung hoàn cảnh gia đình:</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {detailCampaign.situation}
                </div>
              </div>
            </div>

            {/* Footer Modal: Giữ nút bấm ủng hộ để liên kết với QR chuyển tiền */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDetailCampaign(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetItem = detailCampaign;
                  setDetailCampaign(null);
                  handleOpenDonate(targetItem);
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Ủng hộ hoàn cảnh này (Chuyển khoản VietQR)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL VIETQR CHUYỂN TIỀN LIÊN KẾT ĐÚNG HOÀN CẢNH                      */}
      {/* ========================================================================= */}
      {donateCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Ủng Hộ Chuyển Khoản VietQR</h3>
                  <span className="text-[11px] text-rose-100 block">
                    Khắc phục nghèo bền vững • Minh bạch 100%
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDonateCampaign(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Tên hoàn cảnh */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[11px] text-rose-700 font-semibold block uppercase">Hoàn cảnh thụ hưởng:</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm block line-clamp-1">
                  {donateCampaign.title}
                </span>
                <span className="text-[11px] text-slate-500">
                  {donateCampaign.village} • {donateCampaign.beneficiaryName}
                </span>
              </div>

              {/* Ảnh mã QR */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-dashed border-rose-200 space-y-2">
                <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt="VietQR BIDV Ea Súp"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[11px] text-slate-500 text-center font-medium">
                  Mở ứng dụng Ngân hàng hoặc Ví điện tử bất kỳ để quét mã
                </span>
              </div>

              {/* Chọn số tiền quyên góp */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[11px]">
                  Chọn số tiền ủng hộ (VNĐ):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_DONATION_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDonateAmount(amt);
                        setCustomAmountInput("");
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        !customAmountInput && donateAmount === amt
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-rose-50"
                      }`}
                    >
                      {formatVND(amt).replace(" ₫", "đ")}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Hoặc nhập số tiền khác tùy tâm..."
                  value={customAmountInput}
                  onChange={(e) => setCustomAmountInput(e.target.value)}
                  className="w-full p-2 mt-1 rounded-xl border border-slate-300 font-mono text-xs focus:border-rose-500 font-medium"
                />
              </div>

              {/* Thông tin tài khoản & Cú pháp sao chép */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Số tài khoản BIDV Ea Súp:</span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">8630100930</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("8630100930", "stk")}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "stk" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "stk" ? "Đã chép" : "Chép STK"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Nội dung chuyển khoản (Đã gán mã CD):</span>
                    <span className="font-mono font-bold text-rose-600 text-xs sm:text-sm">{memoText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(memoText, "memo")}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "memo" ? "Đã chép" : "Chép mã"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDonateCampaign(null)}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-200 transition-colors"
                >
                  Hoàn tất chuyển khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL THÊM / CHỈNH SỬA CHO ADMIN (QUẢN LÝ TỐI ĐA 5 ẢNH)                */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingId ? "Chỉnh Sửa Hoàn Cảnh Khó Khăn" : "Tạo Mới Hoàn Cảnh Khó Khăn"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tiêu đề */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tiêu đề hoàn cảnh / chiến dịch: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Xây dựng Nhà Đại đoàn kết hộ bà Y Thị..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              {/* Mã & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Mã chiến dịch:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CD-1, CD-2..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Trạng thái:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 bg-white font-medium"
                  >
                    <option value="ACTIVE">Đang quyên góp</option>
                    <option value="COMPLETED">Đã đạt mục tiêu</option>
                  </select>
                </div>
              </div>

              {/* Đối tượng & Địa chỉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Đối tượng thụ hưởng: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    placeholder="Ví dụ: Hộ bà Y Thị, 10 hộ nghèo..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Địa chỉ (Thôn / Buôn): *
                  </label>
                  <select
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 bg-white font-medium"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mục tiêu & Đã vận động */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Mục tiêu vận động (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="1000000"
                    step="1000000"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số tiền hiện đã vận động (VNĐ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-mono font-medium"
                  />
                </div>
              </div>

              {/* Hoàn cảnh chi tiết */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mô tả hoàn cảnh khó khăn chi tiết: *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="Ghi rõ hoàn cảnh gia đình, nhân khẩu, bệnh tật, nhà ở dột nát, tư liệu sản xuất..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium leading-relaxed"
                />
              </div>

              {/* Quản lý danh sách hình ảnh (TỐI ĐA 5 HÌNH ẢNH) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-rose-900 uppercase text-[11px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hình ảnh thực tế (Tối đa 5 ảnh):</span>
                  </label>
                  <span className="text-[11px] font-bold text-rose-700">
                    {formData.images.length}/5 ảnh
                  </span>
                </div>

                {/* Danh sách ảnh đã thêm */}
                <div className="grid grid-cols-5 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-rose-300 group">
                      <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                        title="Xóa ảnh này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                        {idx === 0 ? "Ảnh bìa" : `Ảnh ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ô thêm ảnh mới nếu chưa đủ 5 ảnh */}
                {formData.images.length < 5 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="/images/hero-charity-bg.jpg hoặc https://..."
                      className="flex-1 p-2 rounded-xl border border-slate-300 focus:border-rose-500 font-mono text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      + Thêm ảnh
                    </button>
                  </div>
                )}
                <span className="text-[10px] text-slate-500 block">
                  Gợi ý: Quý vị có thể dùng đường dẫn nội bộ như <code>/images/hero-charity-bg.jpg</code> hoặc link ảnh HTTPS trên mạng.
                </span>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? "Lưu thay đổi" : "Tạo hoàn cảnh mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
