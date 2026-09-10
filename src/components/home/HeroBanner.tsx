"use client";

import Link from "next/link";
import { Heart, ShieldCheck, Landmark, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Decorative Tây Nguyên Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Radiant Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Cột chữ chính */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge hành chính */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-900/60 border border-red-700/50 text-amber-300 text-xs font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cổng Thông Tin An Sinh Xã Hội Xã Ea Súp - Tỉnh Đắk Lắk</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2]">
              Chung tay vì người nghèo <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Không để ai bị bỏ lại phía sau
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Minh bạch 100% từng đồng tiền ủng hộ của đồng bào và kiều bào hảo tâm dành cho các gia đình có hoàn cảnh khó khăn tại <strong>20 thôn, buôn</strong> trên địa bàn xã Ea Súp. Dữ liệu ngân hàng cập nhật thời gian thực qua Casso.
            </p>

            {/* Các cam kết cốt lõi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-200 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Quy chế số 13/QĐ-MTTQ-BTT công khai</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Giải ngân đúng định mức 8 triệu/nhà</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tài khoản BIDV 8630100930 đối soát 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Biên bản nghiệm thu có chữ ký 20 Trưởng thôn</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#dong-gop"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white font-semibold text-base shadow-lg shadow-red-900/40 hover:scale-[1.02] hover:shadow-red-800/50 transition-all"
              >
                <Heart className="w-5 h-5 fill-current text-white" />
                <span>Đóng góp trực tuyến ngay</span>
              </a>

              <Link
                href="/sao-ke"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 text-slate-200 font-medium text-base border border-slate-700 hover:bg-slate-700/80 hover:text-white transition-all group"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Xem sao kê minh bạch</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Cột Thẻ Tài Khoản BIDV Nổi Bật */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-red-950/80 p-6 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center text-amber-300 font-bold text-sm shadow">
                    BIDV
                  </div>
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
                      Tài khoản tiếp nhận duy nhất
                    </span>
                    <span className="text-white text-sm font-medium">Ngân hàng BIDV - Ea Súp</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Casso Verified</span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Số tài khoản BIDV:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold font-mono text-amber-300 tracking-wider">
                      8630100930
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText("8630100930")}
                      className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Tên chủ tài khoản:</span>
                  <span className="text-sm font-semibold text-white tracking-wide mt-1 block">
                    UY BAN MTTQ VN XA EA SUP
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Mã định danh ngân hàng (BIN):</span>
                    <span className="text-slate-200 font-mono">970418 (BIDV)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phòng giao dịch quản lý:</span>
                    <span className="text-slate-200">PGD Ea Súp - CN Đắk Lắk</span>
                  </div>
                  <div className="flex justify-between text-amber-300/90 font-medium pt-1">
                    <span>Quy chế pháp lý:</span>
                    <span>QĐ 13/QĐ-MTTQ-BTT</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <a
                  href="#dong-gop"
                  className="w-full inline-block text-center py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors shadow"
                >
                  Quét VietQR Tự Động Ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
