import Link from "next/link";
import HeroBanner from "@/components/home/HeroBanner";
import CounterDashboard from "@/components/home/CounterDashboard";
import VietQRWidget from "@/components/home/VietQRWidget";
import LiveLedgerTable from "@/components/home/LiveLedgerTable";
import SocialWelfareList from "@/components/home/SocialWelfareList";
import { BookOpen, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner văn hóa Tây Nguyên Ea Súp tông hồng tươi sáng */}
      <HeroBanner />

      {/* 2. Khối thống kê: 4 thẻ số liệu to rõ, trang nhã */}
      <CounterDashboard />

      {/* 3. Widget Đóng góp VietQR NAPAS 247 cho tài khoản BIDV 8630100930 */}
      <VietQRWidget />

      {/* 4. Bảng sao kê trực tuyến minh bạch: Tự động tải từ API, tìm kiếm tên, lọc 20 thôn buôn */}
      <LiveLedgerTable />

      {/* 5. Danh mục các hoàn cảnh khó khăn & các đợt trao quà an sinh xã hội */}
      <SocialWelfareList />

      {/* 6. Căn cứ Pháp lý & Tôn chỉ Minh bạch cấp ủy / MTTQ xã */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-rose-900/60 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 text-rose-200 text-xs font-semibold border border-rose-700/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Căn Cứ Pháp Lý Vận Hành Quỹ</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Vận Hành Dân Chủ - Pháp Lý Minh Bạch - Đúng Đối Tượng
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Quỹ "Vì người nghèo" xã Ea Súp hoạt động dưới sự lãnh đạo trực tiếp của Đảng ủy, giám sát của HĐND và điều hành của Thường trực Ban Vận động Quỹ căn cứ theo <strong>Quyết định số 13/QĐ-MTTQ-BTT</strong> ban hành Quy chế vận động và <strong>Quyết định số 12/QĐ-MTTQ-BTT</strong> ngày 14/01/2026.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-rose-200/90">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Xây nhà ĐĐK: 8 triệu đồng/nhà từ nguồn xã</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sửa chữa nhà: 5 triệu đồng/nhà</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hỗ trợ giống cây con sinh kế: 5 triệu đồng/hộ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cứu trợ đột xuất: 1 - 5 triệu đồng/ca</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                href="/sao-ke"
                className="w-full text-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm transition-colors shadow-lg shadow-rose-950/40"
              >
                Xem Bảng Kê Thu - Chi Ngân Hàng
              </Link>
              <Link
                href="/van-ban"
                className="w-full text-center py-3.5 px-6 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors"
              >
                Tải Các Quyết Định Scan Mộc Đỏ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
