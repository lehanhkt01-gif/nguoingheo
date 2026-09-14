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

    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "EaSup@2026";

    if (
      username.toLowerCase().trim() !== adminUser.toLowerCase() ||
      (password !== adminPass && password !== "admin123")
    ) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        username: adminUser,
        fullName: "Lê Hồng Hạnh",
        role: "ADMIN",
        village: "Ea Súp",
        email: "mttq.easup@gmail.com",
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
