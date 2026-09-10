import Link from "next/link";
import HeroBanner from "@/components/home/HeroBanner";
import CounterDashboard from "@/components/home/CounterDashboard";
import VietQRWidget from "@/components/home/VietQRWidget";
import CampaignCard from "@/components/home/CampaignCard";
import ProofGallery from "@/components/home/ProofGallery";
import { prisma } from "@/lib/prisma";
import { Heart, ShieldCheck, ArrowRight, BookOpen, CheckCircle, Award } from "lucide-react";

export const revalidate = 60; // Revalidate mỗi 60 giây

export default async function HomePage() {
  // Lấy danh sách chiến dịch đang mở
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner văn hóa Tây Nguyên Ea Súp */}
      <HeroBanner />

      {/* 2. Bộ đếm thống kê thời gian thực */}
      <CounterDashboard />

      {/* 3. Phân hệ Danh mục Chiến dịch ("Nơi gieo hy vọng") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Nơi Gieo Hy Vọng - Ea Súp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Các Hoàn Cảnh & Chương Trình Trọng Điểm Cần Hỗ Trợ
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Khảo sát thực địa trực tiếp từ 20 thôn buôn. Mọi khoản đóng góp đều được gắn mã phân loại chính xác.
            </p>
          </div>

          <Link
            href="/chien-dich"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 self-start md:self-auto bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
          >
            <span>Xem tất cả chiến dịch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Lưới các thẻ chiến dịch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={{
                id: c.id,
                code: c.code,
                slug: c.slug,
                title: c.title,
                description: c.description,
                beneficiaryName: c.beneficiaryName,
                village: c.village,
                targetAmount: Number(c.targetAmount),
                currentAmount: Number(c.currentAmount),
                category: c.category,
                status: c.status,
                imageUrl: c.imageUrl,
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. Widget Đóng góp Trực tuyến (VietQR NAPAS 247) */}
      <VietQRWidget />

      {/* 5. Thư viện Ảnh - Video nghiệm thu */}
      <ProofGallery />

      {/* 6. Căn cứ Pháp lý & Tôn chỉ Minh bạch */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-red-900/60 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Căn Cứ Pháp Lý Vận Hành Quỹ</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Vận Hành Dân Chủ - Pháp Lý Minh Bạch - Đúng Đối Tượng
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Quỹ "Vì người nghèo" xã Ea Súp hoạt động dưới sự lãnh đạo trực tiếp của Đảng ủy, giám sát của HĐND và điều hành của Thường trực Ban Vận động Quỹ căn cứ theo <strong>Quyết định số 13/QĐ-MTTQ-BTT</strong> ban hành Quy chế vận động và <strong>Quyết định số 12/QĐ-MTTQ-BTT</strong> ngày 14/01/2026.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-amber-200/90">
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
                className="w-full text-center py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors shadow-lg"
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
