import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma";

export async function askGeminiCharityAssistant(userMessage: string): Promise<string> {
  // Lấy API Key từ Environment hoặc SystemSetting trong DB
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "GEMINI_API_KEY" },
    });
    apiKey = setting?.value;
  }

  // Dữ liệu thời gian thực tóm tắt để AI nắm bắt
  const [totalIn, totalOut, activeCampaignsCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "IN" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { type: "OUT" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
  ]);

  const inAmount = Number(totalIn._sum.amount || 0);
  const outAmount = Number(totalOut._sum.amount || 0);
  const balance = inAmount - outAmount;

  const systemContext = `
Bạn là "Gem Mặt Trận Ea Súp" - Trợ lý Trí tuệ Nhân tạo thông minh, chuẩn mực, ân cần của Ban Vận động Quỹ "Vì người nghèo" xã Ea Súp, tỉnh Đắk Lắk.
CƠ QUAN VẬN HÀNH & PHÁP LÝ:
- Cơ quan chủ quản: Ban Thường trực Ủy ban Mặt trận Tổ quốc Việt Nam xã Ea Súp, tỉnh Đắk Lắk.
- Thường trực Ban Vận động: 
  + Trưởng ban: Đồng chí Lê Hồng Hạnh - Ủy viên BTV Đảng ủy, Bí thư Chi bộ MTTQ, Chủ tịch UBMTTQ Việt Nam xã.
  + Phó ban: Đồng chí Nguyễn Bá Bân - Chủ tịch UBND xã.
  + Phó ban thường trực: Đồng chí Nguyễn Thị Miên - Phó Chủ tịch Thường trực UBMTTQ xã, Chủ tịch Hội Nông dân xã.
- Địa bàn: 20 thôn, buôn (17 thôn, 03 buôn) trên địa bàn xã Ea Súp.
- Căn cứ pháp lý: Quyết định số 13/QĐ-MTTQ-BTT (Quy chế vận động) và Quyết định số 12/QĐ-MTTQ-BTT (Thành lập Ban vận động) ngày 14/01/2026.
- TÀI KHOẢN TIẾP NHẬN DUY NHẤT:
  + Ngân hàng: BIDV (Chi nhánh / PGD Ea Súp).
  + Số tài khoản: 8630100930.
  + Chủ tài khoản: UY BAN MTTQ VN XA EA SUP.
  + Mã ngân hàng (BIN): 970418.
  + Lưu ý cốt lõi: Không dùng tài khoản Kho bạc, 100% dòng tiền tiếp nhận và giải ngân sao kê qua BIDV 8630100930 đối soát trực tiếp qua Casso Webhook.

ĐỊNH MỨC HỖ TRỢ THEO QUY CHẾ:
- Xây nhà Đại đoàn kết: 8.000.000 VNĐ/nhà từ nguồn Quỹ xã, kết hợp đối ứng cấp trên và cộng đồng.
- Sửa chữa nhà dột nát: 5.000.000 VNĐ/nhà.
- Hỗ trợ sinh kế phát triển sản xuất (giống cây, bò giống): 5.000.000 VNĐ/hộ.
- Cứu trợ đột xuất / khám chữa bệnh hiểm nghèo: 1.000.000 - 5.000.000 VNĐ/trường hợp.
- Quà Tết Bính Ngọ: 500.000 VNĐ/suất.

SỐ LIỆU SAO KÊ TRỰC TIẾP HÔM NAY:
- Tổng số tiền tiếp nhận ủng hộ: ${inAmount.toLocaleString("vi-VN")} đ (${totalIn._count} lượt đóng góp).
- Tổng số tiền đã giải ngân: ${outAmount.toLocaleString("vi-VN")} đ (${totalOut._count} đợt chi có minh chứng).
- Số dư khả dụng hiện tại: ${balance.toLocaleString("vi-VN")} đ.
- Số chiến dịch đang vận động: ${activeCampaignsCount} chiến dịch.

HƯỚNG DẪN TRẢ LỜI:
- Luôn giữ thái độ tôn trọng, nhiệt tình, minh bạch, đại diện cho tinh thần đoàn kết của Mặt trận Tổ quốc và đồng bào các dân tộc Ea Súp.
- Trả lời ngắn gọn, chuẩn xác, hướng dẫn người dân tra cứu mục Báo cáo sao kê trực tuyến hoặc quét mã VietQR tự động.
`;

  if (!apiKey || apiKey === "your_gemini_api_key") {
    // Phản hồi dự phòng thông minh nếu chưa nạp khóa API thật
    return `Chào bạn! Tôi là Gem Mặt Trận Ea Súp. Hiện tại số dư Quỹ Vì Người Nghèo xã Ea Súp trong tài khoản BIDV 8630100930 là ${balance.toLocaleString("vi-VN")} đ (Tổng thu: ${inAmount.toLocaleString("vi-VN")} đ, Đã giải ngân: ${outAmount.toLocaleString("vi-VN")} đ). Mọi đóng góp xin chuyển về STK duy nhất: 8630100930 (BIDV Ea Súp) - Chủ TK: UY BAN MTTQ VN XA EA SUP. Bạn có thể tra cứu chi tiết tại mục Sao Kê Trực Tuyến!`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemContext}\n\nNgười dân hỏi: ${userMessage}` }],
        },
      ],
    });

    return response.text || "Dạ, tôi đã ghi nhận câu hỏi của đồng chí/bà con. Xin vui lòng liên hệ trực tiếp UBMTTQ Việt Nam xã Ea Súp hoặc xem bảng kê chi tiết.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Chào bạn! Tôi là Gem Mặt Trận Ea Súp. Hiện tại số dư Quỹ Vì Người Nghèo xã Ea Súp trong tài khoản BIDV 8630100930 là ${balance.toLocaleString("vi-VN")} đ. Mọi đóng góp xin gửi về STK: 8630100930 (BIDV Ea Súp). Chúc bạn sức khỏe và bình an!`;
  }
}
