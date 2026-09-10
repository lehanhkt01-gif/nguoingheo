import crypto from "crypto";

export interface CassoTransactionData {
  id: number | string;
  reference?: string;
  description: string;
  amount: number;
  runningBalance?: number;
  transactionDateTime: string;
  accountNumber: string;
  bankName?: string;
  bankAbbreviation?: string;
  virtualAccount?: string;
  virtualAccountName?: string;
}

export interface CassoWebhookPayload {
  error: number;
  data: CassoTransactionData | CassoTransactionData[];
}

/**
 * Xác thực bảo mật Webhook từ Casso:
 * 1. Kiểm tra header `secure-token`
 * 2. Xác thực chữ ký HMAC-SHA512 (nếu Casso gửi kèm header signature)
 */
export function verifyCassoWebhook({
  secureTokenHeader,
  expectedToken,
  signatureHeader,
  rawBody,
  secretKey,
}: {
  secureTokenHeader?: string | null;
  expectedToken: string;
  signatureHeader?: string | null;
  rawBody: string;
  secretKey?: string;
}): boolean {
  // 1. Kiểm tra secure-token header
  if (secureTokenHeader && secureTokenHeader.trim() === expectedToken.trim()) {
    return true;
  }

  // 2. Kiểm tra HMAC-SHA512 signature nếu có secretKey và header signature
  if (signatureHeader && secretKey) {
    try {
      const calculatedSignature = crypto
        .createHmac("sha512", secretKey)
        .update(rawBody)
        .digest("hex");
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature),
        Buffer.from(signatureHeader)
      );
    } catch {
      return false;
    }
  }

  // Nếu không có header nào khớp
  return false;
}
