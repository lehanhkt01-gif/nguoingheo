import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const secureTokenHeader = req.headers.get("secure-token");
    const expectedToken = process.env.CASSO_SECURE_TOKEN || "EaSup_Charity_2026_Secure_Token_Secret";

    // 1. Kiểm tra xác thực mã bảo mật CASSO_SECURE_TOKEN
    if (secureTokenHeader && secureTokenHeader !== expectedToken) {
      console.warn("⚠️ Casso Webhook: Token không hợp lệ!");
      return NextResponse.json({ error: 1, message: "Unauthorized: Invalid secure-token" }, { status: 401 });
    }

    const json = JSON.parse(rawBody || "{}");
    if (!json || !json.data) {
      return NextResponse.json({ error: 1, message: "Invalid payload format" }, { status: 400 });
    }

    // Dữ liệu giao dịch từ Casso có thể là mảng hoặc 1 giao dịch đơn lẻ
    const items = Array.isArray(json.data) ? json.data : [json.data];
    const processedDonations = [];

    for (const item of items) {
      const transactionId = String(item.id || item.reference || `TX-${Date.now()}`);

      // 2. Chỉ tiếp nhận giao dịch tiền vào tài khoản tiếp nhận duy nhất BIDV 8630100930
      if (item.accountNumber && item.accountNumber.trim() !== "8630100930") {
        console.log(`Bỏ qua giao dịch tài khoản khác: ${item.accountNumber}`);
        continue;
      }

      // 3. Cơ chế Chống trùng lặp (Idempotency): Kiểm tra transactionId
      const existing = await prisma.donation.findUnique({
        where: { transactionId },
      });

      if (existing) {
        console.log(`🔁 Giao dịch ${transactionId} đã tồn tại trong CSDL, bỏ qua ghi đè.`);
        continue;
      }

      // 4. Bóc tách tên người gửi từ nội dung giao dịch nếu có
      let donorName = "Nhà hảo tâm ẩn danh";
      const desc = String(item.description || "").trim();
      const match = desc.match(/(?:VNN|UNG\s*HO|QUY\s*VNN)\s*(?:[A-Z0-9_-]+\s+)?([A-Z\s]{3,40})/i);
      if (match && match[1]) {
        donorName = match[1].trim();
      } else if (desc.length > 0) {
        donorName = desc.slice(0, 50);
      }

      const amount = Math.abs(Number(item.amount || 0));
      const txDate = item.transactionDateTime ? new Date(item.transactionDateTime) : new Date();

      // 5. Tự động lưu vào bảng Donation
      const donation = await prisma.donation.create({
        data: {
          transactionId,
          donorName,
          amount,
          description: desc,
          transactionDate: txDate,
          status: "COMPLETED",
        },
      });

      // 6. Cập nhật tiến độ chiến dịch nếu nội dung có nhắc đến chiến dịch đang mở
      const activeCampaign = await prisma.campaign.findFirst({
        where: { status: "ACTIVE" },
      });

      if (activeCampaign && amount > 0) {
        await prisma.campaign.update({
          where: { id: activeCampaign.id },
          data: {
            currentAmount: {
              increment: amount,
            },
          },
        });
      }

      processedDonations.push(donation.id);
    }

    return NextResponse.json({
      error: 0,
      success: true,
      message: "Webhook processed successfully",
      processedCount: processedDonations.length,
    });
  } catch (error: any) {
    console.error("❌ Lỗi xử lý Casso Webhook:", error);
    return NextResponse.json(
      { error: 1, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
