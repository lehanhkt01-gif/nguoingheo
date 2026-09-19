import fs from "fs";
import path from "path";
import os from "os";

export interface CampaignFileItem {
  url: string;
  name: string;
  type: "image" | "pdf";
  size?: number;
}

export interface CampaignItem {
  id: number;
  code: string;
  title: string;
  beneficiaryName: string;
  village: string;
  situation: string;
  amount: number; // "Số tiền trao"
  targetAmount?: number;
  currentAmount?: number;
  status: "ACTIVE" | "COMPLETED";
  images: string[];
  files?: CampaignFileItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignsStoreData {
  campaigns: CampaignItem[];
  updatedAt?: string;
}

// Xóa sạch toàn bộ dữ liệu mẫu cũ để bắt đầu nhập dữ liệu thực tế
export const INITIAL_CAMPAIGNS: CampaignItem[] = [];

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
