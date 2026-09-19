"use client";

import { useState, useEffect, useRef } from "react";
import { formatVND, buildVietQRUrl } from "@/lib/utils";
import { CampaignItem, CampaignFileItem } from "@/lib/campaigns";
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
  Eye,
  ExternalLink,
  Upload,
  FileText,
  DollarSign
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
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns || []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modal Chi Tiết Hoàn Cảnh (Khi người dùng click vào card)
  const [detailCampaign, setDetailCampaign] = useState<CampaignItem | null>(null);
  const [activePreviewImg, setActivePreviewImg] = useState<string>("");

  // Modal Quyên Góp VietQR
  const [donateCampaign, setDonateCampaign] = useState<CampaignItem | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(200000);
  const [customAmountInput, setCustomAmountInput] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal Thêm / Chỉnh Sửa Cho Admin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    beneficiaryName: string;
    village: string;
    situation: string;
    amount: number;
    status: "ACTIVE" | "COMPLETED";
    images: string[];
    files: CampaignFileItem[];
  }>({
    code: "",
    title: "",
    beneficiaryName: "",
    village: "Buôn A",
    situation: "",
    amount: 5000000,
    status: "ACTIVE",
    images: [],
    files: [],
  });
  const [manualImageUrl, setManualImageUrl] = useState("");

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

  // Tải dữ liệu từ máy chủ API & dọn dẹp cache dữ liệu mẫu cũ
  const reloadData = async () => {
    try {
      const res = await fetch("/api/v1/campaigns");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách hoàn cảnh:", err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // --- Handlers Admin ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setUploadError(null);
    const nextCode = `HC-${Date.now().toString().slice(-4)}`;
    setFormData({
      code: nextCode,
      title: "",
      beneficiaryName: "",
      village: "Buôn A",
      situation: "",
      amount: 5000000,
      status: "ACTIVE",
      images: [],
      files: [],
    });
    setManualImageUrl("");
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: CampaignItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(item.id);
    setUploadError(null);
    const amountVal = item.amount !== undefined ? item.amount : (item.currentAmount || 0);
    setFormData({
      code: item.code,
      title: item.title,
      beneficiaryName: item.beneficiaryName,
      village: item.village,
      situation: item.situation,
      amount: amountVal,
      status: item.status,
      images: Array.isArray(item.images) ? [...item.images] : [],
      files: Array.isArray(item.files) ? [...item.files] : [],
    });
    setManualImageUrl("");
    setIsEditModalOpen(true);
  };

  // Upload ảnh và file PDF chứng từ (tối đa 5 file)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFiles = formData.files || [];
    if (currentFiles.length + selectedFiles.length > 5) {
      alert(`Hệ thống chỉ cho phép tải lên tối đa 5 file (ảnh hoặc PDF chứng từ). Hiện tại đã có ${currentFiles.length} file.`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedItems: CampaignFileItem[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const bodyFormData = new FormData();
        bodyFormData.append("file", file);

        const res = await fetch("/api/v1/upload", {
          method: "POST",
          body: bodyFormData,
        });
        const resData = await res.json();
        if (resData.success && resData.file) {
          uploadedItems.push(resData.file);
        } else {
          throw new Error(resData.error || resData.message || `Lỗi tải tệp: ${file.name}`);
        }
      }

      const updatedFiles = [...currentFiles, ...uploadedItems].slice(0, 5);
      const imgUrls = updatedFiles.filter((f) => f.type === "image").map((f) => f.url);

      setFormData((prev) => ({
        ...prev,
        files: updatedFiles,
        images: imgUrls.length > 0 ? imgUrls : prev.images,
      }));
    } catch (err: any) {
      console.error("Lỗi tải tệp lên:", err);
      setUploadError(err.message || "Không thể tải tệp lên hệ thống.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => {
      const updatedFiles = prev.files.filter((_, i) => i !== index);
      const updatedImages = updatedFiles.filter((f) => f.type === "image").map((f) => f.url);
      return {
        ...prev,
        files: updatedFiles,
        images: updatedImages.length > 0 ? updatedImages : prev.images,
      };
    });
  };

  // Thêm ảnh thủ công
  const handleAddManualImage = () => {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (formData.files.length >= 5) {
      alert("Đã đạt tối đa 5 file/hình ảnh cho hoàn cảnh này!");
      return;
    }
    const newFile: CampaignFileItem = {
      url,
      name: `Ảnh ${formData.images.length + 1}`,
      type: "image",
    };
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
      files: [...prev.files, newFile],
    }));
    setManualImageUrl("");
  };

  // Xóa một hoàn cảnh
  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Quý vị có chắc chắn muốn xóa hoàn cảnh này khỏi hệ thống?")) {
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
        if (detailCampaign?.id === id) setDetailCampaign(null);
        setSaveStatus("Đã xóa hoàn cảnh khỏi hệ thống máy chủ!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi xóa hoàn cảnh:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa sạch toàn bộ dữ liệu rác cũ
  const handleClearAll = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO XÓA SẠCH DỮ LIỆU:\n\nQuý vị có chắc chắn muốn XÓA SẠCH TOÀN BỘ dữ liệu mẫu cũ để bắt đầu nhập dữ liệu thực tế mới?"
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns([]);
        setSaveStatus("Đã xóa sạch toàn bộ dữ liệu cũ!");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi xóa toàn bộ dữ liệu:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Lưu form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryName.trim()) return;

    try {
      setIsSaving(true);
      const payloadTitle = formData.title.trim() || `Hỗ trợ ${formData.beneficiaryName} (${formData.village})`;
      const payload = {
        action: editingId ? "update" : "create",
        campaign: {
          ...(editingId ? { id: editingId } : {}),
          ...formData,
          title: payloadTitle,
          amount: Number(formData.amount) || 0,
        },
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
      console.error("Lỗi lưu hoàn cảnh:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = (item: CampaignItem) => {
    setDetailCampaign(item);
    const firstImg = item.images?.[0] || item.files?.find((f) => f.type === "image")?.url || "";
    setActivePreviewImg(firstImg);
  };

  // Mở modal quyên góp VietQR
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

  const effectiveAmount = customAmountInput ? parseInt(customAmountInput.replace(/\D/g, "") || "0") : donateAmount;
  const memoText = donateCampaign?.beneficiaryName
    ? `VNN ${donateCampaign.beneficiaryName}`
    : "VNN UNG HO";

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
                Toàn quyền tạo mới, upload ảnh &amp; file PDF chứng từ, chỉnh sửa số tiền trao và xóa dữ liệu.
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
              onClick={handleClearAll}
              title="Xóa sạch dữ liệu cũ để cập nhật dữ liệu thực tế"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa sạch dữ liệu cũ</span>
            </button>
          </div>
        </div>
      )}

      {/* Lưới Danh Sách Các Hoàn Cảnh Khó Khăn */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-rose-100 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              Hệ thống đã sẵn sàng nhập dữ liệu thực tế
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Hiện chưa có hoàn cảnh nào. Quý Cán bộ hãy bấm nút <strong>&quot;Tạo hoàn cảnh mới&quot;</strong> ở trên để cập nhật thông tin hộ gia đình, số tiền trao, kèm tải lên ảnh và tệp PDF chứng từ lưu trữ bền vững.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo hoàn cảnh thực tế đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {campaigns.map((item) => {
            const amountVal = item.amount !== undefined ? item.amount : (item.currentAmount || 0);
            const mainImage = item.images?.[0] || item.files?.find((f) => f.type === "image")?.url || "";
            const totalFiles = item.files?.length || (item.images?.length || 0);
            const pdfCount = item.files?.filter((f) => f.type === "pdf").length || 0;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Ảnh hoàn cảnh */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-rose-50">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={item.beneficiaryName || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-rose-50/30">
                        <ImageIcon className="w-10 h-10 stroke-1 mb-1 text-rose-300" />
                        <span className="text-[11px] font-medium text-slate-500">Chưa có ảnh bìa</span>
                      </div>
                    )}

                    {/* Vị trí */}
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 flex items-center gap-1 shadow-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{item.village}</span>
                    </div>

                    {/* Badge số file / PDF */}
                    {totalFiles > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1 shadow-xs">
                        <FileText className="w-3 h-3 text-rose-300" />
                        <span>{totalFiles} tệp {pdfCount > 0 ? `(${pdfCount} PDF)` : ""}</span>
                      </div>
                    )}

                    {/* Nút Sửa / Xóa cho Admin */}
                    {isAdmin && (
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                          title="Sửa hoàn cảnh này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                          title="Xóa hoàn cảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thông tin hoàn cảnh */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                        {item.beneficiaryName || item.title}
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
                        {formatVND(amountVal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer thẻ & nút hành động */}
                <div
                  className="p-3 bg-rose-50/40 border-t border-rose-100 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleOpenDonate(item, e)}
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL CHI TIẾT MỞ RỘNG (KHI NGƯỜI DÙNG BẤM VÀO THẺ)                     */}
      {/* ========================================================================= */}
      {detailCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">
                    {detailCampaign.beneficiaryName || detailCampaign.title}
                  </h3>
                  <p className="text-rose-100 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{detailCampaign.village}, Xã Ea Súp</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailCampaign(null)}
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
                    {formatVND(detailCampaign.amount !== undefined ? detailCampaign.amount : (detailCampaign.currentAmount || 0))}
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
                  Mô tả hoàn cảnh khó khăn chi tiết:
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {detailCampaign.situation}
                </div>
              </div>

              {/* Thư viện hình ảnh */}
              {(() => {
                const imgFiles = detailCampaign.files?.filter((f) => f.type === "image").map((f) => f.url) || [];
                const allImgs = Array.from(new Set([...(detailCampaign.images || []), ...imgFiles].filter(Boolean)));
                const currentPreview = activePreviewImg || allImgs[0] || "";

                if (allImgs.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hình ảnh thực tế ({allImgs.length} ảnh):</span>
                    </h4>

                    {currentPreview && (
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                        <img src={currentPreview} alt="Ảnh thực tế" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {allImgs.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {allImgs.map((imgUrl, idx) => (
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
                const pdfFiles = detailCampaign.files?.filter((f) => f.type === "pdf") || [];
                if (pdfFiles.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>Hồ sơ &amp; Chứng từ PDF ({pdfFiles.length} file):</span>
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
                                Lưu trữ vĩnh viễn trên máy chủ
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
                onClick={() => setDetailCampaign(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Đóng lại
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = detailCampaign;
                  setDetailCampaign(null);
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

      {/* ========================================================================= */}
      {/* 2. MODAL QUYÊN GÓP TỰ ĐỘNG VIETQR THEO TỪNG HOÀN CẢNH                     */}
      {/* ========================================================================= */}
      {donateCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Ủng Hộ Hoàn Cảnh Khó Khăn</h3>
                  <p className="text-[11px] text-rose-100">
                    {donateCampaign.beneficiaryName || donateCampaign.title} - {donateCampaign.village}
                  </p>
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
              {/* Chọn mức ủng hộ */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2 text-[11px]">
                  Chọn số tiền ủng hộ (VNĐ):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_DONATION_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDonateAmount(amt);
                        setCustomAmountInput("");
                      }}
                      className={`py-2 px-1 rounded-xl font-mono font-bold text-xs transition-all border cursor-pointer ${
                        donateAmount === amt && !customAmountInput
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300"
                      }`}
                    >
                      {formatVND(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mã VietQR */}
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-200 flex flex-col items-center text-center">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 max-w-[220px]">
                  <img src={qrUrl} alt="Mã VietQR Chuyển Khoản" className="w-full h-auto rounded-lg" />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Mở ứng dụng ngân hàng bất kỳ để quét mã và chuyển tiền tự động đúng cú pháp.
                </p>
              </div>

              {/* Thông tin tài khoản */}
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
                      onClick={() => handleCopy("8630100930", "stk")}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    >
                      {copiedField === "stk" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900 text-[11px]">UB MTTQ VN XA EA SUP</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-700 text-xs">{memoText}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(memoText, "memo")}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    >
                      {copiedField === "memo" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDonateCampaign(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Đã hoàn tất / Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL THÊM / CHỈNH SỬA CHO ADMIN (HỖ TRỢ UPLOAD ẢNH & PDF TỐI ĐA 5 FILE)*/}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
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
              {/* Tên đối tượng */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên đối tượng / Hộ gia đình: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  placeholder="Ví dụ: Hộ bà H'Nghê, Hộ ông Triệu Văn Long..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium"
                />
              </div>

              {/* Địa chỉ & Số tiền trao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Thôn / Buôn: *
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

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Số tiền trao (VNĐ): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-mono font-medium"
                  />
                </div>
              </div>

              {/* Hoàn cảnh chi tiết */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mô tả hoàn cảnh khó khăn: *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="Ghi rõ hoàn cảnh gia đình, bệnh tật, nhà ở dột nát, con nhỏ..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-rose-500 font-medium leading-relaxed"
                />
              </div>

              {/* Quản lý danh sách hình ảnh & chứng từ PDF (TỐI ĐA 5 FILE) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-rose-900 uppercase text-[11px]">
                    Hình ảnh &amp; Chứng từ (File PDF) - Tối đa 5 file:
                  </label>
                  <span className="text-[11px] font-bold text-rose-700 font-mono">
                    {formData.files.length}/5 file
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
                    disabled={isUploading || formData.files.length >= 5}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || formData.files.length >= 5}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      formData.files.length >= 5
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
                          {formData.files.length >= 5
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
                    Hỗ trợ file ảnh và chứng từ PDF (tối đa 15MB/tệp). Toàn bộ dữ liệu được lưu trữ vĩnh viễn trong máy chủ hệ thống.
                  </p>
                </div>

                {/* Danh sách file đã tải lên */}
                {formData.files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formData.files.map((file, idx) => (
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

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa tệp này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ô thêm ảnh thủ công */}
                <div className="pt-2 border-t border-rose-200/60">
                  <label className="block font-semibold text-slate-600 text-[10px] mb-1">
                    Hoặc nhập trực tiếp URL đường dẫn ảnh:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="https://... hoặc đường dẫn nội bộ"
                      className="flex-1 p-2 rounded-lg border border-slate-200 bg-white focus:border-rose-500 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? "Lưu thay đổi" : "Tạo hoàn cảnh"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
