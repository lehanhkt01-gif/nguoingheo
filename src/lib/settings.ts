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

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "system_settings.json");

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
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
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
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Lỗi khi lưu file system_settings.json:", error);
  }

  return updated;
}
