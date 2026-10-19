import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById, getAllArticles } from "@/lib/articles";
import ArticleDetailView from "@/components/news/ArticleDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function parseDateToIso(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const s = String(dateStr).trim();
  try {
    // 1. Kiểm tra định dạng DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/");
      const iso = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T08:00:00+07:00`);
      if (!isNaN(iso.getTime())) return iso.toISOString();
    }
    // 2. Kiểm tra định dạng chuẩn
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch {}
  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const article = getArticleById(id);

    if (!article) {
      return {
        title: "Không tìm thấy bài viết | Quỹ Vì Người Nghèo Xã Ea Súp",
        description: "Bài viết hoặc thông tin an sinh này không tồn tại hoặc đã được gỡ bỏ.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nguoingheo.easupso.com";
    const fullArticleUrl = `${siteUrl}/tin-tuc/${encodeURIComponent(article.id)}`;
    const rawImg = article.imageUrl || "/hero-charity-bg.jpg";
    const absoluteImageUrl = rawImg.startsWith("http")
      ? rawImg
      : `${siteUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;

    const isoDate = parseDateToIso(article.date);

    return {
      title: `${article.title || "Bản tin an sinh"} | Quỹ Vì Người Nghèo Ea Súp`,
      description: (article.sapo || article.content || "Bản tin an sinh").slice(0, 160),
      authors: [{ name: article.authorName || "UBMTTQ Việt Nam xã Ea Súp" }],
      openGraph: {
        title: article.title || "Bản tin an sinh xã Ea Súp",
        description: (article.sapo || article.content || "Bản tin an sinh").slice(0, 160),
        url: fullArticleUrl,
        siteName: "Quỹ Vì Người Nghèo Xã Ea Súp - Hệ Sinh Thái Ea Súp Số",
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: article.title || "Bản tin an sinh",
          },
        ],
        type: "article",
        ...(isoDate ? { publishedTime: isoDate } : {}),
        authors: [article.authorName || "UBMTTQ Việt Nam xã Ea Súp"],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title || "Bản tin an sinh xã Ea Súp",
        description: (article.sapo || article.content || "Bản tin an sinh").slice(0, 160),
        images: [absoluteImageUrl],
      },
    };
  } catch (err) {
    console.error("Lỗi trong generateMetadata:", err);
    return {
      title: "Bản tin an sinh | Quỹ Vì Người Nghèo Xã Ea Súp",
      description: "Cổng thông tin an sinh xã hội MTTQ xã Ea Súp",
    };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  try {
    const { id } = await params;
    const article = getArticleById(id);

    if (!article) {
      return notFound();
    }

    const all = getAllArticles();
    const relatedArticles = all.filter((a) => a.id !== article.id);

    return <ArticleDetailView article={article} relatedArticles={relatedArticles} />;
  } catch (err) {
    console.error("Lỗi khi render ArticleDetailPage:", err);
    return notFound();
  }
}
