"use client";

import { useState, useMemo } from "react";
import { formatVND, buildVietQRUrl } from "@/lib/utils";
import { QrCode, Copy, Check, Heart, ShieldCheck, Sparkles, SlidersHorizontal } from "lucide-react";

interface CampaignOption {
  code: string;
  label: string;
}

const CAMPAIGNS: CampaignOption[] = [
  { code: "CHUNG", label: "Quỹ Vì người nghèo xã Ea Súp (Chung 20 thôn buôn)" },
  { code: "NDDK01", label: "Hỗ trợ Xây nhà Đại đoàn kết bà Y Thị - Buôn A" },
  { code: "NDDK02", label: "Xóa nhà tạm dột nát hộ ông Nguyễn Văn Sáng - Thôn 5" },
  { code: "SK01", label: "Trao tặng Bò giống sinh kế - Thôn 12 & Thôn 14" },
  { code: "TET", label: "Quà Tết Bính Ngọ vì người nghèo (500 suất quà)" },
  { code: "CT", label: "Cứu trợ y tế đột xuất & bệnh hiểm nghèo" },
];

const PRESET_AMOUNTS = [
  50000, 100000, 200000, 500000, 1000000, 2000000, 5000000
];

export default function VietQRWidget() {
  // Trạng thái bật/tắt tùy chỉnh thông số (Mặc định: KHÔNG TÍCH để mã QR tự do nhập tiền và nội dung)
  const [isCustomized, setIsCustomized] = useState<boolean>(false);

  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("CHUNG");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tính toán cú pháp chuyển tiền chuẩn khi tùy biến
  const transferMemo = useMemo(() => {
    const prefix = selectedCampaign === "CHUNG" ? "VNN" : `VNN ${selectedCampaign}`;
    const namePart = isAnonymous ? "AN DANH" : donorName.trim() ? donorName.trim() : "UNG HO";
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

  // VietQR URL: Nếu chưa tích thì trả về mã QR mặc định (không gán số tiền & nội dung cố định)
  const qrUrl = useMemo(() => {
    if (!isCustomized) {
      return buildVietQRUrl({
        amount: 0,
        memo: "",
        accountNumber: "8630100930",
        accountName: "UY BAN MTTQ VN XA EA SUP",
      });
    }

    return buildVietQRUrl({
      amount: effectiveAmount,
      memo: transferMemo,
      accountNumber: "8630100930",
      accountName: "UY BAN MTTQ VN XA EA SUP",
    });
  }, [isCustomized, effectiveAmount, transferMemo]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <section id="dong-gop" className="py-4 sm:py-8 bg-rose-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-semibold uppercase">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-600" />
            <span>TỰ ĐỘNG SINH MÃ VIETQR NAPAS 247</span>
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Đóng Góp Trực Tuyến Vì Người Nghèo Ea Súp
          </h2>
          <p className="text-slate-600 text-xs">
            Hệ thống ngân hàng tự động đối soát và cập nhật lên bảng sao kê minh bạch.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-rose-100/40 border border-rose-100 overflow-hidden max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Cột trái: Form nhập thông tin */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            {/* Dấu tích kích nổi tùy chọn thông số */}
            <div
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isCustomized
                  ? "bg-rose-50/90 border-rose-300 shadow-xs"
                  : "bg-slate-50 hover:bg-rose-50/40 border-slate-200"
              }`}
              onClick={() => setIsCustomized(!isCustomized)}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomized}
                  onChange={(e) => setIsCustomized(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer accent-rose-600 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Tùy chỉnh thông số ủng hộ (Nội dung, Số tiền, Người gửi)
                    </span>
                    {isCustomized ? (
                      <span className="text-[10px] bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-full">
                        Đang kích hoạt
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {isCustomized
                      ? "Đang kích nổi các thông số bên dưới: Mã QR bên phải tự động điền sẵn số tiền và nội dung đã chọn."
                      : "Khi không tích (mặc định): Quét mã QR bên phải, bà con tự nhập số tiền và nội dung tùy ý trên App ngân hàng."}
                  </p>
                </div>
              </label>
            </div>

            {/* Nếu CHƯA TÍCH: Hiển thị khối hướng dẫn chế độ quét QR tự do mặc định */}
            {!isCustomized ? (
              <div className="p-5 rounded-xl border border-dashed border-rose-200 bg-rose-50/30 text-center space-y-3 py-6">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Mã QR đang ở chế độ Quét Mặc Định
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Bà con chỉ cần mở ứng dụng ngân hàng bất kỳ quét mã QR bên phải, sau đó <strong>tự nhập số tiền</strong> và <strong>lời nhắn / nội dung</strong> theo ý nguyện.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomized(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-rose-100/60 border border-rose-300 text-rose-700 text-xs font-semibold shadow-2xs transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Bấm tích để chọn chiến dịch &amp; số tiền cụ thể</span>
                </button>
              </div>
            ) : (
              /* Nếu ĐÃ TÍCH: KÍCH NỔI 3 THÔNG SỐ */
              <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                {/* 1. Chọn chiến dịch */}
                <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                  <label className="block text-xs font-bold uppercase text-slate-800 mb-1.5">
                    1. Chọn nội dung / chiến dịch ủng hộ:
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full rounded-lg border border-rose-200 p-2.5 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white font-medium shadow-2xs"
                  >
                    {CAMPAIGNS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Chọn số tiền */}
                <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-slate-800">
                      2. Chọn số tiền đóng góp:
                    </label>
                    <span className="text-xs font-bold text-rose-600 font-mono">
                      {formatVND(effectiveAmount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {PRESET_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setAmount(val);
                          setCustomAmount("");
                        }}
                        className={`py-1.5 text-xs rounded-lg border transition-all ${
                          effectiveAmount === val && !customAmount
                            ? "border-rose-600 bg-rose-600 text-white shadow-sm shadow-rose-200 font-semibold"
                            : "border-slate-200 bg-white hover:bg-rose-50 text-slate-700"
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
                      className="w-full rounded-lg border border-rose-200 p-2 text-xs focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>

                {/* 3. Thông tin người gửi */}
                <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-800">
                    3. Thông tin người ủng hộ:
                  </label>
                  <div>
                    <input
                      type="text"
                      placeholder="Nhập họ tên của bạn (hoặc tên đơn vị, doanh nghiệp)..."
                      disabled={isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full rounded-lg border border-rose-200 p-2.5 text-xs focus:border-rose-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-3.5 h-3.5 text-rose-600 rounded focus:ring-rose-500 accent-rose-600"
                      />
                      <span>Tôi muốn ủng hộ <strong>Ẩn Danh</strong> (Giấu tên trên bảng sao kê)</span>
                    </label>
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Số điện thoại liên hệ (không bắt buộc)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-rose-200 p-2 text-xs focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>

                {/* Hướng dẫn cú pháp */}
                <div className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gợi ý:</strong> Quý vị giữ nguyên cú pháp nội dung để hệ thống tự động ghi nhận đúng chiến dịch.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Khung hiển thị VietQR động tông hồng tươi sáng */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 p-5 sm:p-6 text-white flex flex-col items-center justify-between text-center border-t lg:border-t-0 lg:border-l border-rose-400/30">
            <div className="w-full space-y-1 mb-2">
              <div className="inline-flex items-center gap-1 bg-white/20 text-rose-100 text-[11px] px-2.5 py-0.5 rounded font-medium backdrop-blur-xs">
                <QrCode className="w-3.5 h-3.5" />
                <span>{isCustomized ? "MÃ THEO THÔNG SỐ ĐÃ CHỌN" : "MÃ VIETQR MẶC ĐỊNH"}</span>
              </div>
              <p className="text-[11px] text-rose-100">
                {isCustomized
                  ? `Đã gắn sẵn ${formatVND(effectiveAmount)} & nội dung`
                  : "Quét bằng app ngân hàng & tự nhập số tiền tùy tâm"}
              </p>
            </div>

            {/* Khung ảnh QR */}
            <div className="bg-white p-2.5 rounded-xl shadow-lg max-w-[210px] mx-auto transition-all">
              <img
                src={qrUrl}
                alt="VietQR BIDV Ea Sup"
                className="w-full h-auto aspect-square object-contain rounded"
              />
              <div className="text-[10px] text-slate-600 font-mono mt-1 font-semibold">
                BIDV: 8630100930
              </div>
            </div>

            {/* Chi tiết nội dung chuyển khoản & nút sao chép */}
            <div className="w-full space-y-1.5 mt-3 text-left">
              {/* Số tài khoản */}
              <div className="bg-black/15 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-200 block">Số tài khoản BIDV:</span>
                  <span className="font-mono font-bold text-amber-200 text-xs">8630100930</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("8630100930", "stk")}
                  className="flex items-center gap-1 text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-white font-medium border border-white/20"
                >
                  {copiedField === "stk" ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === "stk" ? "Đã chép" : "Chép STK"}</span>
                </button>
              </div>

              {/* Số tiền */}
              <div className="bg-black/15 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-200 block">Số tiền quyên góp:</span>
                  <span className="font-mono font-bold text-amber-200 text-xs">
                    {isCustomized ? formatVND(effectiveAmount) : "Tùy tâm (Tự nhập khi quét)"}
                  </span>
                </div>
                {isCustomized && (
                  <span className="text-[9px] bg-rose-500/50 text-rose-100 px-1.5 py-0.5 rounded border border-rose-300/30">
                    Cố định
                  </span>
                )}
              </div>

              {/* Cú pháp nội dung */}
              <div className="bg-black/15 backdrop-blur-sm p-2 rounded-lg border border-white/20 text-xs flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-rose-200 block">Nội dung chuyển khoản:</span>
                  <span className="font-mono font-bold text-amber-200 text-[11px] truncate block">
                    {isCustomized ? transferMemo : "Tùy ý (Gợi ý: VNN EASUP)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(isCustomized ? transferMemo : "VNN EASUP", "memo")}
                  className="shrink-0 flex items-center gap-1 text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-white font-medium border border-white/20"
                >
                  {copiedField === "memo" ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === "memo" ? "Đã chép" : "Chép cú pháp"}</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-rose-100 pt-2 font-medium">
              Chủ TK: <strong>UY BAN MTTQ VN XA EA SUP</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
