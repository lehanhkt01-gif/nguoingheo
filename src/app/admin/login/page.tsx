"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("vinguoingheo_user", JSON.stringify(data.user));
        localStorage.setItem("admin_logged_in", "true");
        router.push("/admin");
      } else {
        setError(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      setError("Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-pink-50 flex flex-col justify-center items-center p-4">
      {/* Quay lại trang chủ */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
        <span className="text-[11px] text-slate-500 font-medium">Bảo mật SSL 256-bit</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100 overflow-hidden">
        {/* Header Form màu Hồng Đỏ Mặt Trận sang trọng */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center">
              <img
                src="/images/logo-mttq.png"
                alt="Mặt trận Tổ quốc Việt Nam"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-800/60 text-rose-100 text-[10px] font-bold uppercase tracking-wider mb-1">
                CỔNG BẢO MẬT NỘI BỘ
              </span>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight uppercase leading-tight">
                HỆ THỐNG QUẢN TRỊ AN SINH XÃ HỘI EA SÚP
              </h1>
              <p className="text-[11px] text-rose-100/90 font-medium">
                Ủy ban MTTQ xã Ea Súp - Tỉnh Đắk Lắk
              </p>
            </div>
          </div>

          {/* Họa tiết nền */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {/* Form đăng nhập */}
        <form
          id="admin-login-form"
          method="POST"
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ô TÀI KHOẢN */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Tên đăng nhập cán bộ:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-medium"
                placeholder="Nhập tên tài khoản quản trị..."
              />
            </div>
          </div>

          {/* Ô MẬT KHẨU */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Mật khẩu truy cập:
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Ẩn
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Hiện
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-medium font-mono"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* NÚT SUBMIT CHUẨN BITWARDEN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-rose-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xác thực hệ thống...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Chân trang form */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
          Hệ thống bảo mật phân quyền RBAC • Quản trị dữ liệu an sinh 20 thôn buôn xã Ea Súp
        </div>
      </div>
    </div>
  );
}
