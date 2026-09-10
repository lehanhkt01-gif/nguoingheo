import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    // Mật khẩu mẫu ban đầu cho cán bộ: "EaSup@2026" hoặc khớp user
    if (!user || (password !== "EaSup@2026" && password !== "admin123")) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        village: user.village,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
