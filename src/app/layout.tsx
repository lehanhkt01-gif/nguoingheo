import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://nguoingheo.easupso.com"),
  title: "Quỹ Vì Người Nghèo Ea Súp | Cổng Thông Tin & Sao Kê Minh Bạch 100%",
  description:
    "Cổng thông tin & Sao kê minh bạch thời gian thực tài khoản tiếp nhận duy nhất BIDV 8630100930 của Ban Thường trực UBMTTQ Việt Nam xã Ea Súp, tỉnh Đắk Lắk. Đối soát tự động qua Casso Banking.",
  keywords: [
    "Quỹ vì người nghèo Ea Súp",
    "Ea Súp Đắk Lắk",
    "Mặt trận Tổ quốc xã Ea Súp",
    "Sao kê BIDV 8630100930",
    "Nhà Đại đoàn kết Ea Súp",
    "Casso Webhook",
  ],
  authors: [{ name: "UBMTTQ Việt Nam xã Ea Súp" }],
  openGraph: {
    title: "Quỹ Vì Người Nghèo Ea Súp - Minh Bạch Dòng Tiền An Sinh Cấp Xã",
    description: "Toàn bộ dòng tiền tiếp nhận và giải ngân 20 thôn buôn công khai 100% trên tài khoản BIDV 8630100930.",
    url: "https://nguoingheo.easupso.com",
    siteName: "Quỹ Vì Người Nghèo Xã Ea Súp",
    images: [
      {
        url: "/images/og-review.png",
        width: 1200,
        height: 630,
        alt: "Cổng Thông Tin & Sao Kê Quỹ Vì Người Nghèo Xã Ea Súp",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quỹ Vì Người Nghèo Ea Súp - Minh Bạch Dòng Tiền An Sinh Cấp Xã",
    description: "Toàn bộ dòng tiền tiếp nhận và giải ngân 20 thôn buôn công khai 100% trên tài khoản BIDV 8630100930.",
    images: ["/images/og-review.png"],
  },
  icons: {
    icon: [
      { url: "/images/logo-mttq.png", type: "image/png" },
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/images/logo-mttq.png",
    apple: "/images/logo-mttq.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="icon" href="/images/logo-mttq.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo-mttq.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo-mttq.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
