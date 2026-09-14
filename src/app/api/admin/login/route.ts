import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USERNAME || "admin_easup";
    const validPassword = process.env.ADMIN_PASSWORD || "EaSup@Admin2026!";

    if (username === validUsername && password === validPassword) {
      const user = {
        username: validUsername,
        fullName: "Đ/c Lê Hồng Hạnh",
        title: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
        role: "ADMIN",
        avatar: "/images/logo-mttq.png"
      };

      // Tạo response và set cookie phiên làm việc HttpOnly
      const response = NextResponse.json({
        success: true,
        message: "Đăng nhập thành công",
        user
      });

      // Token phiên làm việc an toàn
      response.cookies.set("admin_token", `easup_session_${Date.now()}_${Buffer.from(validUsername).toString("base64")}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 giờ
      });

      // Cookie công khai để client UI nhận biết đã đăng nhập
      response.cookies.set("admin_logged_in", "true", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác."
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi xử lý xác thực từ máy chủ."
      },
      { status: 500 }
    );
  }
}
