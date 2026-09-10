import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin, Landmark, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Cột 1: Giới thiệu & Pháp lý */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center text-amber-300 font-bold">
                MT
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-snug">
                  QUỸ VÌ NGƯỜI NGHÈO XÃ EA SÚP
                </h3>
                <p className="text-xs text-amber-400">Tỉnh Đắk Lắk</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cổng thông tin & Sao kê minh bạch an sinh xã hội cấp xã. Thực hiện theo Quyết định số 13/QĐ-MTTQ-BTT và Quyết định số 12/QĐ-MTTQ-BTT ngày 14/01/2026.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Dữ liệu ngân hàng đối soát trực tiếp qua Casso Banking</span>
            </div>
          </div>

          {/* Cột 2: Thường trực Ban Vận Động */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Ban Vận Động Quỹ
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li>
                <strong className="text-white block">Đ/c Lê Hồng Hạnh</strong>
                <span className="text-slate-400">Trưởng ban - UV BTV Đảng ủy, Bí thư Chi bộ MTTQ, Chủ tịch UBMTTQ Việt Nam xã</span>
              </li>
              <li>
                <strong className="text-white block">Đ/c Nguyễn Bá Bân</strong>
                <span className="text-slate-400">Phó ban - Chủ tịch UBND xã Ea Súp</span>
              </li>
              <li>
                <strong className="text-white block">Đ/c Nguyễn Thị Miên</strong>
                <span className="text-slate-400">Phó ban thường trực - Phó Chủ tịch UBMTTQ, Chủ tịch Hội Nông dân xã</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tài khoản ngân hàng duy nhất */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" />
              Tài Khoản Tiếp Nhận Duy Nhất
            </h4>
            <div className="bg-gradient-to-br from-red-950 to-slate-800 p-3.5 rounded-xl border border-red-900/50 space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Ngân hàng thụ hưởng:</span>
                <strong className="text-white text-sm">BIDV - Chi nhánh / PGD Ea Súp</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Số tài khoản duy nhất:</span>
                <span className="text-amber-400 font-mono text-base font-bold tracking-wider">8630100930</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Chủ tài khoản:</span>
                <span className="text-white font-semibold">UY BAN MTTQ VN XA EA SUP</span>
              </div>
              <p className="text-[10px] text-red-300 italic pt-1 border-t border-red-900/40">
                * Bắt buộc: Toàn bộ dòng tiền ủng hộ và giải ngân thực hiện 100% qua tài khoản này, không dùng tài khoản Kho bạc.
              </p>
            </div>
          </div>

          {/* Cột 4: Địa bàn & Liên hệ */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-700 pb-2">
              Địa Bàn Quản Lý (20 Thôn Buôn)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Bao gồm <strong>17 thôn</strong> (Thôn 1 đến Thôn 17) và <strong>03 buôn</strong> (Buôn A2, Buôn Drai, Buôn Cổng) trên toàn địa bàn xã Ea Súp.
            </p>
            <div className="space-y-1.5 pt-2 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span>Trụ sở UBMTTQ Việt Nam xã Ea Súp, huyện Ea Súp, tỉnh Đắk Lắk</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>ubmttq.easup@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span>0262.3688.xxx (Văn phòng MTTQ xã)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bản quyền & Chứng thực */}
        <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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
