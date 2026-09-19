import fs from "fs";
import path from "path";
import os from "os";

export interface WelfareFileItem {
  url: string;
  name: string;
  type: "image" | "pdf";
  size?: number;
}

export interface WelfareCase {
  id: number;
  recipientName: string;
  village: string;
  situation: string;
  amount: number; // Số tiền trao
  targetAmount?: number;
  currentAmount?: number;
  imageUrl?: string;
  files?: WelfareFileItem[]; // Tối đa 5 file: ảnh hoặc PDF chứng từ
  createdAt?: string;
}

export interface GiftBatch {
  id: number;
  title: string;
  village: string;
  recipientCount: number;
  amount: number;
  date: string;
  proofNote: string;
}

export interface WelfareStoreData {
  cases: WelfareCase[];
  gifts: GiftBatch[];
  updatedAt?: string;
}

export const INITIAL_CASES: WelfareCase[] = [];

export const INITIAL_GIFTS: GiftBatch[] = [];

let activeWelfareFilePath: string | null = null;

function getWelfareFilePath(): string {
  if (activeWelfareFilePath) return activeWelfareFilePath;

  const defaultPath = path.join(process.cwd(), "data", "welfare_data.json");
  const defaultDir = path.dirname(defaultPath);

  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    fs.accessSync(defaultDir, fs.constants.W_OK);
    activeWelfareFilePath = defaultPath;
    return defaultPath;
  } catch {
    const fallbackPath = path.join(os.tmpdir(), "welfare_data.json");
    activeWelfareFilePath = fallbackPath;
    return fallbackPath;
  }
}

let memoryCache: WelfareStoreData | null = null;

export function getWelfareData(): WelfareStoreData {
  if (memoryCache) {
    return memoryCache;
  }

  const defaultData: WelfareStoreData = {
    cases: INITIAL_CASES,
    gifts: INITIAL_GIFTS,
    updatedAt: new Date().toISOString(),
  };

  try {
    const filePath = getWelfareFilePath();
    const fallbackPath = path.join(os.tmpdir(), "welfare_data.json");
    const targetPath = fs.existsSync(filePath)
      ? filePath
      : fs.existsSync(fallbackPath)
      ? fallbackPath
      : null;

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(content);
      memoryCache = {
        cases: Array.isArray(parsed.cases) ? parsed.cases : [],
        gifts: Array.isArray(parsed.gifts) ? parsed.gifts : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      return memoryCache;
    } else {
      // Lưu file ban đầu để lần sau khởi động dữ liệu đã tồn tại
      saveWelfareData(defaultData);
    }
  } catch (error) {
    console.error("Lỗi khi đọc file welfare_data.json:", error);
  }

  memoryCache = defaultData;
  return defaultData;
}

export function saveWelfareData(data: Partial<WelfareStoreData>): WelfareStoreData {
  const current = getWelfareData();
  const updated: WelfareStoreData = {
    cases: data.cases !== undefined ? data.cases : current.cases,
    gifts: data.gifts !== undefined ? data.gifts : current.gifts,
    updatedAt: new Date().toISOString(),
  };

  memoryCache = updated;

  try {
    const targetPath = getWelfareFilePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Lỗi khi ghi vào welfare_data.json:", error);
    try {
      const tmpPath = path.join(os.tmpdir(), "welfare_data.json");
      fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), "utf-8");
    } catch {}
  }

  return updated;
}
