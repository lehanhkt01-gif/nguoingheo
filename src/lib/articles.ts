import { getWelfareData, WelfareCase, GiftBatch, WelfareFileItem } from "./welfare";
import { getPostsData, PostItem } from "./posts";

export interface JournalisticArticle {
  id: string; // e.g. "case-1", "gift-1", "post-1", "1"
  rawId: number | string;
  type: "CASE" | "GIFT" | "POST";
  slug: string;
  title: string;
  sapo: string;
  content: string;
  category: string;
  categoryLabel: string;
  categoryBadgeColor: "rose" | "emerald" | "blue" | "amber";
  village: string;
  villages?: string[];
  date: string;
  authorName: string;
  authorTitle: string;
  signerName: string;
  signerTitle: string;
  imageUrl: string;
  images: string[];
  files: WelfareFileItem[];
  amount?: number;
  targetAmount?: number;
  recipientCount?: number;
  beneficiaryName?: string;
  proofNote?: string;
  views: number;
  readingTimeMinutes: number;
  shareUrl: string;
}

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function caseToArticle(item: WelfareCase): JournalisticArticle {
  const images = item.files?.filter((f) => f.type === "image").map((f) => f.url) || [];
  if (item.imageUrl && !images.includes(item.imageUrl)) {
    images.unshift(item.imageUrl);
  }
  if (images.length === 0) {
    images.push("/images/hero-charity-bg.jpg");
  }

  const title = `Kêu gọi ủng hộ hoàn cảnh khó khăn: ${item.recipientName} tại ${item.village}`;
  const sapo = `UBMTTQ Việt Nam xã Ea Súp kêu gọi các cơ quan, tổ chức, nhà hảo tâm trong và ngoài huyện chung tay giúp đỡ hộ gia đình ${item.recipientName} (${item.village}) có hoàn cảnh đặc biệt khó khăn, nhà ở tạm bợ dột nát.`;

  return {
    id: `case-${item.id}`,
    rawId: item.id,
    type: "CASE",
    slug: `hoan-canh-${item.id}-${sanitizeSlug(item.recipientName)}`,
    title,
    sapo,
    content: item.situation,
    category: "HOAN_CANH",
    categoryLabel: "Hoàn cảnh cần giúp đỡ",
    categoryBadgeColor: "rose",
    village: item.village,
    villages: [item.village],
    date: item.createdAt ? item.createdAt.slice(0, 10) : "2026-02-01",
    authorName: "Ban Thường trực UBMTTQ xã Ea Súp",
    authorTitle: "Cơ quan thẩm định & phê duyệt hồ sơ",
    signerName: "Đ/c Lê Hồng Hạnh",
    signerTitle: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp - Trưởng ban Vận động Quỹ",
    imageUrl: images[0],
    images,
    files: item.files || [],
    amount: item.amount,
    targetAmount: item.targetAmount || item.amount,
    beneficiaryName: item.recipientName,
    views: 350 + (Number(item.id) || 1) * 37,
    readingTimeMinutes: 3,
    shareUrl: `https://nguoingheo.easupso.com/tin-tuc/case-${item.id}`,
  };
}

export function giftToArticle(item: GiftBatch): JournalisticArticle {
  const images = item.files?.filter((f) => f.type === "image").map((f) => f.url) || [];
  if (item.imageUrl && !images.includes(item.imageUrl)) {
    images.unshift(item.imageUrl);
  }
  if (images.length === 0) {
    images.push("/images/hero-charity-bg.jpg");
  }

  const villages = item.villages && item.villages.length > 0
    ? item.villages
    : item.village.split(",").map((s) => s.trim());

  const sapo = `Ban Thường trực UBMTTQ Việt Nam xã Ea Súp tổ chức đợt trao quà an sinh xã hội thực tế cho ${item.recipientCount} hộ thụ hưởng tại địa bàn ${item.village}. Toàn bộ kinh phí được giải ngân từ Quỹ Vì Người Nghèo và đối soát công khai 100% kèm chứng từ mộc đỏ.`;

  return {
    id: `gift-${item.id}`,
    rawId: item.id,
    type: "GIFT",
    slug: `ho-so-trao-qua-${item.id}-${sanitizeSlug(item.title)}`,
    title: item.title,
    sapo,
    content: item.proofNote || `Hoàn tất trao tận tay ${item.recipientCount} phần quà ý nghĩa cho các hộ nghèo, khó khăn tại ${item.village}.`,
    category: "TRAO_QUA",
    categoryLabel: "Hồ sơ đã trao / Đã giải ngân",
    categoryBadgeColor: "emerald",
    village: item.village,
    villages,
    date: item.date || "2026-02-05",
    authorName: "Ban Vận động Quỹ Vì Người Nghèo xã Ea Súp",
    authorTitle: "Đơn vị chủ trì trao quà & lập biên bản",
    signerName: "Đ/c Lê Hồng Hạnh",
    signerTitle: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
    imageUrl: images[0],
    images,
    files: item.files || [],
    amount: item.amount,
    recipientCount: item.recipientCount,
    proofNote: item.proofNote,
    views: 420 + (Number(item.id) || 1) * 45,
    readingTimeMinutes: 4,
    shareUrl: `https://nguoingheo.easupso.com/tin-tuc/gift-${item.id}`,
  };
}

