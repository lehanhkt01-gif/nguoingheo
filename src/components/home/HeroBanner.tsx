"use client";

import Link from "next/link";
import { Heart, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-rose-50/60 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 lg:pb-10">
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

          {/* Thông tin pháp lý & Mã QR BIDV mặc định tự nhập tiền */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-0.5 max-w-lg">
            {/* Cột trái: 2 tiêu chuẩn minh bạch */}
            <div className="space-y-1.5 sm:space-y-2 flex-1 text-xs text-slate-800">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg border border-rose-200/80 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">Quy chế QĐ 13/QĐ-MTTQ công khai</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg border border-rose-200/80 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">Tài khoản BIDV 8630100930 đối soát 24/7</span>
              </div>
            </div>

            {/* Cột phải: Mã QR BIDV duy nhất nhỏ gọn (tự chỉnh số tiền & nội dung) */}
            <a
              href="#dong-gop"
              title="Quét mã QR BIDV để ủng hộ (Tự chỉnh số tiền và nội dung tùy tâm)"
              className="bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-rose-200/90 shadow-md hover:shadow-lg hover:border-rose-400 transition-all flex flex-row sm:flex-col items-center gap-2.5 sm:gap-1 text-left sm:text-center shrink-0 group"
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 sm:aspect-square bg-white rounded-lg overflow-hidden border border-rose-100 p-0.5 shrink-0">
                <img
                  src="https://img.vietqr.io/image/bidv-8630100930-compact2.png?accountName=UY%20BAN%20MTTQ%20VN%20XA%20EA%20SUP"
                  alt="Mã QR BIDV 8630100930"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 block leading-tight">
                  MÃ QR BIDV
                </span>
                <span className="text-[9px] text-slate-500 font-medium block leading-tight">
                  Tự chỉnh tiền &amp; nội dung
                </span>
                <span className="text-[9px] text-rose-600 font-bold sm:hidden underline">
                  Chạm để quét mã &rarr;
                </span>
              </div>
            </a>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <a
              href="#dong-gop"
              className="px-4 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-300/40 hover:scale-[1.02] sm:hover:scale-105 transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-white" />
              <span>Đóng góp trực tuyến VietQR</span>
            </a>

            <Link
              href="/sao-ke"
              className="px-4 py-2.5 sm:py-2 rounded-lg bg-white/90 hover:bg-white text-rose-700 font-semibold text-xs border border-rose-300 shadow-xs backdrop-blur-sm transition-all inline-flex items-center justify-center gap-1.5 group text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Xem sao kê minh bạch</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
