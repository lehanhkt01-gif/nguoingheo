import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | string | bigint | null | undefined): string {
  if (amount === null || amount === undefined) return "0 đ";
  const num = typeof amount === "bigint" ? Number(amount) : Number(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number | string | bigint | null | undefined): string {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(Number(num));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return formatDateTime(d);
}

export interface VietQRParams {
  amount?: number;
  memo?: string;
  accountNumber?: string;
  accountName?: string;
}

export function buildVietQRUrl({
  amount = 0,
  memo = "",
  accountNumber = "8630100930",
  accountName = "UY BAN MTTQ VN XA EA SUP",
}: VietQRParams): string {
  const encodedAccountName = encodeURIComponent(accountName);
  const addInfoParam = memo && memo.trim() ? `&addInfo=${encodeURIComponent(memo.trim())}` : "";
  const amountParam = amount && amount > 0 ? `&amount=${amount}` : "";

  // Template compact2 chuẩn NAPAS 247 BIDV
  return `https://img.vietqr.io/image/bidv-${accountNumber}-compact2.png?accountName=${encodedAccountName}${addInfoParam}${amountParam}`;
}

export function parseTransactionDescription(description: string): {
  campaignCode: string | null;
  donorName: string | null;
} {
  const clean = description.toUpperCase().trim();

  // Nhận diện tiền tố chiến dịch VNN [MÃ] [TÊN]
  const pattern = /VNN\s+([A-Z0-9_-]+)(?:\s+(.*))?/;
  const match = clean.match(pattern);

  if (match) {
    const code = match[1];
    let donor = match[2] || null;
    if (donor) {
      donor = donor.replace(/\b(UNG HO|DONG GOP|CHUYEN KHOAN|TIEN|CHO|HO)\b/g, "").trim();
    }
    return {
      campaignCode: code,
      donorName: donor || null,
    };
  }

  // Nhận diện mã chiến dịch trực tiếp nếu có
  const directMatch = clean.match(/\b(NDDK\d+|TET\d*|SK\d+|CT\d+)\b/);
  if (directMatch) {
    return {
      campaignCode: directMatch[1],
      donorName: null,
    };
  }

  return { campaignCode: null, donorName: null };
}

/**
 * Lọc sạch nội dung chuyển khoản ngân hàng:
 * Loại bỏ toàn bộ tiền tố tự sinh của ngân hàng (TKThe :..., tai .... BIDV;8630100930; hoặc IBFT;...)
 * Loại bỏ mã trace số đuôi ngân hàng (-02009704050918173242202633B9040550)
 * Chỉ giữ lại phần nội dung do chính người chuyển tự tay nhập.
 */
export function cleanTransferContent(desc?: string | null): string {
  let s = String(desc || "").trim();
  if (!s) return "Ủng hộ Quỹ Vì Người Nghèo";

  // 1. Cắt bỏ cụm tiền tố ngân hàng tới sau số tài khoản thụ hưởng (8630100930) hoặc tiền tố thẻ/IBFT
  if (/8630100930/i.test(s)) {
    s = s.replace(/^.*?8630100930\s*[:;,-]?\s*/i, "");
  } else if (/^(?:TKThe|TK The|IBFT|MBVCB|NAPAS|VBA|VCB)/i.test(s)) {
    const parts = s.split(";");
    if (parts.length >= 3) {
      s = parts.slice(2).join(";");
    } else {
      s = s.replace(/^(?:TKThe|TK The|IBFT|MBVCB|NAPAS)[^;]*;+/i, "");
    }
  }

  // 2. Cắt bỏ mã trace đuôi ngân hàng: -02009704050918173242202633B9040550
  s = s.replace(/-\d{8,}[a-zA-Z0-9]*$/i, "");
  s = s.replace(/(?:\.|;|-)\s*(?:Trace|Ref|FT|TraceNo)\s*[:.]?\s*\w+$/i, "");

  s = s.trim();
  // Xóa các ký tự phân cách ở đầu nếu còn sót
  s = s.replace(/^[-;:,.\s]+/, "");

  if (!s || /^[-.,;:_]+$/.test(s)) return "Ủng hộ Quỹ Vì Người Nghèo";
  return s;
}

