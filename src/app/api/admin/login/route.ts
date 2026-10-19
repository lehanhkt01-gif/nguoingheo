import { NextRequest, NextResponse } from "next/server";
import { verifyOfficer } from "@/lib/officers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const officer = verifyOfficer(username, password);

    if (officer) {
      const user = {
        username: officer.username,
        fullName: officer.fullName,
        title: officer.title,
        role: officer.role,
        phone: officer.phone,
        avatar: "/images/logo-mttq.png",
        canPost: officer.canPost ?? true,
        canDelete: officer.canDelete ?? true,
        canManageOfficers: officer.canManageOfficers ?? (officer.role === "ADMIN"),
      };

      // Tạo response và set cookie phiên làm việc HttpOnly
      const response = NextResponse.json({
        success: true,
        message: "Đăng nhập thành công",
        user,
      });

      // Token phiên làm việc an toàn mã hóa tên tài khoản cán bộ
      response.cookies.set("admin_token", `easup_session_${Date.now()}_${Buffer.from(officer.username).toString("base64")}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 giờ
      });

      // Cookie công khai để client UI nhận biết đã đăng nhập
      response.cookies.set("admin_logged_in", "true", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi xử lý xác thực từ máy chủ.",
      },
      { status: 500 }
    );
  }
}
