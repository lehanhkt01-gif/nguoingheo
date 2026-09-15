import HeroBanner from "@/components/home/HeroBanner";
import LiveLedgerTable from "@/components/home/LiveLedgerTable";
import SocialWelfareList from "@/components/home/SocialWelfareList";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
      {/* 1. Hero Banner văn hóa Tây Nguyên Ea Súp tích hợp mã VietQR BIDV */}
      <HeroBanner />

      {/* 2. Bảng sao kê trực tuyến minh bạch: Tự động đối soát từ API Casso */}
      <LiveLedgerTable />

      {/* 3. Danh mục các hoàn cảnh khó khăn & các đợt trao quà an sinh xã hội */}
      <SocialWelfareList />
    </div>
  );
}
