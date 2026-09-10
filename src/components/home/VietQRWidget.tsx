"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { formatVND, buildVietQRUrl } from "@/lib/utils";
import { QrCode, Copy, Check, Heart, Sparkles, Download, ShieldCheck } from "lucide-react";

interface CampaignOption {
  code: string;
  label: string;
}

const CAMPAIGNS: CampaignOption[] = [
  { code: "CHUNG", label: "Quỹ Vì người nghèo xã Ea Súp (Chung 20 thôn buôn)" },
  { code: "NDDK01", label: "Hỗ trợ Xây nhà Đại đoàn kết bà Y Thị - Buôn Drai" },
  { code: "NDDK02", label: "Xóa nhà tạm dột nát hộ ông Nguyễn Văn Sáng - Thôn 5" },
  { code: "SK01", label: "Trao tặng Bò giống sinh kế - Thôn 12 & Thôn 14" },
  { code: "TET", label: "Quà Tết Bính Ngọ vì người nghèo (500 suất quà)" },
  { code: "CT", label: "Cứu trợ y tế đột xuất & bệnh hiểm nghèo" },
];

const PRESET_AMOUNTS = [
  50000, 100000, 200000, 500000, 1000000, 2000000, 5000000
];

export default function VietQRWidget() {
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("CHUNG");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tính toán cú pháp chuyển tiền chuẩn
  const transferMemo = useMemo(() => {
    const prefix = selectedCampaign === "CHUNG" ? "VNN" : `VNN ${selectedCampaign}`;
    const namePart = isAnonymous ? "AN DANH" : donorName.trim() ? donorName.trim() : "UNG HO";
    // Chuyển đổi tên tiếng Việt không dấu cho chuẩn SMS/Banking
    const cleanName = namePart
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .toUpperCase();

    return `${prefix} ${cleanName}`.trim();
  }, [selectedCampaign, isAnonymous, donorName]);

  const effectiveAmount = customAmount ? parseInt(customAmount.replace(/\D/g, "") || "0") : amount;

  // VietQR URL động
  const qrUrl = useMemo(() => {
    return buildVietQRUrl({
      amount: effectiveAmount,
      memo: transferMemo,
      accountNumber: "8630100930",
      accountName: "UY BAN MTTQ VN XA EA SUP",
    });
  }, [effectiveAmount, transferMemo]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <section id="dong-gop" className="py-16 bg-slate-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Tự Động Sinh Mã VietQR Chuẩn NAPAS 247</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đóng Góp Trực Tuyến Vì Người Nghèo Ea Súp
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Hệ thống ngân hàng kết nối Casso sẽ tự động ghi nhận tên và số tiền của bạn lên bảng sao kê minh bạch ngay sau khi chuyển khoản thành công.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Cột trái: Form nhập thông tin */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            {/* 1. Chọn chiến dịch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Chọn nội dung / chiến dịch ủng hộ:
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white"
              >
                {CAMPAIGNS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Chọn số tiền */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Chọn số tiền đóng góp:
                </label>
                <span className="text-sm font-bold text-red-700">
                  {formatVND(effectiveAmount)}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount("");
                    }}
                    className={`py-2 px-2 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                      effectiveAmount === val && !customAmount
                        ? "bg-red-700 text-white border-red-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000} Triệu` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Hoặc nhập số tiền khác tùy tâm (VNĐ)..."
                  value={customAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setCustomAmount(raw ? Number(raw).toLocaleString("vi-VN") : "");
                  }}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* 3. Thông tin người gửi */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Thông tin người ủng hộ:
              </label>
              <div>
                <input
                  type="text"
                  placeholder="Nhập họ tên của bạn (hoặc tên đơn vị, doanh nghiệp)..."
                  disabled={isAnonymous}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>Tôi muốn ủng hộ <strong>Ẩn Danh</strong> (Giấu tên trên bảng sao kê công khai)</span>
                </label>
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Số điện thoại liên hệ (không bắt buộc, để nhận tin nhắn cảm ơn)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Hướng dẫn an toàn */}
            <div className="text-[11px] text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Vui lòng giữ nguyên cú pháp nội dung chuyển tiền để hệ thống Casso tự động phân loại đúng vào quỹ hỗ trợ và hiển thị lên bảng sao kê trực tuyến.
              </span>
            </div>
          </div>

          {/* Cột phải: Khung hiển thị VietQR động */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-red-950 p-6 sm:p-8 text-white flex flex-col items-center justify-between text-center border-t lg:border-t-0 lg:border-l border-slate-800">
            <div className="w-full space-y-2 mb-4">
              <div className="inline-flex items-center gap-1 bg-red-900/60 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-red-700">
                <QrCode className="w-3.5 h-3.5" />
                <span>MÃ VIETQR CHUẨN NAPAS 247</span>
              </div>
              <p className="text-xs text-slate-300">
                Mở ứng dụng ngân hàng bất kỳ để quét mã
              </p>
            </div>

            {/* Khung ảnh QR */}
            <div className="bg-white p-3 rounded-2xl shadow-2xl relative group max-w-[260px] mx-auto">
              <img
                src={qrUrl}
                alt="VietQR BIDV Ea Sup"
                className="w-full h-auto aspect-square object-contain rounded-xl"
              />
              <div className="text-[10px] text-slate-600 text-center mt-2 font-mono font-medium">
                BIDV: 8630100930 • {formatVND(effectiveAmount)}
              </div>
            </div>

            {/* Chi tiết nội dung chuyển khoản & nút sao chép */}
            <div className="w-full space-y-2 mt-4 text-left">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Số tài khoản BIDV:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">8630100930</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("8630100930", "stk")}
                  className="flex items-center gap-1 text-[11px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors text-slate-200"
                >
                  {copiedField === "stk" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "stk" ? "Đã chép" : "Chép"}</span>
                </button>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-slate-400 block text-[10px]">Cú pháp nội dung:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs truncate block">{transferMemo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(transferMemo, "memo")}
                  className="shrink-0 flex items-center gap-1 text-[11px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors text-slate-200"
                >
                  {copiedField === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "memo" ? "Đã chép" : "Chép"}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3">
              Chủ TK: <strong>UY BAN MTTQ VN XA EA SUP</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
