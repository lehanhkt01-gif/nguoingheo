import fs from "fs";
import path from "path";
import os from "os";

export interface WelfareCase {
  id: number;
  recipientName: string;
  village: string;
  situation: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
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

export const INITIAL_CASES: WelfareCase[] = [
  {
    id: 1,
    recipientName: "Trao quà 2230 hộ nghèo, cận nghèo",
    village: "Buôn A",
    situation: "Trao quà hộ gia đình nghèo, cận nghèo",
    targetAmount: 80000000,
    currentAmount: 0,
    imageUrl: "/images/hero-charity-bg.jpg",
  },
  {
    id: 2,
    recipientName: "Hộ ông Nguyễn Văn Sáng",
    village: "Thôn 5",
    situation: "Gia đình có 2 con nhỏ, mẹ già ốm đau, thiếu tư liệu sản xuất và nhà ở kiên cố.",
    targetAmount: 60000000,
    currentAmount: 0,
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    recipientName: "10 Hộ nghèo đồng bào dân tộc",
    village: "Thôn 14 & Thôn 12",
    situation: "Hỗ trợ bò cái giống sinh sản địa phương nhằm tạo sinh kế thoát nghèo bền vững lâu dài.",
    targetAmount: 50000000,
    currentAmount: 0,
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80",
  },
];

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
        cases: Array.isArray(parsed.cases) && parsed.cases.length > 0 ? parsed.cases : INITIAL_CASES,
        gifts: Array.isArray(parsed.gifts) ? parsed.gifts : INITIAL_GIFTS,
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
