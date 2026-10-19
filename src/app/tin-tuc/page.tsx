import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import {
  Calendar,
  User,
  MapPin,
  ArrowRight,
  Sparkles,
  Search,
  Tag,
  Newspaper,
  Heart,
  Gift,
  ShieldCheck,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bản Tin An Sinh & Báo Cáo Phóng Sự | Quỹ Vì Người Nghèo Xã Ea Súp",
  description:
    "Cổng thông tin báo chí, bản tin an sinh, hồ sơ các hoàn cảnh khó khăn và các đợt trao quà của UBMTTQ Việt Nam xã Ea Súp, tỉnh Đắk Lắk.",
};

export default function TinTucListPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner Báo Chí Hệ Sinh Thái Ea Súp Số */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 text-white py-10 sm:py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wider uppercase">
            <Newspaper className="w-3.5 h-3.5 text-rose-200" />
            <span>HỆ THỐNG BẢN TIN BÁO CHÍ ĐIỆN TỬ EASUPSO.COM</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase">
            Bản Tin An Sinh &amp; Phóng Sự Người Nghèo Xã Ea Súp
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
            Tổng hợp các bài viết phóng sự, thông tin về các trường hợp cần trợ giúp khẩn cấp và báo cáo kết quả các đợt trao quà, giải ngân có chứng từ mộc đỏ của UBMTTQ xã Ea Súp.
          </p>
        </div>

        {/* Họa tiết trang trí */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Thanh đếm & chuyên mục */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-5 rounded-full bg-rose-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
              Tất Cả Bản Tin &amp; Bài Viết ({articles.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/chien-dich"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold border border-rose-200 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Nơi gieo hy vọng (Hoàn cảnh)</span>
            </Link>
            <Link
              href="/van-ban"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Gặt hái niềm tin (Đã trao)</span>
            </Link>
          </div>
        </div>

        {/* Lưới bài báo dạng Magazine Card */}
        {articles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Chưa có bài viết nào được xuất bản.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Ảnh bài báo */}
                  <Link href={`/tin-tuc/${art.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                        art.categoryBadgeColor === "emerald"
                          ? "bg-emerald-600 text-white"
                          : art.categoryBadgeColor === "blue"
                          ? "bg-blue-600 text-white"
                          : art.categoryBadgeColor === "amber"
                          ? "bg-amber-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {art.categoryLabel}
                    </span>

                    {art.village && (
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] text-white flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{art.village}</span>
                      </span>
                    )}
                  </Link>

                  {/* Nội dung tóm tắt */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{art.date}</span>
                      <span>•</span>
                      <User className="w-3 h-3" />
                      <span className="truncate">{art.authorName}</span>
                    </div>

                    <Link href={`/tin-tuc/${art.id}`} className="block">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {art.sapo}
                    </p>
                  </div>
                </div>

                {/* Chân thẻ bài báo */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {art.readingTimeMinutes} phút đọc • {art.views} lượt xem
                  </span>

                  <Link
                    href={`/tin-tuc/${art.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors"
                  >
                    <span>Đọc toàn bộ</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
