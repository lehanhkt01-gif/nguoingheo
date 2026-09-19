import fs from "fs";
import path from "path";
import os from "os";

export interface CampaignItem {
  id: number;
  code: string;
  title: string;
  beneficiaryName: string;
  village: string;
  situation: string;
  targetAmount: number;
  currentAmount: number;
  status: "ACTIVE" | "COMPLETED";
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignsStoreData {
  campaigns: CampaignItem[];
  updatedAt?: string;
}

export const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 1,
    code: "CD-1",
    title: "Xây dựng Nhà Đại đoàn kết cho hộ nghèo khó khăn về nhà ở",
    beneficiaryName: "Đồng bào khó khăn",
    village: "Xã Ea Súp",
    situation: "Xóa nhà tạm dột nát cho các hộ đồng bào và gia đình neo đơn có hoàn cảnh đặc biệt khó khăn tại 20 thôn buôn. Khảo sát thực địa ghi nhận nhiều căn nhà tranh tre nứa lá xuống cấp nghiêm trọng cần kinh phí mua tôn, gạch, xi măng kiên cố.",
    targetAmount: 200000000,
    currentAmount: 1297019,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
      "/images/hero-charity-bg.jpg",
    ],
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: 2,
    code: "CD-2",
    title: "Trao tặng Bò giống sinh kế giúp đồng bào thoát nghèo bền vững",
    beneficiaryName: "Đồng bào khó khăn",
    village: "Xã Ea Súp",
    situation: "Hỗ trợ bò cái sinh sản giống địa phương cho các hộ nghèo chí thú làm ăn nhưng thiếu vốn sản xuất trên địa bàn xã Ea Súp nhằm tạo sinh kế thoát nghèo bền vững lâu dài.",
    targetAmount: 100000000,
    currentAmount: 0,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
      "/images/hero-charity-bg.jpg",
    ],
    createdAt: "2026-02-01T08:00:00.000Z",
  },
];

let activeCampaignsFilePath: string | null = null;

function getCampaignsFilePath(): string {
  if (activeCampaignsFilePath) return activeCampaignsFilePath;

  const defaultPath = path.join(process.cwd(), "data", "campaigns_data.json");
  const defaultDir = path.dirname(defaultPath);

  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    fs.accessSync(defaultDir, fs.constants.W_OK);
    activeCampaignsFilePath = defaultPath;
    return defaultPath;
  } catch {
    const fallbackPath = path.join(os.tmpdir(), "campaigns_data.json");
    activeCampaignsFilePath = fallbackPath;
    return fallbackPath;
  }
}

let memoryCache: CampaignsStoreData | null = null;

export function getCampaignsData(): CampaignsStoreData {
  if (memoryCache) {
    return memoryCache;
  }

  const defaultData: CampaignsStoreData = {
    campaigns: INITIAL_CAMPAIGNS,
    updatedAt: new Date().toISOString(),
  };

  try {
    const filePath = getCampaignsFilePath();
    const fallbackPath = path.join(os.tmpdir(), "campaigns_data.json");
    const targetPath = fs.existsSync(filePath)
      ? filePath
      : fs.existsSync(fallbackPath)
      ? fallbackPath
      : null;

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(content);
      memoryCache = {
        campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      return memoryCache;
    } else {
      saveCampaignsData(defaultData);
    }
  } catch (error) {
    console.error("Lỗi khi đọc file campaigns_data.json:", error);
  }

  memoryCache = defaultData;
  return defaultData;
}

export function saveCampaignsData(data: Partial<CampaignsStoreData>): CampaignsStoreData {
  const current = getCampaignsData();
  const updated: CampaignsStoreData = {
    campaigns: data.campaigns !== undefined ? data.campaigns : current.campaigns,
    updatedAt: new Date().toISOString(),
  };

  memoryCache = updated;

  try {
    const targetPath = getCampaignsFilePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Lỗi khi ghi vào campaigns_data.json:", error);
    try {
      const tmpPath = path.join(os.tmpdir(), "campaigns_data.json");
      fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), "utf-8");
    } catch {}
  }

  return updated;
}
