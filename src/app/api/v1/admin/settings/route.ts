import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/settings";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const settings = getSystemSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || "";
    
    // Mask key for security: AIzaSy...ABCD
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
        systemPrompt: settings.systemPrompt || "",
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, geminiApiKey, systemPrompt } = body;

    // 1. Kiểm tra kết nối thử nghiệm (Test API Key)
    if (action === "test") {
      const keyToTest = geminiApiKey?.trim() || getSystemSettings().geminiApiKey || process.env.GEMINI_API_KEY;
      if (!keyToTest) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập mã Gemini API Key trước khi kiểm tra!" },
          { status: 400 }
        );
      }

      try {
        const ai = new GoogleGenAI({ apiKey: keyToTest });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "Xin chào, phản hồi 1 câu ngắn xác nhận kết nối API.",
        });

        if (response.text) {
          return NextResponse.json({
            success: true,
            message: `Kết nối Gemini API thành công! Mô hình gemini-2.5-flash phản hồi: "${response.text.trim().substring(0, 100)}"`,
          });
        }
        return NextResponse.json({
          success: true,
          message: "Kết nối Gemini API thành công!",
        });
      } catch (testError: any) {
        return NextResponse.json(
          {
            success: false,
            message: `Lỗi kết nối Gemini API: ${testError.message || "Khóa API không hợp lệ hoặc bị giới hạn quyền truy cập."}`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Lưu cấu hình
    const toSave: any = {};
    if (geminiApiKey !== undefined && !geminiApiKey.includes("...")) {
      toSave.geminiApiKey = geminiApiKey;
    }
    if (systemPrompt !== undefined) {
      toSave.systemPrompt = systemPrompt;
    }

    const saved = saveSystemSettings(toSave);

    return NextResponse.json({
      success: true,
      message: "Đã lưu cài đặt kết nối Gemini API cho Chatbot Gem thành công!",
      settings: {
        hasKey: Boolean(saved.geminiApiKey),
        geminiApiKey: saved.geminiApiKey
          ? `${saved.geminiApiKey.substring(0, 6)}...${saved.geminiApiKey.substring(saved.geminiApiKey.length - 4)}`
          : "",
        systemPrompt: saved.systemPrompt,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
