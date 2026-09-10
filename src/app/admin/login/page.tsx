"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("lehonghanh");
  const [password, setPassword] = useState("EaSup@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("vinguoingheo_user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError("Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900 to-slate-900 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mx-auto mb-3 text-amber-300 font-bold">
            MT
          </div>
          <h2 className="text-xl font-bold">Cổng Quản Trị Cán Bộ</h2>
          <p className="text-xs text-amber-200/80 mt-1">
            Ban Vận Động Quỹ "Vì Người Nghèo" Xã Ea Súp
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên đăng nhập cán bộ:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                placeholder="lehonghanh / ketoan_mttq / ctmt_buondrai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu truy cập:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Tài khoản mặc định thử nghiệm:</div>
            <div>• Admin: <code>lehonghanh</code> | MK: <code>EaSup@2026</code></div>
            <div>• Kế toán: <code>ketoan_mttq</code> | MK: <code>EaSup@2026</code></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            <span>{loading ? "Đang xác thực..." : "Đăng Nhập Quản Trị"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