export function postToArticle(item: PostItem): JournalisticArticle {
  const categoryLabels: Record<string, { label: string; color: "rose" | "emerald" | "blue" | "amber" }> = {
    TIN_TUC: { label: "Tin tức Mặt trận", color: "blue" },
    HOAN_CANH: { label: "Hoàn cảnh an sinh", color: "rose" },
    TRAO_QUA: { label: "Đợt trao quà", color: "emerald" },
    THONG_BAO: { label: "Thông báo Mặt trận", color: "amber" },
  };

  const meta = categoryLabels[item.category] || { label: "Tin tức an sinh", color: "blue" };

  return {
    id: `post-${item.id}`,
    rawId: item.id,
    type: "POST",
    slug: `tin-tuc-${item.id}-${sanitizeSlug(item.title)}`,
    title: item.title,
    sapo: item.summary || item.content.slice(0, 160) + "...",
    content: item.content,
    category: item.category,
    categoryLabel: meta.label,
    categoryBadgeColor: meta.color,
    village: item.village || "Toàn xã Ea Súp",
    date: item.date || "2026-02-10",
    authorName: item.authorName || "Đ/c Lê Hồng Hạnh",
    authorTitle: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
    signerName: "Đ/c Lê Hồng Hạnh",
    signerTitle: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
    imageUrl: item.imageUrl || "/images/hero-charity-bg.jpg",
    images: [item.imageUrl || "/images/hero-charity-bg.jpg"],
    files: [],
    views: item.views || 180,
    readingTimeMinutes: Math.max(2, Math.round(item.content.length / 400)),
    shareUrl: `https://nguoingheo.easupso.com/tin-tuc/post-${item.id}`,
  };
}

export function getAllArticles(): JournalisticArticle[] {
  const welfare = getWelfareData();
  const postsStore = getPostsData();

  const caseArticles = (welfare.cases || []).map(caseToArticle);
  const giftArticles = (welfare.gifts || []).map(giftToArticle);
  const postArticles = (postsStore.posts || []).map(postToArticle);

  const combined = [...caseArticles, ...giftArticles, ...postArticles];
  // Sắp xếp theo ngày giảm dần
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleById(id: string): JournalisticArticle | null {
  const cleanId = decodeURIComponent(id).trim();

  // 1. Nếu bắt đầu bằng case- hoặc số thuộc cases
  if (cleanId.startsWith("case-")) {
    const rawNum = Number(cleanId.replace("case-", ""));
    const welfare = getWelfareData();
    const found = welfare.cases.find((c) => c.id === rawNum);
    if (found) return caseToArticle(found);
  }

  // 2. Nếu bắt đầu bằng gift-
  if (cleanId.startsWith("gift-")) {
    const rawNum = Number(cleanId.replace("gift-", ""));
    const welfare = getWelfareData();
    const found = welfare.gifts.find((g) => g.id === rawNum);
    if (found) return giftToArticle(found);
  }

  // 3. Nếu bắt đầu bằng post-
  if (cleanId.startsWith("post-")) {
    const rawPostId = cleanId.replace("post-", "");
    const postsStore = getPostsData();
    const found = postsStore.posts.find((p) => p.id === rawPostId || `post_${p.id}` === cleanId);
    if (found) return postToArticle(found);
  }

  // 4. Tìm kiếm tự do theo id trong tất cả articles
  const all = getAllArticles();
  const directMatch = all.find((a) => a.id === cleanId || String(a.rawId) === cleanId || a.slug === cleanId);
  if (directMatch) return directMatch;

  // 5. Nếu chưa có dữ liệu nào khớp (ví dụ người dùng mở một ID mẫu)
  return null;
}
