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
  villages?: string[]; // Hỗ trợ chọn nhiều thôn/buôn một lúc
  recipientCount: number;
  amount: number;
  date: string;
  proofNote: string;
  imageUrl?: string;
  files?: WelfareFileItem[]; // Tối đa 5 file: ảnh hoặc PDF chứng từ
  createdAt?: string;
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

/**
 * Đồng bộ danh sách Đợt trao quà (gifts trong welfare_data.json) vào bảng Disbursement trong PostgreSQL.
 * Giúp các thông số Tiền ra (-), Đã giải ngân, Sao kê tab Tiền ra luôn cập nhật tức thời 100%.
 */
export async function syncWelfareGiftsToDisbursements(inputGifts?: GiftBatch[]): Promise<number> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const gifts = inputGifts !== undefined ? inputGifts : (getWelfareData().gifts || []);
    const validGiftIds = new Set(gifts.map((g) => g.id));

    // 1. Lấy tất cả disbursements do welfare gifts đồng bộ vào
    const existingWelfareDisbursements = await prisma.disbursement.findMany({
      where: {
        notes: {
          contains: "[Đợt trao quà #",
        },
      },
    });

    // 2. Xóa các đợt trao quà đã bị xóa khỏi gifts
    for (const d of existingWelfareDisbursements) {
      const match = d.notes?.match(/\[Đợt trao quà #(\d+)\]/);
      if (match && match[1]) {
        const giftId = Number(match[1]);
        if (!validGiftIds.has(giftId)) {
          await prisma.disbursement.delete({ where: { id: d.id } });
        }
      }
    }

    // 3. Upsert các gift hiện có vào disbursement
    let syncedCount = 0;
    for (const g of gifts) {
      const tag = `[Đợt trao quà #${g.id}]`;
      const proofUrl = g.imageUrl || (Array.isArray(g.files) && g.files[0]?.url) || null;
      const noteText = `${tag} ${g.proofNote || g.title || ""}${g.recipientCount ? ` (${g.recipientCount} hộ thụ hưởng)` : ""}`.trim();
      const villageText = g.village || (Array.isArray(g.villages) && g.villages.join(", ")) || "Xã Ea Súp";
      const dateVal = g.date ? new Date(g.date) : new Date();

      const existing = await prisma.disbursement.findFirst({
        where: {
          notes: {
            contains: tag,
          },
        },
      });

      if (existing) {
        await prisma.disbursement.update({
          where: { id: existing.id },
          data: {
            recipientName: g.title,
            village: villageText,
            amount: Number(g.amount) || 0,
            proofImageUrl: proofUrl,
            date: !isNaN(dateVal.getTime()) ? dateVal : new Date(),
            notes: noteText,
          },
        });
      } else {
        await prisma.disbursement.create({
          data: {
            recipientName: g.title,
            village: villageText,
            amount: Number(g.amount) || 0,
            proofImageUrl: proofUrl,
            date: !isNaN(dateVal.getTime()) ? dateVal : new Date(),
            notes: noteText,
          },
        });
      }
      syncedCount++;
    }

    return syncedCount;
  } catch (err) {
    console.error("Lỗi đồng bộ Đợt trao quà vào Disbursement:", err);
    return 0;
  }
}

/**
 * Xóa toàn bộ các bản ghi Disbursement do Đợt trao quà tạo ra
 */
export async function clearWelfareDisbursements(): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.disbursement.deleteMany({
      where: {
        notes: {
          contains: "[Đợt trao quà #",
        },
      },
    });
  } catch (err) {
    console.error("Lỗi xóa Đợt trao quà trong Disbursement:", err);
  }
}
