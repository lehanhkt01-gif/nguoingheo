import HeroBanner from "@/components/home/HeroBanner";
import VietQRWidget from "@/components/home/VietQRWidget";
import LiveLedgerTable from "@/components/home/LiveLedgerTable";
import SocialWelfareList from "@/components/home/SocialWelfareList";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner văn hóa Tây Nguyên Ea Súp tông hồng tươi sáng */}
      <HeroBanner />

      {/* 2. Widget Đóng góp VietQR NAPAS 247 cho tài khoản BIDV 8630100930 */}
      <VietQRWidget />

      {/* 3. Bảng sao kê trực tuyến minh bạch: Tự động đối soát từ API Casso */}
      <LiveLedgerTable />

      {/* 4. Danh mục các hoàn cảnh khó khăn & các đợt trao quà an sinh xã hội */}
      <SocialWelfareList />
    </div>
  );
}
