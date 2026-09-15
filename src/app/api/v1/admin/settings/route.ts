import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/settings";

export const AVAILABLE_GEMINI_MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Khuyên dùng - Siêu Nhanh, Thông Minh & Ổn Định Nhất)", default: true },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Bản Chuẩn Quốc Tế - Tốc Độ Cao & Ổn Định)" },
  { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B (Bản Siêu Tiết Kiệm & Nhanh)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Bản Chuyên Sâu - Phân Tích Dài)" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite (Tiết Kiệm Quota)" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Chuẩn hóa model ID tương tự lichcongtac.easupso.com
function normalizeModelId(modelId?: string): string {
  if (!modelId) return "gemini-2.0-flash";
  const m = modelId.trim().toLowerCase();
  if (m.includes("2.0-flash-lite")) return "gemini-2.0-flash-lite";
  if (m.includes("2.0")) return "gemini-2.0-flash";
  if (m.includes("1.5-pro") || (m.includes("pro") && !m.includes("flash"))) return "gemini-1.5-pro";
  if (m.includes("8b")) return "gemini-1.5-flash-8b";
  if (m.includes("1.5-flash") || m.includes("flash")) return "gemini-1.5-flash";
  return "gemini-2.0-flash";
}

// Truy vấn danh sách model được cấp quyền từ Google API
async function getLiveModels(apiKey: string): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        return data.models
          .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
          .map((m: any) => m.name.replace(/^models\//, ""));
      }
    }
  } catch (e: any) {
    console.warn("Lỗi khi truy vấn danh sách model từ Google:", e.message);
  }
  return [];
}

export async function GET() {
  try {
    const settings = getSystemSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || "";

    const maskedKey = apiKey
      ? apiKey.length > 8
        ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
        : "********"
      : "";

    return NextResponse.json({
      success: true,
      settings: {
        hasKey: Boolean(apiKey),
        geminiApiKey: maskedKey,
        geminiModel: settings.geminiModel || "gemini-2.0-flash",
        systemPrompt: settings.systemPrompt || "",
        updatedAt: settings.updatedAt,
      },
      availableModels: AVAILABLE_GEMINI_MODELS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, geminiApiKey, geminiModel, systemPrompt } = body;

    // 1. Kiểm tra kết nối thử nghiệm (Test API Key tương tự lichcongtac.easupso.com)
    if (action === "test") {
      let keyToTest = (geminiApiKey?.trim() || getSystemSettings().geminiApiKey || process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();

      if (!keyToTest) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập Gemini API Key (chuẩn AIzaSy... hoặc AQ.Ab8...) trước khi kiểm tra!" },
          { status: 400 }
        );
      }

      const requestedModel = normalizeModelId(geminiModel || getSystemSettings().geminiModel);
      const liveModels = await getLiveModels(keyToTest);

      const candidateModels = [
        requestedModel,
        ...(liveModels.length > 0 ? liveModels.filter((m) => m.includes("flash") || m.includes("pro")) : []),
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
      ];
      const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

      let lastError: string | null = null;
      let connectedModel = "";

      for (const m of uniqueModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(keyToTest)}`;
        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: "Xin chào! Trả về đúng 1 câu ngắn xác nhận kết nối." }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 30,
            temperature: 0.2,
          },
        };

        let modelSuccess = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": keyToTest,
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              const resData = await res.json().catch(() => ({}));
              const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "OK";
              connectedModel = m;
              modelSuccess = true;
              return NextResponse.json({
                success: true,
                message: `Kết nối Google Gemini thành công! Đã xác thực hoạt động hoàn hảo với mô hình [${m}]. Phản hồi thử nghiệm: "${replyText}"`,
                activeModel: m,
              });
            }

            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `Lỗi HTTP ${res.status}: ${res.statusText}`;

            if (
              res.status === 403 ||
              (res.status === 400 && errMsg.includes("API key")) ||
              errMsg.includes("API key not valid") ||
              errMsg.includes("API_KEY_INVALID")
            ) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Khóa Google Gemini API Key không chính xác hoặc chưa được cấp quyền (hỗ trợ chuẩn AIzaSy... và AQ.Ab8...). Vui lòng kiểm tra lại!",
                },
                { status: 400 }
              );
            }

            // Model không tồn tại hoặc bị deprecate: thử ngay model tiếp theo
            if (res.status === 404 || errMsg.includes("not found") || errMsg.includes("no longer available")) {
              lastError = `Mô hình ${m} không khả dụng.`;
              break;
            }

            const isOverloaded =
              res.status === 503 ||
              res.status === 429 ||
              res.status >= 500 ||
              errMsg.includes("high demand") ||
              errMsg.includes("overloaded") ||
              errMsg.includes("spikes in demand");

            if (isOverloaded && attempt < 3) {
              await sleep(1500 * attempt);
              continue;
            }

            lastError = errMsg;
            break;
          } catch (netErr: any) {
            lastError = netErr.message;
            if (attempt < 3) {
              await sleep(1500);
              continue;
            }
            break;
          }
        }

        if (modelSuccess) break;
      }

      return NextResponse.json(
        {
          success: false,
          message:
            lastError && (lastError.includes("high demand") || lastError.includes("overloaded"))
              ? "Máy chủ Google Gemini đang tạm thời bận lưu lượng. Vui lòng bấm thử lại sau vài giây!"
              : `Lỗi kết nối Gemini API: ${lastError || "Không thể kết nối đến máy chủ Google Gemini"}`,
        },
        { status: 400 }
      );
    }

    // 2. Lưu cấu hình
    const toSave: any = {};
    if (geminiApiKey !== undefined && !geminiApiKey.includes("...")) {
      toSave.geminiApiKey = geminiApiKey.replace(/^["']|["']$/g, "").trim();
    }
    if (geminiModel !== undefined) {
      toSave.geminiModel = normalizeModelId(geminiModel);
    }
    if (systemPrompt !== undefined) {
      toSave.systemPrompt = systemPrompt;
    }

    const saved = saveSystemSettings(toSave);

    return NextResponse.json({
      success: true,
      message: `Đã lưu cài đặt kết nối Gemini API (${saved.geminiModel || "gemini-2.0-flash"}) thành công!`,
      settings: {
        hasKey: Boolean(saved.geminiApiKey),
        geminiApiKey: saved.geminiApiKey
          ? `${saved.geminiApiKey.substring(0, 6)}...${saved.geminiApiKey.substring(saved.geminiApiKey.length - 4)}`
          : "",
        geminiModel: saved.geminiModel || "gemini-2.0-flash",
        systemPrompt: saved.systemPrompt,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

