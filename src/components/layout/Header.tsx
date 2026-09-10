"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, ShieldCheck, Menu, X, FileText, Landmark, User, Sparkles } from "lucide-react";

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
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-red-900 via-brand-700 to-red-900 text-amber-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Tài khoản tiếp nhận DUY NHẤT: <strong>BIDV 8630100930</strong> (UB MTTQ VN XA EA SUP) - Không dùng tài khoản Kho bạc</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-brand-700 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
              {/* MTTQ Emblem SVG */}
              <svg className="w-8 h-8 fill-current text-amber-300" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-red-700 flex items-center gap-1.5">
                <span>UBMTTQ Việt Nam xã Ea Súp</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono">QĐ 13/QĐ-MTTQ</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-red-700 transition-colors">
                Quỹ Vì Người Nghèo Ea Súp
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-700 font-semibold"
                      : "text-slate-700 hover:text-red-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/sao-ke"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Minh bạch Casso</span>
            </Link>

            <a
              href="#dong-gop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-brand-700 text-white font-medium text-sm shadow-sm hover:shadow-md hover:from-red-700 hover:to-brand-800 transition-all group"
            >
              <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Đóng góp ngay</span>
            </a>

            <Link
              href="/admin/login"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Đăng nhập Cán bộ Quỹ"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#dong-gop"
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium"
            >
              Ủng hộ
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                pathname === link.href ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/sao-ke"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200"
            >
              Xem sao kê BIDV 8630100930
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg text-slate-600 text-sm hover:bg-slate-50"
            >
              Cổng đăng nhập Cán bộ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
