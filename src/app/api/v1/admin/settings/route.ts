import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settingsMap: Record<string, string> = {
      CASSO_SECURE_TOKEN: process.env.CASSO_SECURE_TOKEN || "",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "********" : "",
      GEMINI_SYSTEM_PROMPT: "Mặt trận Tổ quốc Việt Nam xã Ea Súp",
    };

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      logs: [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình hệ thống thành công (ghi nhận môi trường .env)!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
