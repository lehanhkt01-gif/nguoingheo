import { NextRequest, NextResponse } from "next/server";
import {
  getCassoConfig,
  verifyCassoWebhookToken,
  processCassoTransactions,
  CassoTransactionData,
} from "@/lib/casso";

/**
 * Health check & Ping verification cho Casso Webhook Setup
 */
export async function GET(req: NextRequest) {
  const config = getCassoConfig();
  return NextResponse.json({
    status: "active",
    service: "Quỹ Vì Người Nghèo Xã Ea Súp - Casso Webhook Handler",
    accountNumber: config.accountNumber,
    bank: "BIDV",
    mode: "Real-time Instant Webhook V2",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Cơ chế 1: Tiếp nhận dữ liệu biến động tức thì từ Casso Webhook (Real-time)
 * Khắc phục triệt để lỗi 401 Unauthorized do lệch secure-token
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const rawBody = await req.text();
    const config = getCassoConfig();

    // 1. Trích xuất headers bảo mật đa dạng
    const secureTokenHeader =
      req.headers.get("secure-token") ||
      req.headers.get("Secure-Token") ||
      req.headers.get("SECURE-TOKEN") ||
      req.headers.get("x-casso-token");

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const signatureHeader = req.headers.get("signature") || req.headers.get("Signature");

    // Lấy query token nếu webhook URL được đăng ký kèm tham số ?token=...
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token") || url.searchParams.get("secure-token");

    // 2. Xác thực bảo mật đa tầng
    const verification = verifyCassoWebhookToken({
      incomingToken: secureTokenHeader,
      authHeader,
      queryToken,
      expectedToken: config.secureToken,
      apiKey: config.apiKey,
      signatureHeader,
      rawBody,
    });

    if (!verification.isValid) {
      console.warn("⚠️ Casso Webhook 401 Unauthorized:", {
        reason: "Secure token hoặc chữ ký không khớp",
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
        debug: verification.debugInfo,
      });

      return NextResponse.json(
        {
          error: 1,
          message: "Unauthorized: Invalid secure-token or signature",
          hint: "Vui lòng kiểm tra lại CASSO_SECURE_TOKEN trong cấu hình Webhook của Casso và hệ thống.",
        },
        { status: 401 }
      );
    }

    console.log(`✅ Casso Webhook đã xác thực thành công qua kênh: [${verification.matchedVia}]`);

    // 3. Phân tích nội dung JSON
    let json: any = {};
    try {
      json = JSON.parse(rawBody || "{}");
    } catch (parseErr) {
      console.error("❌ Không thể parse body JSON từ Casso Webhook:", rawBody);
      return NextResponse.json(
        { error: 1, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Trường hợp Casso gửi ping kiểm tra kết nối khi người dùng nhấn "Kiểm tra kết nối" trên Casso Dashboard
    if (!json.data && (json.test || json.ping || json.event === "test")) {
      console.log("ℹ️ Nhận được tín hiệu ping test kết nối từ Casso.");
      return NextResponse.json({
        error: 0,
        success: true,
        message: "Webhook ping test successful",
      });
    }

    if (!json || (!json.data && !Array.isArray(json))) {
      return NextResponse.json(
        { error: 1, message: "Missing data payload in webhook request" },
        { status: 400 }
      );
    }

    // Dữ liệu giao dịch từ Casso có thể là mảng hoặc 1 object đơn lẻ
    const rawData = json.data || json;
    const items: CassoTransactionData[] = Array.isArray(rawData) ? rawData : [rawData];

    // 4. Nạp và xử lý giao dịch vào PostgreSQL qua Prisma với Idempotency
    const result = await processCassoTransactions(items, config.accountNumber);

    console.log(
      `🎉 [Casso Webhook] Đã xử lý ${result.processed} giao dịch (${result.inserted} mới, ${result.skippedDuplicate} trùng, ${result.skippedOtherAccount} tài khoản khác). Thời gian: ${Date.now() - startTime}ms`
    );

    return NextResponse.json({
      error: 0,
      success: true,
      message: "Webhook processed successfully",
      processedCount: result.processed,
      insertedCount: result.inserted,
      skippedDuplicateCount: result.skippedDuplicate,
      totalAmountAdded: result.totalAmountAdded,
    });
  } catch (error: any) {
    console.error("❌ Lỗi nghiêm trọng xử lý Casso Webhook:", error);
    return NextResponse.json(
      {
        error: 1,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
