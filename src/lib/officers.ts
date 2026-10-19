import fs from "fs";
import path from "path";
import os from "os";

export interface Officer {
  id: string;
  username: string;
  password: string;
  fullName: string;
  title: string;
  phone?: string;
  role: "ADMIN" | "OFFICER";
  canPost: boolean;
  canDelete: boolean;
  canManageOfficers: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OfficersStoreData {
  officers: Officer[];
  updatedAt?: string;
}

const DEFAULT_OFFICERS: Officer[] = [
  {
    id: "1",
    username: process.env.ADMIN_USERNAME || "admin_easup",
    password: process.env.ADMIN_PASSWORD || "EaSup@Admin2026!",
    fullName: "Đ/c Lê Hồng Hạnh",
    title: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
    phone: "0888.023.023",
    role: "ADMIN",
    canPost: true,
    canDelete: true,
    canManageOfficers: true,
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "2",
    username: "nguyenbaban",
    password: "EaSup@2026",
    fullName: "Đ/c Nguyễn Bá Bân",
    title: "Phó Ban Vận Động Quỹ",
    phone: "0912.345.678",
    role: "OFFICER",
    canPost: true,
    canDelete: true,
    canManageOfficers: false,
    createdAt: "2026-01-14T08:00:00.000Z",
  },
  {
    id: "3",
    username: "nguyenthimien",
    password: "EaSup@2026",
    fullName: "Đ/c Nguyễn Thị Miên",
    title: "Phó Ban Thường Trực MTTQ",
    phone: "0987.654.321",
    role: "OFFICER",
    canPost: true,
    canDelete: false,
    canManageOfficers: false,
    createdAt: "2026-01-14T08:00:00.000Z",
  },
];

let activeOfficersFilePath: string | null = null;

function getOfficersFilePath(): string {
  if (activeOfficersFilePath) return activeOfficersFilePath;

  const defaultPath = path.join(process.cwd(), "data", "officers.json");
  const defaultDir = path.dirname(defaultPath);

  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    fs.accessSync(defaultDir, fs.constants.W_OK);
    activeOfficersFilePath = defaultPath;
    return defaultPath;
  } catch {
    const fallbackPath = path.join(os.tmpdir(), "officers.json");
    activeOfficersFilePath = fallbackPath;
    return fallbackPath;
  }
}

let memoryCache: OfficersStoreData | null = null;

export function getOfficersData(): OfficersStoreData {
  if (memoryCache && Array.isArray(memoryCache.officers) && memoryCache.officers.length > 0) {
    return memoryCache;
  }

  const filePath = getOfficersFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.officers) && parsed.officers.length > 0) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Lỗi đọc file officers.json, sử dụng danh sách mặc định:", err);
  }

  const initialData: OfficersStoreData = {
    officers: DEFAULT_OFFICERS,
    updatedAt: new Date().toISOString(),
  };
  saveOfficersData(initialData);
  return initialData;
}

export function saveOfficersData(data: OfficersStoreData): OfficersStoreData {
  const filePath = getOfficersFilePath();
  const payload: OfficersStoreData = {
    officers: data.officers || [],
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
    console.error("Không thể ghi file officers.json:", err);
  }

  return payload;
}

export function findOfficerByUsername(username: string): Officer | undefined {
  const data = getOfficersData();
  const cleanUser = username.trim().toLowerCase();
  return data.officers.find(
    (o) => o.username.trim().toLowerCase() === cleanUser
  );
}

export function verifyOfficer(username: string, pass: string): Officer | null {
  const officer = findOfficerByUsername(username);
  if (!officer) return null;
  if (officer.password === pass) return officer;
  // Cho phép fallback nếu là admin_easup và env khớp
  if (
    officer.username === (process.env.ADMIN_USERNAME || "admin_easup") &&
    pass === (process.env.ADMIN_PASSWORD || "EaSup@Admin2026!")
  ) {
    return officer;
  }
  return null;
}

export function addOfficer(data: Omit<Officer, "id" | "createdAt">): Officer {
  const store = getOfficersData();
  const cleanUsername = data.username.trim().toLowerCase();

  const existing = store.officers.find(
    (o) => o.username.trim().toLowerCase() === cleanUsername
  );
  if (existing) {
    throw new Error(`Tên đăng nhập "${data.username}" đã tồn tại trên hệ thống.`);
  }

  const newOfficer: Officer = {
    ...data,
    id: `cb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    createdAt: new Date().toISOString(),
  };

  const updatedOfficers = [...store.officers, newOfficer];
  saveOfficersData({ officers: updatedOfficers });
  return newOfficer;
}

export function deleteOfficer(id: string): boolean {
  const store = getOfficersData();
  const officer = store.officers.find((o) => o.id === id);
  if (!officer) {
    throw new Error("Không tìm thấy cán bộ cần xóa.");
  }
  if (officer.role === "ADMIN" || officer.username === "admin_easup") {
    throw new Error("Không thể xóa tài khoản Quản trị viên tối cao của Mặt trận.");
  }

  const updatedOfficers = store.officers.filter((o) => o.id !== id);
  saveOfficersData({ officers: updatedOfficers });
  return true;
}

export function changeOfficerPassword(username: string, newPass: string): boolean {
  const store = getOfficersData();
  const cleanUser = username.trim().toLowerCase();
  const index = store.officers.findIndex(
    (o) => o.username.trim().toLowerCase() === cleanUser
  );

  if (index === -1) {
    throw new Error(`Không tìm thấy tài khoản cán bộ: ${username}`);
  }

  store.officers[index].password = newPass;
  store.officers[index].updatedAt = new Date().toISOString();
  saveOfficersData(store);
  return true;
}
