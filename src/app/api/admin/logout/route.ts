import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Đăng xuất thành công"
  });

  response.cookies.delete("admin_token");
  response.cookies.delete("admin_logged_in");

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
