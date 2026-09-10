"use client";

import Link from "next/link";
import { Heart, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-20 lg:pt-14 lg:pb-24">
      {/* Ảnh nền buôn làng Tây Nguyên tông trắng hồng & đỏ */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-charity-bg.jpg"
          alt="Quỹ vì người nghèo Ea Súp"
          className="w-full h-full object-cover object-right lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột chữ chính */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-sky-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cổng Thông Tin An Sinh Xã Hội Xã Ea Súp - Tỉnh Đắk Lắk</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug">
              Chung tay vì người nghèo <br />
              <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-sky-400 bg-clip-text text-transparent">
                Không để ai bị bỏ lại phía sau
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
              Minh bạch 100% từng đồng tiền ủng hộ của đồng bào và kiều bào hảo tâm dành cho các gia đình có hoàn cảnh khó khăn tại <strong>20 thôn, buôn</strong> trên địa bàn xã Ea Súp. Dữ liệu ngân hàng cập nhật thời gian thực qua Casso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-300 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Quy chế QĐ 13/QĐ-MTTQ công khai</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Định mức xây nhà 8 triệu/nhà từ xã</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Tài khoản BIDV 8630100930 đối soát 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Biên bản nghiệm thu có chữ ký Ban CTMT</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a
                href="#dong-gop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Heart className="w-4 h-4 fill-current text-white" />
                <span>Đóng góp trực tuyến ngay</span>
              </a>

              <Link
                href="/sao-ke"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 font-medium text-xs border border-slate-700 hover:bg-slate-700 hover:text-white transition-all group"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Xem sao kê minh bạch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Cột Thẻ Tài Khoản BIDV */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-5 border border-sky-500/30 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    BIDV
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
                      Tài khoản tiếp nhận duy nhất
                    </span>
                    <span className="text-white text-xs font-semibold">Ngân hàng BIDV - Ea Súp</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Casso Verified</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Số tài khoản BIDV:</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xl font-bold font-mono text-sky-300 tracking-wider">
                      8630100930
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText("8630100930")}
                      className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Tên chủ tài khoản:</span>
                  <span className="text-xs font-semibold text-white tracking-wide mt-0.5 block">
                    UY BAN MTTQ VN XA EA SUP
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between pt-0.5">
                  <span>Mã định danh ngân hàng (BIN):</span>
                  <span className="text-slate-200 font-mono">970418 (BIDV)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href="#dong-gop"
                  className="w-full inline-block text-center py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
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
