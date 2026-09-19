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
 * Che mã giao dịch / mã tham chiếu: che gần như toàn bộ, chỉ giữ 2 ký tự cuối
 * Ví dụ: 15872693 -> ******93 | PC-000001 -> PC-****01
 */
export function maskReference(ref?: string | null): string {
  if (!ref) return "******";
  const s = String(ref).trim();
  if (s.startsWith("PC-")) {
    const num = s.slice(3);
    if (num.length <= 2) return "PC-**";
    return `PC-${"*".repeat(Math.max(2, num.length - 2))}${num.slice(-2)}`;
  }
  if (s.length <= 4) return `${"*".repeat(Math.max(1, s.length - 1))}${s.slice(-1)}`;
  return `${"*".repeat(s.length - 2)}${s.slice(-2)}`;
}

/**
 * Che số tài khoản: Chỉ giữ 3 số cuối, các số đầu thành dấu *
 * Ví dụ: 5212205195132 -> **********132 | 1071604098 -> *******098
 */
export function maskAccountNumber(acc?: string | null): string {
  if (!acc) return "***";
  const s = String(acc).trim();
  if (s.length <= 3) return "*".repeat(s.length);
  return `${"*".repeat(s.length - 3)}${s.slice(-3)}`;
}

/**
 * Bóc tách tên nhà hảo tâm sạch sẽ từ nội dung chuyển khoản, loại bỏ tên ngân hàng
 */
export function extractDonorNameFromMemo(memo?: string | null): string {
  if (!memo) return "";
  let s = String(memo).trim();
  // Bỏ tiền tố TK nếu có
  s = s.replace(/^TK:\s*[*0-9]+\s*-\s*/i, "");
  // Bỏ nếu là tên viết tắt ngân hàng
  if (/^(BIDV|VCB|MB|ACB|VBA|NGAN HANG|VIETINBANK|AGRIBANK)$/i.test(s)) return "";

  const match = s.match(/^([A-ZÀ-Ỹ\s]{3,35})\s+(?:chuyen\s*tien|ung\s*ho|dong\s*gop|ck\b|gui\s*quy)/i);
  if (match && match[1]) {
    const name = match[1].trim();
    if (name.length >= 3 && !/^(TK|STK|BIDV|VCB|MB|ACB|VBA)$/i.test(name)) {
      return name;
    }
  }

  if (/^[A-ZÀ-Ỹ\s]{3,35}$/i.test(s) && !/^(BIDV|VCB|MB|ACB|VBA|NGAN HANG)$/i.test(s)) {
    return s;
  }
  return s;
}

/**
 * Lọc sạch nội dung chuyển khoản ngân hàng:
 * - Ẩn hết toàn bộ nội dung rác hệ thống ngân hàng (mã trace đuôi -02009..., các cụm tai VBAAVNVX, MBVCB, CT tu ... toi ...)
 * - Số tài khoản nguồn: chỉ giữ 3 số cuối, các số đầu thành dấu * (ví dụ TK: **********132 - <nội dung>)
 * - Giữ NGUYÊN VĂN nội dung chuyển khoản do người chuyển viết.
 */
export function cleanTransferContent(desc?: string | null): string {
  let s = String(desc || "").trim();
  if (!s) return "Ủng hộ Quỹ Vì Người Nghèo";

  // 1. Trích xuất số tài khoản người gửi (ở tiền tố TKThe :..., TK :, STK :...)
  let senderAcc: string | null = null;
  const tkMatch = s.match(/(?:TKThe|TK The|TK|STK)\s*[:.]?\s*(\d{6,20})/i);
  if (tkMatch) {
    senderAcc = tkMatch[1];
  }

  // 2. Bỏ mã trace đuôi ngân hàng: ví dụ -020097040509191137302026WEMT092972
  s = s.replace(/-\d{8,}[a-zA-Z0-9]*$/i, "");
  s = s.replace(/(?:\.|;|-)\s*(?:Trace|Ref|FT|TraceNo)\s*[:.]?\s*\w+$/i, "");

  // 3. Bỏ phần rác liên ngân hàng CT tu ... toi ... tai BIDV
  s = s.replace(/\.?\s*CT\s+tu\s+\d+.*?toi\s+\d+.*?(?:tai\s+[A-Z]+|$)/gi, "");

  // 4. Bóc tách nội dung người chuyển viết (user memo)
  let userMemo = "";

  // Trường hợp Vietcombank / MBVCB: MBVCB.<trace>.<trace>.<MEMO>
  const mbvcbMatch = s.match(/MBVCB\.\d+\.\d+\.([^.]+)/i);
  if (mbvcbMatch) {
    userMemo = mbvcbMatch[1].trim();
  } else if (s.includes(";")) {
    // Trường hợp BIDV phân tách bởi dấu chấm phẩy: TKThe... ; 8630100930 ; NGUYEN BA NHAT chuyen tien
    const parts = s.split(";");
    if (parts.length >= 3) {
      userMemo = parts.slice(2).join(";").trim();
    } else if (parts.length === 2) {
      userMemo = parts[1].trim();
    }
  }

  // Nếu chưa bóc tách được userMemo:
  if (!userMemo) {
    let clean = s;
    // Cắt bỏ phần trước và bao gồm số tài khoản quỹ 8630100930
    if (/8630100930/i.test(clean)) {
      clean = clean.replace(/^.*?8630100930\s*[:;,-]?\s*/i, "");
    }
    // Cắt bỏ các tiền tố TKThe... nếu còn sót
    clean = clean.replace(/^(?:TKThe|TK The|TK|STK)[^;:]*[:;,-]?\s*/i, "");
    clean = clean.replace(/^,\s*tai\s+[^;]+;\s*/i, "");
    userMemo = clean.trim();
  }

  // Dọn dẹp ký tự thừa ở đầu và cuối memo
  userMemo = userMemo.replace(/^[-;:,.\s]+/, "").replace(/[-;:,.\s]+$/, "").trim();

  // 5. Nếu trong memo còn số tài khoản (chuỗi 6-20 chữ số): che chỉ giữ 3 số cuối
  userMemo = userMemo.replace(/\b(\d{5,})(\d{3})\b/g, (_match, prefix, last3) => {
    return "*".repeat(prefix.length) + last3;
  });

  // Nếu có số tài khoản người gửi: định dạng chuẩn giữ 3 số cuối, các số đầu thành dấu *
  if (senderAcc) {
    const maskedAcc = maskAccountNumber(senderAcc);
    if (userMemo && userMemo !== "Ủng hộ Quỹ Vì Người Nghèo") {
      return `TK: ${maskedAcc} - ${userMemo}`;
    }
    return `TK: ${maskedAcc}`;
  }

  return userMemo || "Ủng hộ Quỹ Vì Người Nghèo";
}


