import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipientCustom = body.recipients as string[] | undefined;
    const period = body.period || "Kỳ hiện tại (Tháng 09/2026)";

    // 1. Thống kê số liệu mới nhất
    const [statsIn, statsOut, campaignCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "IN", accountNumber: "8630100930" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: "OUT", accountNumber: "8630100930" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
    ]);

    const totalIn = Number(statsIn._sum.amount || 0);
    const totalOut = Number(statsOut._sum.amount || 0);
    const currentBalance = totalIn - totalOut;

    // 2. Danh sách người nhận mặc định (Thường trực Đảng ủy, HĐND, UBND, 20 Trưởng ban CTMT thôn buôn)
    const defaultRecipients = [
      "danguy.easup@gmail.com",
      "ubnd.easup@gmail.com",
      "mttq.easup@gmail.com",
      "truongban.buondrai@easupso.com",
      "truongban.buona2@easupso.com",
      "truongban.thon1@easupso.com",
      "truongban.thon5@easupso.com",
    ];

    const recipients = recipientCustom && recipientCustom.length > 0 ? recipientCustom : defaultRecipients;

    // 3. Nội dung email báo cáo trang trọng
    const subject = `[BÁO CÁO CÔNG KHAI] Thu - Chi Quỹ "Vì người nghèo" xã Ea Súp - Kỳ: ${period}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; line-height: 1.6; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #991b1b; padding: 24px; text-align: center; color: #fff;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM XÃ EA SÚP</h2>
          <h3 style="margin: 6px 0 0; font-size: 20px; font-weight: bold; color: #fef08a;">BAN VẬN ĐỘNG QUỸ "VÌ NGƯỜI NGHÈO"</h3>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Tài khoản tiếp nhận duy nhất: BIDV 8630100930 - Cổng thông tin: vinguoingheo.easupso.com</p>
        </div>

        <div style="padding: 24px;">
          <p>Kính gửi: <strong>Thường trực Đảng ủy, HĐND, Lãnh đạo UBND xã Ea Súp, và các đồng chí Trưởng Ban CTMT 20 thôn, buôn</strong>,</p>

          <p>Ban Vận động Quỹ "Vì người nghèo" xã Ea Súp trân trọng báo cáo công khai số liệu tài chính thời gian thực đối soát tự động qua tài khoản BIDV 8630100930 kết nối Casso Banking:</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Tổng số tiền ủng hộ tiếp nhận:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a; font-size: 16px;">
                  +${totalIn.toLocaleString("vi-VN")} đ
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Tổng số tiền đã giải ngân:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #dc2626; font-size: 16px;">
                  -${totalOut.toLocaleString("vi-VN")} đ
                </td>
              </tr>
              <tr style="border-top: 2px dashed #94a3b8;">
                <td style="padding: 12px 0 6px; font-weight: bold; color: #0f172a;">Số dư khả dụng hiện có (BIDV 8630100930):</td>
                <td style="padding: 12px 0 6px; text-align: right; font-weight: bold; color: #1e40af; font-size: 18px;">
                  =${currentBalance.toLocaleString("vi-VN")} đ
                </td>
              </tr>
            </table>
          </div>

          <p><strong>Căn cứ pháp lý vận hành:</strong></p>
          <ul>
            <li>Quyết định số 13/QĐ-MTTQ-BTT ngày 14/01/2026 về Quy chế quản lý, sử dụng Quỹ.</li>
            <li>Quyết định số 12/QĐ-MTTQ-BTT ngày 14/01/2026 thành lập Ban Vận động Quỹ.</li>
          </ul>

          <p>Toàn bộ hóa đơn chứng từ, phiếu chi và biên bản nghiệm thu có chữ ký xác nhận của Ban CTMT 20 thôn buôn đã được số hóa công khai tại: <a href="https://vinguoingheo.easupso.com/sao-ke" style="color: #b91c1c; font-weight: bold;">vinguoingheo.easupso.com/sao-ke</a>.</p>

          <p style="margin-top: 30px; text-align: right;">
            <strong>TM. BAN VẬN ĐỘNG QUỸ "VÌ NGƯỜI NGHÈO"<br>TRƯỞNG BAN - CHỦ TỊCH UBMTTQ XÃ<br><br><br>Lê Hồng Hạnh</strong>
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
          Hệ thống phát tán email tự động điều hành bởi Nền tảng An Sinh Xã Hội Xã Ea Súp (Resend SMTP noreply@easupso.com).
        </div>
      </div>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && resendApiKey !== "your_resend_api_key") {
      // Gửi qua Resend API chính thức
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Quỹ Vì Người Nghèo Ea Súp <noreply@easupso.com>",
          to: recipients,
          subject: subject,
          html: htmlContent,
        }),
      });

      const resData = await resendRes.json();
      return NextResponse.json({
        success: true,
        message: `Đã gửi báo cáo thành công tới ${recipients.length} địa chỉ email lãnh đạo và 20 thôn buôn qua Resend!`,
        data: resData,
      });
    } else {
      // Chế độ mô phỏng trực quan an toàn khi chưa nạp RESEND_API_KEY
      console.log(`[DISPATCH EMAIL] Mô phỏng phát tán email tới ${recipients.length} địa chỉ:`, recipients);
      return NextResponse.json({
        success: true,
        simulated: true,
        message: `[MÔ PHỎNG THÀNH CÔNG] Đã phát lệnh gửi báo cáo tổng hợp tới Thường trực Đảng ủy, HĐND, UBND và 20 Trưởng Ban CTMT (${recipients.length} người nhận). Cấu hình RESEND_API_KEY trong .env để kích hoạt phát tán thực tế.`,
        recipients,
        stats: { totalIn, totalOut, currentBalance },
      });
    }
  } catch (error: any) {
    console.error("Dispatch Email Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
