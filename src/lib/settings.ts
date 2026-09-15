import fs from "fs";
import path from "path";

export interface SystemSettings {
  geminiApiKey: string;
  systemPrompt?: string;
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
    systemPrompt: "",
    updatedAt: new Date().toISOString(),
  };

  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      memoryCache = {
        geminiApiKey: parsed.geminiApiKey || process.env.GEMINI_API_KEY || "",
        systemPrompt: parsed.systemPrompt || "",
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
    systemPrompt: settings.systemPrompt !== undefined ? settings.systemPrompt.trim() : current.systemPrompt,
    updatedAt: new Date().toISOString(),
  };

  memoryCache = updated;

  // Cập nhật biến môi trường runtime
  if (updated.geminiApiKey) {
    process.env.GEMINI_API_KEY = updated.geminiApiKey;
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
