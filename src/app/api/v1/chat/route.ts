import { NextRequest, NextResponse } from "next/server";
import { askGeminiCharityAssistant } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, reply: "Xin vui lòng nhập nội dung câu hỏi." },
        { status: 400 }
      );
    }

    const reply = await askGeminiCharityAssistant(message);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, reply: "Hệ thống đang bận. Xin vui lòng thử lại sau ít phút." },
      { status: 500 }
    );
  }
}
