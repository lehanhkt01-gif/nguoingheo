import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin, Landmark, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t-2 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-xs">
          {/* Cột 1: Giới thiệu & Pháp lý */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                MT
              </div>
              <div>
                <h3 className="text-white font-bold text-xs leading-tight">
                  QUỸ VÌ NGƯỜI NGHÈO EA SÚP
                </h3>
                <p className="text-[11px] text-sky-400">Tỉnh Đắk Lắk</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Cổng thông tin & Sao kê minh bạch an sinh xã hội cấp xã theo Quyết định số 13/QĐ-MTTQ-BTT của Ban Thường trực UBMTTQ Việt Nam xã Ea Súp.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Đối soát tự động qua Casso Banking API</span>
            </div>
          </div>

          {/* Cột 2: Thường trực Ban Vận Động */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-sky-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              Ban Vận Động Quỹ
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <strong className="text-white block">Đ/c Lê Hồng Hạnh</strong>
                <span className="text-slate-400 text-[11px]">Trưởng ban - Chủ tịch UBMTTQ Việt Nam xã</span>
              </li>
              <li>
                <strong className="text-white block">Đ/c Nguyễn Bá Bân</strong>
                <span className="text-slate-400 text-[11px]">Phó ban - Chủ tịch UBND xã Ea Súp</span>
              </li>
              <li>
                <strong className="text-white block">Đ/c Nguyễn Thị Miên</strong>
                <span className="text-slate-400 text-[11px]">Phó ban TT - PCT UBMTTQ, Chủ tịch Hội Nông dân</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tài khoản ngân hàng duy nhất */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-sky-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              Tài Khoản Tiếp Nhận Duy Nhất
            </h4>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-blue-900/50 space-y-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Ngân hàng:</span>
                <strong className="text-white text-xs">BIDV Chi nhánh Ea Súp</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Số tài khoản duy nhất:</span>
                <span className="text-sky-300 font-mono text-sm font-bold tracking-wider">8630100930</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Chủ tài khoản:</span>
                <span className="text-white font-medium text-[11px]">UY BAN MTTQ VN XA EA SUP</span>
              </div>
            </div>
          </div>

          {/* Cột 4: Địa bàn 20 thôn buôn */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-sky-300 border-b border-slate-800 pb-1.5">
              Địa Bàn Quản Lý (20 Thôn Buôn)
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Quản lý và hỗ trợ toàn diện <strong>17 thôn</strong> và <strong>03 buôn</strong> (Buôn A2, Buôn Drai, Buôn Cổng).
            </p>
            <div className="space-y-1 pt-1 text-slate-300 text-xs">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Trụ sở UBMTTQ Việt Nam xã Ea Súp, Đắk Lắk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>ubmttq.easup@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Bản quyền thuộc Ban Vận động Quỹ "Vì người nghèo" xã Ea Súp, tỉnh Đắk Lắk.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sao-ke" className="hover:text-slate-300 transition-colors">Báo cáo Thu - Chi</Link>
            <Link href="/van-ban" className="hover:text-slate-300 transition-colors">Văn bản Pháp lý</Link>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">Cổng Nội bộ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
