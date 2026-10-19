import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById, getAllArticles } from "@/lib/articles";
import ArticleDetailView from "@/components/news/ArticleDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  const absoluteImageUrl = article.imageUrl.startsWith("http")
    ? article.imageUrl
    : `${siteUrl}${article.imageUrl}`;

  return {
    title: `${article.title} | Quỹ Vì Người Nghèo Ea Súp`,
    description: article.sapo || article.content.slice(0, 160),
    authors: [{ name: article.authorName }],
    openGraph: {
      title: article.title,
      description: article.sapo || article.content.slice(0, 160),
      url: fullArticleUrl,
      siteName: "Quỹ Vì Người Nghèo Xã Ea Súp - Hệ Sinh Thái Ea Súp Số",
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.date,
      authors: [article.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.sapo || article.content.slice(0, 160),
      images: [absoluteImageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    return notFound();
  }

  const all = getAllArticles();
  const relatedArticles = all.filter((a) => a.id !== article.id);

  return <ArticleDetailView article={article} relatedArticles={relatedArticles} />;
}
