import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const validUsername = process.env.ADMIN_USERNAME || "admin_easup";

  return NextResponse.json({
    authenticated: true,
    user: {
      username: validUsername,
      fullName: "Đ/c Lê Hồng Hạnh",
      title: "Chủ tịch UBMTTQ Việt Nam xã Ea Súp",
      role: "ADMIN",
      avatar: "/images/logo-mttq.png"
    }
  });
}
