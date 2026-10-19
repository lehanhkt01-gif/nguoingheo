import fs from "fs";
import path from "path";
import os from "os";

export interface PostItem {
  id: string;
  title: string;
  category: "TIN_TUC" | "HOAN_CANH" | "TRAO_QUA" | "THONG_BAO";
  categoryLabel: string;
  summary: string;
  content: string;
  authorName: string;
  authorUsername: string;
  village?: string;
  imageUrl?: string;
  date: string;
  views?: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt?: string;
}

export interface PostsStoreData {
  posts: PostItem[];
  updatedAt?: string;
}

const DEFAULT_POSTS: PostItem[] = [
  {
    id: "post_1",
    title: "Kế hoạch cao điểm Vận động ủng hộ Quỹ 'Vì người nghèo' năm 2026 xã Ea Súp",
    category: "THONG_BAO",
    categoryLabel: "Thông báo Mặt trận",
    summary: "Ban Thường trực UBMTTQ Việt Nam xã Ea Súp triển khai kế hoạch cao điểm vận động Quỹ năm 2026 tới toàn thể cán bộ, nhân dân và doanh nghiệp.",
    content: "Căn cứ Quyết định số 13/QĐ-MTTQ-BTT của Ban Thường trực UBMTTQ Việt Nam xã Ea Súp, Ban vận động Quỹ thông báo triển khai tháng cao điểm quyên góp hỗ trợ hộ nghèo, hộ cận nghèo có hoàn cảnh đặc biệt khó khăn trên địa bàn 20 thôn buôn. Toàn bộ tiền ủng hộ được tiếp nhận qua tài khoản BIDV 8630100930 và đối soát sao kê tự động 100% thời gian thực.",
    authorName: "Đ/c Lê Hồng Hạnh",
    authorUsername: "admin_easup",
    village: "Toàn xã Ea Súp",
    imageUrl: "/images/hero-charity-bg.jpg",
    date: "2026-01-15",
    views: 128,
    status: "PUBLISHED",
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "post_2",
    title: "Khảo sát và khởi công 02 căn nhà Đại đoàn kết tại Buôn Drai và Thôn 5",
    category: "HOAN_CANH",
    categoryLabel: "Hoàn cảnh an sinh",
    summary: "Đoàn công tác UBMTTQ xã do Chủ tịch Lê Hồng Hạnh dẫn đầu đã tiến hành nghiệm thu hiện trạng và quyết định hỗ trợ khởi công nhà ở cho 2 hộ khó khăn.",
    content: "Qua rà soát thực tế tại Buôn Drai và Thôn 5, gia đình ông Y'Khen Niê và bà Trần Thị Mai có nhà ở dột nát nghiêm trọng, thuộc diện hộ nghèo neo đơn. Ban vận động Quỹ Vì Người Nghèo xã Ea Súp đã quyết định phân bổ kinh phí hỗ trợ 50.000.000 đ/căn từ nguồn quỹ vận động.",
    authorName: "Đ/c Nguyễn Bá Bân",
    authorUsername: "nguyenbaban",
    village: "Buôn Drai & Thôn 5",
    imageUrl: "/images/hero-charity-bg.jpg",
    date: "2026-02-02",
    views: 95,
    status: "PUBLISHED",
    createdAt: "2026-02-02T09:30:00.000Z",
  },
  {
    id: "post_3",
    title: "Báo cáo công khai kết quả trao tặng 50 suất quà an sinh cho đồng bào khó khăn",
    category: "TRAO_QUA",
    categoryLabel: "Đợt trao quà",
    summary: "Hoàn thành trao tận tay 50 phần quà nhu yếu phẩm và tiền mặt cho các hộ gia đình chính sách, đồng bào dân tộc thiểu số nghèo.",
    content: "Chiều ngày 05/02/2026, tại Hội trường UBND xã Ea Súp, Ban Vận động Quỹ đã phối hợp với các nhà hảo tâm tổ chức trao tặng 50 suất quà, mỗi suất trị giá 500.000 đ tiền mặt cùng phần quà thiết yếu. Danh sách đã được đại diện 20 thôn buôn ký nhận đầy đủ.",
    authorName: "Đ/c Nguyễn Thị Miên",
    authorUsername: "nguyenthimien",
    village: "Toàn xã",
    imageUrl: "/images/logo-mttq.png",
    date: "2026-02-05",
    views: 142,
    status: "PUBLISHED",
    createdAt: "2026-02-05T14:00:00.000Z",
  },
];

let activePostsFilePath: string | null = null;

function getPostsFilePath(): string {
  if (activePostsFilePath) return activePostsFilePath;

  const defaultPath = path.join(process.cwd(), "data", "posts.json");
  const defaultDir = path.dirname(defaultPath);

  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    fs.accessSync(defaultDir, fs.constants.W_OK);
    activePostsFilePath = defaultPath;
    return defaultPath;
  } catch {
    const fallbackPath = path.join(os.tmpdir(), "posts.json");
    activePostsFilePath = fallbackPath;
    return fallbackPath;
  }
}

let memoryCache: PostsStoreData | null = null;

export function getPostsData(): PostsStoreData {
  if (memoryCache && Array.isArray(memoryCache.posts) && memoryCache.posts.length > 0) {
    return memoryCache;
  }

  const filePath = getPostsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.posts)) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Lỗi đọc file posts.json:", err);
  }

  const initialData: PostsStoreData = {
    posts: DEFAULT_POSTS,
    updatedAt: new Date().toISOString(),
  };
  savePostsData(initialData);
  return initialData;
}

export function savePostsData(data: PostsStoreData): PostsStoreData {
  const filePath = getPostsFilePath();
  const payload: PostsStoreData = {
    posts: data.posts || [],
    updatedAt: new Date().toISOString(),
  };

  memoryCache = payload;

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Không thể ghi file posts.json:", err);
  }

  return payload;
}

export function addPost(post: Omit<PostItem, "id" | "createdAt" | "categoryLabel">): PostItem {
  const store = getPostsData();

  const categoryLabels: Record<string, string> = {
    TIN_TUC: "Tin tức Mặt trận",
    HOAN_CANH: "Hoàn cảnh an sinh",
    TRAO_QUA: "Đợt trao quà",
    THONG_BAO: "Thông báo Mặt trận",
  };

  const newPost: PostItem = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    categoryLabel: categoryLabels[post.category] || "Tin tức",
    views: 1,
    status: "PUBLISHED",
    createdAt: new Date().toISOString(),
  };

  const updatedPosts = [newPost, ...store.posts];
  savePostsData({ posts: updatedPosts });
  return newPost;
}

export function deletePost(id: string): boolean {
  const store = getPostsData();
  const initialLength = store.posts.length;
  const filtered = store.posts.filter((p) => p.id !== id);

  if (filtered.length === initialLength) {
    throw new Error("Không tìm thấy bài đăng cần xóa.");
  }

  savePostsData({ posts: filtered });
  return true;
}
