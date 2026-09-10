"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, ShieldCheck, Menu, X, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/sao-ke", label: "Sao kê thời gian thực" },
    { href: "/chien-dich", label: "Nơi gieo hy vọng" },
    { href: "/van-ban", label: "Văn bản & Pháp lý" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Announcement Bar - Tông Xanh Dương Tinh Tế */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-blue-100 text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2 border-b border-blue-700/40">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Tài khoản tiếp nhận duy nhất: <strong class="text-white font-medium">BIDV 8630100930</strong> (UB MTTQ VN XA EA SUP) - Chi nhánh Ea Súp</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name (Đã bỏ badge QĐ 13/QĐ-MTTQ theo yêu cầu) */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 fill-current text-amber-300" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-700">
                UBMTTQ VIỆT NAM XÃ EA SÚP
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                Quỹ Vì Người Nghèo Ea Súp
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/sao-ke"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Casso Verified</span>
            </Link>

            <a
              href="#dong-gop"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all group"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-white" />
              <span>Đóng góp ngay</span>
            </a>

            <Link
              href="/admin/login"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Đăng nhập Cán bộ Quỹ"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#dong-gop"
              className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-medium"
            >
              Ủng hộ
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2.5 pb-5 space-y-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/sao-ke"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"
            >
              Xem sao kê BIDV 8630100930
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
