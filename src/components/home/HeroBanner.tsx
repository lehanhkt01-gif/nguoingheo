"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShieldCheck, ArrowRight, CheckCircle2, X, Copy, Check } from "lucide-react";

export default function HeroBanner() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copySTK = () => {
    navigator.clipboard.writeText("8630100930");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQrModal(false);
    };
    if (showQrModal) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showQrModal]);

  return (
    <section id="dong-gop" className="relative overflow-hidden bg-rose-50/60 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 lg:pb-10">
      {/* Ảnh nền buôn làng Tây Nguyên nắng ấm tươi sáng */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-charity-bg.jpg"
          alt="Quỹ vì người nghèo Ea Súp"
          className="w-full h-full object-cover object-right lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-100/50 via-transparent to-white/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 sm:space-y-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/90 border border-rose-300 text-rose-800 text-[11px] sm:text-xs font-semibold backdrop-blur-sm shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
            <span className="truncate">Cổng Thông Tin An Sinh Xã Hội Xã Ea Súp</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
            Chung tay vì người nghèo <br />
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent">
              Không để ai bị bỏ lại phía sau
            </span>
          </h1>

          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Minh bạch 100% từng đồng tiền ủng hộ của đồng bào và kiều bào hảo tâm dành cho các gia đình có hoàn cảnh khó khăn tại <strong>20 thôn, buôn</strong> trên địa bàn xã Ea Súp. Dữ liệu ngân hàng đối soát trực tiếp qua Casso.
          </p>

          {/* Khu vực mã QR BIDV & nút hành động */}
          <div className="pt-1.5 max-w-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* Thẻ mã QR BIDV - Bấm vào sẽ mở popup phóng to toàn màn hình */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                title="Bấm để phóng to mã QR BIDV chuyển khoản"
                className="bg-white/95 backdrop-blur-sm p-2.5 sm:p-3 rounded-2xl border border-rose-200/90 shadow-md hover:shadow-lg hover:border-rose-400 transition-all flex items-center gap-3 sm:gap-3.5 text-left shrink-0 group cursor-pointer"
              >
                {/* Khung ảnh QR kích thước chuẩn */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden border border-rose-100 p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                  <img
                    src="https://img.vietqr.io/image/bidv-8630100930-compact2.png?accountName=UY%20BAN%20MTTQ%20VN%20XA%20EA%20SUP"
                    alt="Mã QR BIDV 8630100930"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-rose-700 block leading-tight">
                    MÃ QR BIDV 8630100930
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block mt-0.5 leading-tight">
                    Tự chỉnh số tiền &amp; nội dung tùy tâm
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold underline mt-1.5 block">
                    Chạm để phóng to QR &rarr;
                  </span>
                </div>
              </button>

              {/* 2 Nút hành động */}
              <div className="flex flex-col gap-2 flex-1 justify-center">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-300/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 text-center whitespace-nowrap cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white shrink-0" />
                  <span>Đóng góp trực tuyến VietQR</span>
                </button>

                <Link
                  href="/sao-ke"
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/95 hover:bg-white text-rose-700 font-semibold text-xs sm:text-sm border border-rose-300 shadow-2xs backdrop-blur-sm transition-all inline-flex items-center justify-center gap-1.5 group text-center whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
                  <span>Xem sao kê</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cửa sổ Popup Mã QR Phóng To Toàn Màn Hình */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-rose-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Huy hiệu */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/80 mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>Ủng Hộ Quỹ Vì Người Nghèo Xã Ea Súp</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Quét Mã VietQR Chuyển Khoản
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3.5">
              Mở App Ngân hàng hoặc Ví điện tử bất kỳ để quét mã
            </p>

            {/* Khung ảnh QR kích thước lớn */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-2xl p-2.5 border-2 border-rose-200/90 shadow-sm flex items-center justify-center">
              <img
                src="https://img.vietqr.io/image/bidv-8630100930-compact2.png?accountName=UY%20BAN%20MTTQ%20VN%20XA%20EA%20SUP"
                alt="Mã QR BIDV 8630100930 Quỹ Vì Người Nghèo Ea Súp"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Khối thông tin chi tiết */}
            <div className="w-full mt-3.5 p-3 sm:p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/70 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Ngân hàng:</span>
                <span className="font-semibold text-slate-800">BIDV Ea Súp (BIN: 970418)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-700 text-sm">8630100930</span>
                  <button
                    type="button"
                    onClick={copySTK}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                  UY BAN MTTQ VN XA EA SUP
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nội dung CK:</span>
                <span className="text-slate-700 text-[11px] sm:text-xs italic">
                  Tùy tâm hoặc Họ tên ủng hộ
                </span>
              </div>
            </div>

            {/* Nút đóng chân modal */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="mt-3.5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
