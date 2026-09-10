import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const logs = await prisma.webhookLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cassoSecret, geminiApiKey, geminiPrompt } = body;

    if (cassoSecret !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "CASSO_SECURE_TOKEN" },
        update: { value: cassoSecret },
        create: { key: "CASSO_SECURE_TOKEN", value: cassoSecret, description: "Casso Webhook Secret" },
      });
    }

    if (geminiApiKey !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "GEMINI_API_KEY" },
        update: { value: geminiApiKey },
        create: { key: "GEMINI_API_KEY", value: geminiApiKey, description: "Google Gemini API Key" },
      });
    }

    if (geminiPrompt !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "GEMINI_SYSTEM_PROMPT" },
        update: { value: geminiPrompt },
        create: { key: "GEMINI_SYSTEM_PROMPT", value: geminiPrompt, description: "System Prompt Gemini AI" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình hệ thống thành công!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
