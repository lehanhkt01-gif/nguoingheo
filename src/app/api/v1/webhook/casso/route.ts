import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";
import { verifyCassoWebhook, CassoTransactionData } from "@/lib/casso";
import { parseTransactionDescription } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const rawBody = await req.text();
    const secureTokenHeader = req.headers.get("secure-token");
    const signatureHeader = req.headers.get("x-casso-signature") || req.headers.get("signature");

    // Lấy token cấu hình từ env hoặc database
    let expectedToken = process.env.CASSO_WEBHOOK_SECRET || "EaSup_Charity_2026_Secure_Token_Secret";
    const settingToken = await prisma.systemSetting.findUnique({
      where: { key: "CASSO_SECURE_TOKEN" },
    });
    if (settingToken?.value) {
      expectedToken = settingToken.value;
    }

    // Xác thực bảo mật (Header secure-token hoặc HMAC-SHA512)
    const isValid = verifyCassoWebhook({
      secureTokenHeader,
      expectedToken,
      signatureHeader,
      rawBody,
      secretKey: expectedToken,
    });

    if (!isValid) {
      console.warn("⚠️ Casso Webhook Unauthorized attempt!");
      await prisma.webhookLog.create({
        data: {
          source: "CASSO",
          payload: rawBody.slice(0, 2000),
          status: "ERROR",
          message: "Invalid secure-token or HMAC-SHA512 signature",
        },
      });
      return NextResponse.json({ error: 1, message: "Unauthorized" }, { status: 401 });
    }

    const json = JSON.parse(rawBody);
    if (!json || !json.data) {
      return NextResponse.json({ error: 1, message: "Invalid payload format" }, { status: 400 });
    }

    // Casso data có thể là mảng giao dịch hoặc 1 đối tượng đơn lẻ
    const items: CassoTransactionData[] = Array.isArray(json.data) ? json.data : [json.data];

    for (const item of items) {
      const cassoId = BigInt(item.id);

      // 1. Kiểm tra nghiêm ngặt tài khoản tiếp nhận duy nhất BIDV 8630100930
      if (item.accountNumber && item.accountNumber.trim() !== "8630100930") {
        console.log(`Bỏ qua giao dịch của tài khoản khác: ${item.accountNumber}`);
        continue;
      }

      // 2. Cơ chế Chống trùng lặp (Anti-Replay / Idempotency): Khóa chính data.id
      const existing = await prisma.transaction.findUnique({
        where: { cassoId },
      });

      if (existing) {
        console.log(`🔁 Giao dịch ID Casso ${item.id} đã tồn tại, bỏ qua theo cơ chế Idempotency.`);
        await prisma.webhookLog.create({
          data: {
            source: "CASSO",
            cassoId,
            payload: JSON.stringify(item),
            status: "DUPLICATE",
            message: `Giao dịch ${item.id} đã tồn tại trong CSDL. Bỏ qua ghi đè.`,
          },
        });
        continue;
      }

      // 3. Bóc tách cú pháp description để map đúng vào mã chiến dịch
      const { campaignCode, donorName } = parseTransactionDescription(item.description);

      // 4. Lưu giao dịch mới
      const tx = await prisma.transaction.create({
        data: {
          cassoId,
          reference: item.reference || `CASSO-${item.id}`,
          type: item.amount >= 0 ? "IN" : "OUT",
          amount: Math.abs(item.amount),
          runningBalance: item.runningBalance ?? null,
          description: item.description,
          transactionDateTime: item.transactionDateTime ? new Date(item.transactionDateTime) : new Date(),
          accountNumber: "8630100930",
          bankName: item.bankName || "BIDV",
          bankAbbreviation: item.bankAbbreviation || "BIDV",
          donorName: donorName,
          campaignCode: campaignCode,
          isAnonymous: !donorName,
        },
      });

      // 5. Cập nhật số tiền quyên góp vào Chiến dịch tương ứng (nếu có mã)
      if (campaignCode && item.amount > 0) {
        await prisma.campaign.updateMany({
          where: { code: campaignCode },
          data: {
            currentAmount: {
              increment: Math.abs(item.amount),
            },
          },
        });
      }

      // Ghi log nhật ký
      await prisma.webhookLog.create({
        data: {
          source: "CASSO",
          cassoId,
          payload: JSON.stringify(item),
          status: "SUCCESS",
          message: `Xử lý thành công giao dịch ${item.id}: +${item.amount.toLocaleString()} VND`,
        },
      });
    }

    // 6. Xóa cache sao kê để người dân thấy giao dịch mới tức thì
    await cache.delPattern("sao-ke:*");

    const processTime = Date.now() - startTime;
    console.log(`⚡ Casso webhook hoàn thành trong ${processTime}ms (< 2000ms chuẩn SLA).`);

    return NextResponse.json({
      error: 0,
      success: true,
      processTimeMs: processTime,
    });
  } catch (error: any) {
    console.error("Casso Webhook Error:", error);
    return NextResponse.json(
      { error: 1, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
