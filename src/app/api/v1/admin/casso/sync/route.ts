import { NextRequest, NextResponse } from "next/server";
import {
  getCassoConfig,
  triggerCassoSyncApi,
  fetchCassoTransactions,
  fetchCassoAccounts,
  processCassoTransactions,
} from "@/lib/casso";
import { saveSystemSettings } from "@/lib/settings";

/**
 * GET /api/v1/admin/casso/sync
 * Kiểm tra trạng thái cấu hình và kết nối Casso Open API
 */
export async function GET(req: NextRequest) {
  try {
    const config = getCassoConfig();
    const hasApiKey = Boolean(config.apiKey);
    const maskedKey = hasApiKey
      ? config.apiKey.length > 8
        ? `${config.apiKey.substring(0, 6)}...${config.apiKey.substring(config.apiKey.length - 4)}`
        : "********"
      : "";

    let liveAccount = null;
    let apiConnectionOk = false;
    let apiErrorMessage = null;

    if (hasApiKey) {
      const accRes = await fetchCassoAccounts();
      if (accRes.success && accRes.account) {
        liveAccount = accRes.account;
        apiConnectionOk = true;
      } else {
        apiErrorMessage = accRes.message;
      }
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      "https://nguoingheo.easupso.com";

    return NextResponse.json({
      success: true,
      data: {
        hasApiKey,
        cassoApiKey: maskedKey,
        accountNumber: config.accountNumber,
        accountName: "UY BAN MTTQ VN XA EA SUP",
        bankName: "BIDV",
        apiUrl: config.apiUrl,
        webhookUrl: `${origin}/api/v1/webhook/casso`,
        hasSecureToken: Boolean(config.secureToken),
        apiConnectionOk,
        apiErrorMessage,
        liveAccount,
        lastCheck: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi API GET /api/v1/admin/casso/sync:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/casso/sync
 * Cơ chế 2: Chủ động kích hoạt kéo toàn bộ dữ liệu giao dịch và số dư từ Casso Open API
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Nếu admin gửi kèm apiKey từ giao diện để lưu và thử ngay
    if (body.cassoApiKey && body.cassoApiKey.trim()) {
      saveSystemSettings({
        cassoApiKey: body.cassoApiKey.trim(),
        cassoSecureToken: body.cassoSecureToken?.trim(),
        cassoAccountNumber: body.cassoAccountNumber?.trim() || "8630100930",
        cassoApiUrl: body.cassoApiUrl?.trim() || "https://oauth.casso.vn/v2",
      });
    }

    const config = getCassoConfig();

    if (!config.apiKey) {
      return NextResponse.json(
        {
          success: false,
          needConfig: true,
          message:
            "Hệ thống chưa có CASSO_API_KEY. Vui lòng thiết lập biến môi trường CASSO_API_KEY trong .env hoặc cập nhật trong Cài đặt hệ thống để thực hiện đồng bộ chủ động.",
        },
        { status: 400 }
      );
    }

    // 1. Kích hoạt đồng bộ tức thời từ BIDV qua Casso API
    console.log(`[Casso Sync] Gửi yêu cầu sync cho tài khoản ${config.accountNumber}...`);
    const triggerRes = await triggerCassoSyncApi();

    // 2. Kéo danh sách giao dịch mới nhất từ Casso Open API
    const pageSize = Math.min(200, Math.max(10, Number(body.pageSize || 100)));
    const txRes = await fetchCassoTransactions({
      pageSize,
      sort: "DESC",
      fromDate: body.fromDate,
    });

    if (!txRes.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Không thể lấy dữ liệu giao dịch từ Casso API: ${txRes.message}`,
          triggerResult: triggerRes,
        },
        { status: 400 }
      );
    }

    // 3. Nạp và phân tích các giao dịch vào cơ sở dữ liệu với Idempotency
    const processResult = await processCassoTransactions(txRes.records, config.accountNumber);

    // 4. Lấy số dư tài khoản ngân hàng thực tế
    const accRes = await fetchCassoAccounts();
    const liveAccount = accRes.success ? accRes.account : null;

    const message =
      processResult.inserted > 0
        ? `Đồng bộ thành công! Đã nạp thêm ${processResult.inserted} giao dịch mới (+${new Intl.NumberFormat(
            "vi-VN"
          ).format(processResult.totalAmountAdded)} đ) vào sao kê.`
        : `Đồng bộ hoàn tất: Toàn bộ ${processResult.processed} giao dịch đã được đối soát khớp lệnh 100% với tài khoản BIDV ${config.accountNumber}!`;

    return NextResponse.json({
      success: true,
      message,
      stats: {
        totalFetched: txRes.records.length,
        insertedCount: processResult.inserted,
        skippedDuplicateCount: processResult.skippedDuplicate,
        skippedOtherAccount: processResult.skippedOtherAccount,
        totalAmountAdded: processResult.totalAmountAdded,
        liveBalance: liveAccount?.balance ?? null,
        syncTimestamp: new Date().toISOString(),
      },
      account: liveAccount || {
        accountNumber: config.accountNumber,
        bankName: "BIDV",
        accountName: "UY BAN MTTQ VN XA EA SUP",
      },
      triggerStatus: triggerRes.message,
    });
  } catch (error: any) {
    console.error("❌ Lỗi API POST /api/v1/admin/casso/sync:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi xử lý đồng bộ giao dịch Casso",
      },
      { status: 500 }
    );
  }
}
