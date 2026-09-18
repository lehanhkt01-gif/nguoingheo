import fs from "fs";
import path from "path";

export interface SystemSettings {
  geminiApiKey: string;
  geminiModel?: string;
  systemPrompt?: string;
  cassoApiKey?: string;
  cassoSecureToken?: string;
  cassoAccountNumber?: string;
  cassoApiUrl?: string;
  updatedAt?: string;
}

import os from "os";

let activeSettingsFilePath: string | null = null;

function getActiveSettingsFilePath(): string {
  if (activeSettingsFilePath) return activeSettingsFilePath;

  const defaultPath = path.join(process.cwd(), "data", "system_settings.json");
  const defaultDir = path.dirname(defaultPath);

  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    fs.accessSync(defaultDir, fs.constants.W_OK);
    activeSettingsFilePath = defaultPath;
    return defaultPath;
  } catch {
    const fallbackPath = path.join(os.tmpdir(), "system_settings.json");
    activeSettingsFilePath = fallbackPath;
    return fallbackPath;
  }
}

let memoryCache: SystemSettings | null = null;

export function getSystemSettings(): SystemSettings {
  if (memoryCache) {
    return memoryCache;
  }

  const defaultSettings: SystemSettings = {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: "gemini-2.0-flash",
    systemPrompt: "",
    cassoApiKey: process.env.CASSO_API_KEY || "",
    cassoSecureToken: process.env.CASSO_SECURE_TOKEN || process.env.CASSO_WEBHOOK_SECRET || "EaSup_Charity_2026_Secure_Token_Secret",
    cassoAccountNumber: process.env.CASSO_ACCOUNT_NUMBER || "8630100930",
    cassoApiUrl: process.env.CASSO_API_URL || "https://oauth.casso.vn/v2",
    updatedAt: new Date().toISOString(),
  };

  try {
    const filePath = getActiveSettingsFilePath();
    const fallbackPath = path.join(os.tmpdir(), "system_settings.json");
    const targetPath = fs.existsSync(filePath) ? filePath : (fs.existsSync(fallbackPath) ? fallbackPath : null);

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(content);
      memoryCache = {
        geminiApiKey: parsed.geminiApiKey || process.env.GEMINI_API_KEY || "",
        geminiModel: parsed.geminiModel || "gemini-2.0-flash",
        systemPrompt: parsed.systemPrompt || "",
        cassoApiKey: parsed.cassoApiKey || process.env.CASSO_API_KEY || "",
        cassoSecureToken: parsed.cassoSecureToken || process.env.CASSO_SECURE_TOKEN || process.env.CASSO_WEBHOOK_SECRET || "EaSup_Charity_2026_Secure_Token_Secret",
        cassoAccountNumber: parsed.cassoAccountNumber || process.env.CASSO_ACCOUNT_NUMBER || "8630100930",
        cassoApiUrl: parsed.cassoApiUrl || process.env.CASSO_API_URL || "https://oauth.casso.vn/v2",
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      return memoryCache;
    }
  } catch (error) {
    console.error("Lỗi khi đọc file system_settings.json:", error);
  }

  memoryCache = defaultSettings;
  return defaultSettings;
}

export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  const current = getSystemSettings();
  const updated: SystemSettings = {
    geminiApiKey: settings.geminiApiKey !== undefined ? settings.geminiApiKey.trim() : current.geminiApiKey,
    geminiModel: settings.geminiModel !== undefined ? settings.geminiModel.trim() : (current.geminiModel || "gemini-2.0-flash"),
    systemPrompt: settings.systemPrompt !== undefined ? settings.systemPrompt.trim() : current.systemPrompt,
    cassoApiKey: settings.cassoApiKey !== undefined ? settings.cassoApiKey.trim() : (current.cassoApiKey || ""),
    cassoSecureToken: settings.cassoSecureToken !== undefined ? settings.cassoSecureToken.trim() : (current.cassoSecureToken || "EaSup_Charity_2026_Secure_Token_Secret"),
    cassoAccountNumber: settings.cassoAccountNumber !== undefined ? settings.cassoAccountNumber.trim() : (current.cassoAccountNumber || "8630100930"),
    cassoApiUrl: settings.cassoApiUrl !== undefined ? settings.cassoApiUrl.trim() : (current.cassoApiUrl || "https://oauth.casso.vn/v2"),
    updatedAt: new Date().toISOString(),
  };

  memoryCache = updated;

  // Cập nhật biến môi trường runtime
  if (updated.geminiApiKey) {
    process.env.GEMINI_API_KEY = updated.geminiApiKey;
  }
  if (updated.cassoApiKey) {
    process.env.CASSO_API_KEY = updated.cassoApiKey;
  }
  if (updated.cassoSecureToken) {
    process.env.CASSO_SECURE_TOKEN = updated.cassoSecureToken;
  }
  if (updated.cassoAccountNumber) {
    process.env.CASSO_ACCOUNT_NUMBER = updated.cassoAccountNumber;
  }
  if (updated.cassoApiUrl) {
    process.env.CASSO_API_URL = updated.cassoApiUrl;
  }

  try {
    const targetPath = getActiveSettingsFilePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    // Nếu vẫn lỗi, thử ghi vào /tmp trực tiếp
    try {
      const tmpPath = path.join(os.tmpdir(), "system_settings.json");
      fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), "utf-8");
    } catch {
      // MemoryCache và process.env đã được cập nhật thành công, bỏ qua lỗi filesystem
    }
  }

  return updated;
}
