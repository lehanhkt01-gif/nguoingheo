"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, ShieldCheck, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkAuth = () => {
      const localLoggedIn = localStorage.getItem("admin_logged_in");
      const localUser = localStorage.getItem("vinguoingheo_user");

      if (localLoggedIn === "true" && localUser) {
        setIsLoggedIn(true);
        try {
          setAdminUser(JSON.parse(localUser));
        } catch {}
      } else {
        setIsLoggedIn(false);
        setAdminUser(null);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("vinguoingheo_user");
    setIsLoggedIn(false);
    setAdminUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/sao-ke", label: "Sao kê thời gian thực" },
    { href: "/chien-dich", label: "Nơi gieo hy vọng" },
    { href: "/van-ban", label: "Văn bản & Pháp lý" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs transition-all">
      {/* Top Announcement Bar - Tông Hồng Tươi Sáng */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2 border-b border-rose-400/30">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Tài khoản tiếp nhận duy nhất: <strong className="text-white font-semibold">BIDV 8630100930</strong> (UB MTTQ VN XA EA SUP) - Chi nhánh Ea Súp</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo-mttq.png"
              alt="Mặt trận Tổ quốc Việt Nam"
              className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-rose-700">
                ỦY BAN MTTQ XÃ EA SÚP
              </div>
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors uppercase">
                QUỸ VÌ NGƯỜI NGHÈO
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
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "hover:text-rose-600 hover:bg-rose-50/50"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-200 hover:shadow transition-all group"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-white" />
              <span>Đóng góp ngay</span>
            </a>

            {/* Nút Quản Trị / Cán Bộ Đăng Nhập */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                    LH
                  </div>
                  <span>{adminUser?.fullName?.split(" ").slice(-2).join(" ") || "Cán bộ"}</span>
                  <ChevronDown className="w-3 h-3 text-rose-600" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-rose-100 py-1 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-rose-50">
                      <div className="text-xs font-bold text-slate-900">{adminUser?.fullName || "Đ/c Lê Hồng Hạnh"}</div>
                      <div className="text-[10px] text-rose-600 font-medium">{adminUser?.title || "Chủ tịch UBMTTQ xã"}</div>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-rose-600" />
                      <span>Vào trang quản trị</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50/50 transition-colors text-xs font-semibold"
                title="Đăng nhập Cán bộ Quỹ"
              >
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>Quản trị</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn ? (
              <Link
                href="/admin"
                className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-bold"
              >
                Quản trị
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="px-2 py-1 rounded-md border border-rose-200 text-rose-700 text-xs font-medium"
              >
                Đăng nhập
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-rose-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 pt-2.5 pb-5 space-y-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href ? "bg-rose-50 text-rose-700 font-semibold" : "text-slate-700 hover:bg-rose-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2.5 border-t border-rose-100 flex flex-col gap-2">
            <Link
              href="/sao-ke"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200"
            >
              Xem sao kê BIDV 8630100930
            </Link>
            {isLoggedIn ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-md bg-slate-900 text-white text-xs font-semibold"
              >
                Bảng điều khiển Quản trị
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-md bg-rose-600 text-white text-xs font-semibold"
              >
                Đăng nhập Cán bộ Quản trị
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
