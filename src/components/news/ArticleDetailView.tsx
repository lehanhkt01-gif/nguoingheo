"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/utils";
import { JournalisticArticle } from "@/lib/articles";
import {
  Calendar,
  User,
  MapPin,
  Eye,
  Share2,
  Copy,
  Check,
  QrCode,
  Printer,
  Heart,
  FileText,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Gift,
  DollarSign,
  X,
  Maximize2,
  Smartphone,
  Facebook,
  MessageCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  article: JournalisticArticle;
  relatedArticles: JournalisticArticle[];
}

export default function ArticleDetailView({ article, relatedArticles }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  // Cấu hình VietQR ủng hộ tự động nếu là hoàn cảnh khó khăn
  const bidvAccount = process.env.NEXT_PUBLIC_BIDV_ACCOUNT || "8630100930";
  const bidvBin = process.env.NEXT_PUBLIC_BIDV_BIN || "970418";
  const accountName = process.env.NEXT_PUBLIC_ACCOUNT_NAME || "UY BAN MTTQ VN XA EA SUP";
  const transferContent = `HO TRO ${article.rawId} ${article.beneficiaryName || "EASUP"}`.slice(0, 35);
  const vietQrUrl = `https://img.vietqr.io/image/${bidvBin}-${bidvAccount}-compact2.png?amount=0&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(accountName)}`;

  const currentUrl = typeof window !== "undefined" ? window.location.href : article.shareUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "width=600,height=450");
  };

  const handleShareZalo = () => {
    const url = `https://sp.zalo.me/share_inline?link=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "width=600,height=450");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <article className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* 1. THANH TIÊU ĐỀ HÀNH CHÍNH & BREADCRUMBS BÁO CHÍ */}
      <div className="bg-white border-b border-rose-100 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center gap-2 text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-rose-700 transition-colors font-medium flex items-center gap-1">
              <span>Trang chủ</span>
            </Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-rose-700 transition-colors font-medium">
              Bản tin an sinh
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
              {article.categoryLabel}
            </span>
          </nav>

          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-800 font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả bản tin</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* 2. KHỐI TIÊU ĐỀ BÁO CHÍ & MASTHEAD HỆ SINH THÁI EASUPSO.COM */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
          {/* Masthead Cơ quan chủ quản */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-rose-100 shadow-xs flex items-center justify-center shrink-0">
                <img
                  src="/images/logo-mttq.png"
                  alt="Ủy ban MTTQ Việt Nam"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 block">
                  ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM XÃ EA SÚP
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block">
                  BAN VẬN ĐỘNG QUỸ &quot;VÌ NGƯỜI NGHÈO&quot; • HỆ SINH THÁI SỐ 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  article.categoryBadgeColor === "emerald"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : article.categoryBadgeColor === "blue"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : article.categoryBadgeColor === "amber"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {article.categoryLabel}
              </span>
            </div>
          </div>

          {/* Tiêu đề chính thức của bài báo (Heading 1) */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Dải thông tin xuất bản báo chí */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>Ngày xuất bản: {article.date}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>Người ký duyệt: <strong>{article.authorName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Địa bàn: <strong>{article.village}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readingTimeMinutes} phút đọc
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {article.views} lượt xem
              </span>
            </div>
          </div>

          {/* 3. THANH CÔNG CỤ CHIA SẺ ĐA NỀN TẢNG (SHARE BAR) */}
          <div className="bg-rose-50/50 p-3 sm:p-4 rounded-2xl border border-rose-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Share2 className="w-4 h-4 text-rose-600" />
              <span>Chia sẻ bài báo đa nền tảng:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nút Chia sẻ Zalo */}
              <button
                type="button"
                onClick={handleShareZalo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Chia sẻ nhanh qua Zalo"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Zalo</span>
              </button>

              {/* Nút Chia sẻ Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Chia sẻ lên Facebook cá nhân hoặc Fanpage"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>

              {/* Nút Quét mã QR */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Mã QR để quét đọc trên điện thoại"
              >
                <QrCode className="w-3.5 h-3.5 text-rose-600" />
                <span>Mã QR</span>
              </button>

              {/* Nút Xem trước Review Card */}
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                title="Xem trước chế độ Review hiển thị mạng xã hội"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Chế độ Review</span>
              </button>

              {/* Nút Sao chép liên kết */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã chép link!" : "Sao chép link"}</span>
              </button>

              {/* Nút In bài viết */}
              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                title="In bài báo / Lưu thành PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. NỘI DUNG CHÍNH CỦA BÀI BÁO PHÓNG SỰ AN SINH */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 leading-relaxed">
          {/* Đoạn Sapo báo chí trang trọng */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/40 to-white border-l-4 border-rose-600 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              TÓM TẮT BẢN TIN (SAPO)
            </span>
            <p className="text-sm sm:text-base text-slate-800 font-semibold italic leading-relaxed">
              &quot;{article.sapo}&quot;
            </p>
          </div>

          {/* Ảnh phóng sự chính (Lead Photo) */}
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 max-h-[500px] border border-slate-200 group">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover max-h-[500px]"
                onError={(e: any) => {
                  e.target.src = "/images/hero-charity-bg.jpg";
                }}
              />
              <button
                type="button"
                onClick={() => setActiveLightboxImg(article.imageUrl)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                title="Xem ảnh cỡ lớn"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-500 italic">
              Hình ảnh ghi nhận thực tế từ công tác an sinh xã hội trên địa bàn 20 thôn buôn xã Ea Súp.
            </p>
          </div>

          {/* Bảng số liệu nổi bật nếu là Hoàn cảnh hoặc Đợt trao quà */}
          {article.type === "CASE" && (
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Đối tượng thụ hưởng</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{article.beneficiaryName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Địa bàn thôn / buôn</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{article.village}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Kinh phí dự kiến vận động</span>
                <span className="text-lg font-extrabold text-rose-600 font-mono block mt-0.5">
                  {formatVND(article.amount || 0)} đ
                </span>
              </div>
            </div>
          )}

          {article.type === "GIFT" && (
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold uppercase block">Số tiền trao thực tế</span>
                <span className="text-lg font-extrabold text-emerald-700 font-mono block mt-0.5">
                  {formatVND(article.amount || 0)} đ
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold uppercase block">Quy mô đợt trao</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{article.recipientCount} hộ thụ hưởng</span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold uppercase block">Ngày trao &amp; ký biên bản</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{article.date}</span>
              </div>
            </div>
          )}

          {/* Toàn văn nội dung bài viết */}
          <div className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {article.content}
          </div>

          {/* Album ảnh phóng sự (nếu có nhiều ảnh) */}
          {article.images && article.images.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Thư viện hình ảnh phóng sự thực tế ({article.images.length} ảnh):</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {article.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxImg(img)}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`Ảnh phóng sự ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách tệp đính kèm / Hồ sơ PDF lưu trữ */}
          {article.files && article.files.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Hồ sơ biên bản &amp; Chứng từ mộc đỏ đính kèm ({article.files.length} tệp):</span>
              </h3>
              <div className="space-y-2">
                {article.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {file.type === "pdf" ? "PDF" : "IMG"}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">Chứng từ lưu trữ số hóa vĩnh viễn</span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shrink-0"
                    >
                      <span>Xem / Tải về</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. KHỐI KÊU GỌI QUYÊN GÓP VIETQR NAPAS 247 (CHO HOÀN CẢNH KHÓ KHĂN) */}
          {article.type === "CASE" && (
            <div className="bg-gradient-to-br from-rose-50 via-pink-50/40 to-white p-6 sm:p-8 rounded-3xl border-2 border-rose-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 uppercase">
                  Chung Tay Ủng Hộ Hoàn Cảnh Này Qua Quỹ &quot;Vì Người Nghèo&quot;
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mọi khoản đóng góp của quý nhà hảo tâm được ghi nhận tự động vào số dư khả dụng của Quỹ thông qua cổng tiếp nhận duy nhất của Mặt trận.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="sm:col-span-1 bg-white p-3 rounded-2xl border border-rose-200 shadow-xs text-center space-y-1.5">
                  <img
                    src={vietQrUrl}
                    alt="VietQR BIDV Tiếp Nhận Ủng Hộ"
                    className="w-full aspect-square object-contain mx-auto rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Quét VietQR trên app ngân hàng
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px]">Ngân hàng tiếp nhận:</span>
                    <div className="font-bold text-slate-900 text-sm">BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px]">Số tài khoản tiếp nhận DUY NHẤT:</span>
                    <div className="font-mono font-extrabold text-rose-700 text-base">{bidvAccount}</div>
                    <div className="text-[11px] text-slate-600">Chủ tài khoản: <strong>{accountName}</strong></div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px]">Nội dung chuyển khoản chuẩn Casso:</span>
                    <div className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200 select-all">
                      {transferContent}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. HỘP XÁC THỰC MỘC ĐỎ & CHỮ KÝ LÃNH ĐẠO */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  XÁC THỰC CÔNG KHAI 100% CẤP XÃ
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Khớp lệnh thời gian thực tài khoản BIDV 8630100930 • Giám sát nhân dân 20 thôn buôn.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs">
              <div className="font-bold text-slate-700 uppercase">
                TM. BAN THƯỜNG TRỰC UBMTTQ VIỆT NAM XÃ EA SÚP
              </div>
              <div className="font-medium text-rose-700">{article.signerTitle}</div>
              <div className="font-bold text-slate-900 text-sm pt-2">{article.signerName}</div>
              <div className="text-[10px] text-slate-400 italic">(Đã ký duyệt và số hóa lưu trữ)</div>
            </div>
          </div>
        </div>

        {/* 7. TIN TỨC & BÀI BÁO AN SINH LIÊN QUAN */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Các bản tin an sinh &amp; hoàn cảnh khác</span>
              </h3>
              <Link href="/tin-tuc" className="text-xs text-rose-700 font-semibold hover:underline">
                Xem toàn bộ &raquo;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/tin-tuc/${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.village}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.sapo}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] font-semibold text-rose-700 text-right">
                    Đọc tiếp &raquo;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHẾ ĐỘ REVIEW MẠNG XÃ HỘI (SOCIAL PREVIEW CARD)                  */}
      {/* ========================================================================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Chế Độ Review Mạng Xã Hội (Preview)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Hình ảnh mô phỏng chính xác thẻ hiển thị (Open Graph Preview Card) khi cán bộ hoặc người dân chia sẻ liên kết bài báo này lên Zalo, Facebook Messenger hoặc bài đăng News Feed:
              </p>

              {/* Mô phỏng Card Facebook / Zalo */}
              <div className="rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-sm">
                <div className="aspect-[12/6.3] bg-slate-200 overflow-hidden relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                    1200 x 630 HD
                  </div>
                </div>
                <div className="p-4 space-y-1 bg-slate-50">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    NGUOINGHEO.EASUPSO.COM
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.sapo}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đầy đủ thẻ Open Graph &amp; Twitter Card
                </span>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  Thử chia sẻ ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MÃ QR QUÉT ĐỌC TRÊN ĐIỆN THOẠI DI ĐỘNG                          */}
      {/* ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                MÃ QR ĐỌC BÀI BÁO
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  currentUrl
                )}`}
                alt="QR Code bài báo"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{article.title}</h4>
              <p className="text-[11px] text-slate-500">
                Mở camera trên điện thoại hoặc Zalo để quét mã và đọc toàn văn bài báo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {copied ? "Đã sao chép link bài báo!" : "Sao chép liên kết bài báo"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LIGHTBOX ẢNH CỠ LỚN                                              */}
      {/* ========================================================================= */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2 cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImg}
              alt="Phóng to ảnh"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </article>
  );
}
