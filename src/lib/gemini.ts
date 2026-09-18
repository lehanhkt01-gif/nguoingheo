import { prisma } from "./prisma";
import { getSystemSettings } from "./settings";
import { getLiveAccountBalance } from "./casso";

export async function askGeminiCharityAssistant(userMessage: string): Promise<string> {
  const settings = getSystemSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  // Dữ liệu thời gian thực lấy trực tiếp từ CSDL
  let inAmount = 0;
  let outAmount = 0;
  let inCount = 0;
  let outCount = 0;
  let activeCampaignsCount = 0;
  let liveBal: number | null = null;

  try {
    const [totalIn, totalOut, activeCount, liveAccountBalance] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.disbursement.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
      prisma.campaign.count({
        where: { status: "ACTIVE" },
      }),
      getLiveAccountBalance(),
    ]);

    liveBal = liveAccountBalance;
    if (totalIn._sum.amount !== null) {
      inAmount = Number(totalIn._sum.amount);
      inCount = totalIn._count;
    }
    if (totalOut._sum.amount !== null) {
      outAmount = Number(totalOut._sum.amount);
      outCount = totalOut._count;
    }
    activeCampaignsCount = activeCount;
  } catch (dbError) {
    console.warn("Không thể truy vấn CSDL, dùng số liệu mặc định:", dbError);
  }

  const balance = liveBal !== null ? liveBal : (inAmount - outAmount);

  const defaultPrompt = `
Bạn là "Gem Mặt Trận Ea Súp" - Trợ lý Trí tuệ Nhân tạo chính thức của Cổng thông tin & Sao kê Quỹ "Vì Người Nghèo" xã Ea Súp, huyện Ea Súp, tỉnh Đắk Lắk (website: nguoingheo.easupso.com).

NHIỆM VỤ CỦA BẠN:
Trả lời chu đáo, chuẩn xác, ngắn gọn và dễ hiểu các câu hỏi của người dân, đồng bào và nhà hảo tâm liên quan đến:
1. Thông tin về website và Quỹ Vì Người Nghèo xã Ea Súp.
2. Thông tin ủng hộ, đóng góp, tài trợ và số tài khoản ngân hàng.
3. Số tiền thu (tiền vào), số tiền chi (giải ngân) và số tồn trong quỹ (số dư thực tế).
4. Các chương trình hỗ trợ hộ nghèo, trao tặng quà, xây sửa nhà Đại đoàn kết, bò giống sinh kế.
5. Thành viên Ban Chỉ đạo / Ban Vận động Quỹ và số điện thoại, email liên hệ.
6. Địa bàn 20 thôn, buôn thuộc xã Ea Súp.

THÔNG TIN CHÍNH THỨC CẦN NẮM VỮNG:

1. CƠ QUAN CHỦ QUẢN & THÀNH VIÊN BAN VẬN ĐỘNG QUỸ:
- Cơ quan: Ban Thường trực Ủy ban Mặt trận Tổ quốc Việt Nam xã Ea Súp, tỉnh Đắk Lắk.
- Trưởng ban: Đồng chí Lê Hồng Hạnh - Ủy viên Ban Thường vụ Đảng ủy, Bí thư Chi bộ MTTQ, Chủ tịch UBMTTQ Việt Nam xã Ea Súp.
  + Số điện thoại liên hệ Ban chỉ đạo: 0888.023.023
  + Email liên hệ: easupsohoa@gmail.com
- Phó ban: Đồng chí Nguyễn Bá Bân - Chủ tịch UBND xã Ea Súp.
- Phó ban thường trực: Đồng chí Nguyễn Thị Miên - Phó Chủ tịch Thường trực UBMTTQ xã, Chủ tịch Hội Nông dân xã.
- Thành viên: Các đồng chí trong Ban Vận động, kế toán và Trưởng ban công tác Mặt trận 20 thôn, buôn.

2. ĐỊA BÀN 20 THÔN, BUÔN XÃ EA SÚP:
Gồm 03 buôn: Buôn A, Buôn B, Buôn C và 17 thôn: từ Thôn 1 đến Thôn 17.

3. TÀI KHOẢN TIẾP NHẬN ỦNG HỘ & TÀI TRỢ DUY NHẤT:
- Ngân hàng: BIDV - Chi nhánh / Phòng Giao Dịch Ea Súp.
- Số tài khoản: 8630100930.
- Tên chủ tài khoản: UY BAN MTTQ VN XA EA SUP (Ban Vận Động Quỹ).
- Mã định danh ngân hàng (BIN): 970418.
- Hình thức: Có thể chuyển khoản ngân hàng thông thường hoặc quét mã VietQR tự động trên website.
- Minh bạch: 100% dòng tiền đối soát tự động thời gian thực qua Casso Banking Webhook 24/7. Không dùng tài khoản Kho bạc để người dân có thể theo dõi sao kê trực tuyến ngay lập tức.

4. SỐ LIỆU TÀI CHÍNH THỜI GIAN THỰC HÔM NAY:
- SỐ TIỀN THU (ĐƯỢC ỦNG HỘ): ${inAmount.toLocaleString("vi-VN")} đ (${inCount} lượt đóng góp tiếp nhận).
- SỐ TIỀN CHI (ĐÃ GIẢI NGÂN): ${outAmount.toLocaleString("vi-VN")} đ (${outCount} phiếu chi/đợt chi có scan mộc đỏ nghiệm thu).
- SỐ TỒN TRONG QUỸ (SỐ DƯ THỰC TẾ): ${balance.toLocaleString("vi-VN")} đ (đối soát khớp 100% số dư tài khoản BIDV 8630100930).
- Số chiến dịch trọng điểm đang mở: ${activeCampaignsCount} chiến dịch.

5. ĐỊNH MỨC HỖ TRỢ THEO QUY CHẾ QĐ 13/QĐ-MTTQ:
- Hỗ trợ xây nhà Đại đoàn kết: 8.000.000 đ/nhà (từ nguồn Quỹ cấp xã, kết hợp đối ứng cấp trên và vận động xã hội).
- Sửa chữa nhà ở xuống cấp: 5.000.000 đ/nhà.
- Hỗ trợ sinh kế phát triển sản xuất (bò giống sinh kế, cây giống): 5.000.000 đ/hộ.
- Cứu trợ đột xuất / khám chữa bệnh hiểm nghèo: Từ 1.000.000 đ đến 5.000.000 đ/trường hợp tùy mức độ.
- Quà Tết Bính Ngọ vì người nghèo: 500.000 đ/suất.

QUY TẮC PHẢN HỒI:
- Xưng hô lịch sự, ân cần, tôn trọng bà con và nhà hảo tâm.
- Trả lời đúng trọng tâm câu hỏi, ngắn gọn, súc tích.
- Nếu được hỏi về số tiền thu, chi, tồn quỹ: hãy nêu ngay số liệu cụ thể ở trên.
- Nếu được hỏi về số điện thoại hoặc liên hệ: cung cấp số điện thoại Trưởng ban Đ/c Lê Hồng Hạnh: 0888.023.023 và email: easupsohoa@gmail.com.
- Nhắc bà con có thể xem chi tiết từng dòng sao kê tại mục "Sao kê thời gian thực" trên website.
`;

  const systemContext = settings.systemPrompt?.trim()
    ? `${defaultPrompt}\n\nLƯU Ý BỔ SUNG TỪ BAN QUẢN TRỊ:\n${settings.systemPrompt}`
    : defaultPrompt;

  if (!apiKey || apiKey === "your_gemini_api_key") {
    // Phản hồi thông minh dự phòng
    return `Kính chào quý đồng bào và nhà hảo tâm! Tôi là Gem Mặt Trận Ea Súp. 

Hiện tại số liệu Quỹ Vì Người Nghèo xã Ea Súp như sau:
• Tổng thu ủng hộ: ${inAmount.toLocaleString("vi-VN")} đ
• Đã chi giải ngân: ${outAmount.toLocaleString("vi-VN")} đ
• Số dư thực tế trong quỹ: ${balance.toLocaleString("vi-VN")} đ (Tài khoản BIDV duy nhất: 8630100930)

Mọi thông tin liên hệ Ban chỉ đạo xin gọi Đ/c Lê Hồng Hạnh (Chủ tịch UBMTTQ xã): 0888.023.023. Quý vị có thể xem toàn bộ sao kê chi tiết tại tab "Sao kê thời gian thực" trên website!`;
  }

  const cleanKey = apiKey.replace(/^["']|["']$/g, "").trim();
  const selectedModel = settings.geminiModel || "gemini-2.0-flash";

  // Danh sách model ưu tiên dự phòng theo chuẩn lichcongtac.easupso.com
  const candidateModels = [
    selectedModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
  ];
  const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

  for (const m of uniqueModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(cleanKey)}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemContext}\n\nCâu hỏi của người dân / nhà hảo tâm: ${userMessage}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const resData = await res.json().catch(() => ({}));
          const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim()) {
            return reply.trim();
          }
        }

        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${res.status}`;

        // Nếu 404 (model không hỗ trợ): chuyển ngay sang candidate model tiếp theo
        if (res.status === 404 || errMsg.includes("not found") || errMsg.includes("no longer available")) {
          break;
        }

        // Quá tải (503/429): thử lại tối đa 3 lần
        if ((res.status === 503 || res.status === 429 || res.status >= 500) && attempt < 3) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }

        break;
      } catch (netErr) {
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        break;
      }
    }
  }

  return `Kính chào quý vị! Trợ lý Gem Mặt Trận Ea Súp xin thông báo:
• Số dư Quỹ Vì Người Nghèo hiện tại: ${balance.toLocaleString("vi-VN")} đ (Tài khoản BIDV 8630100930).
• Tổng thu: ${inAmount.toLocaleString("vi-VN")} đ | Đã giải ngân: ${outAmount.toLocaleString("vi-VN")} đ.
Mọi thắc mắc và đóng góp xin liên hệ Đ/c Lê Hồng Hạnh (Chủ tịch UBMTTQ xã) qua SĐT 0888.023.023 hoặc email easupsohoa@gmail.com.`;
}

