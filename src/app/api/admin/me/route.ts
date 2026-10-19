import { NextRequest, NextResponse } from "next/server";
import { findOfficerByUsername, getOfficersData } from "@/lib/officers";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Phân tích token để lấy username (token có định dạng: easup_session_<timestamp>_<base64Username>)
  let username = process.env.ADMIN_USERNAME || "admin_easup";
  try {
    const parts = token.split("_");
    if (parts.length >= 4) {
      const b64User = parts.slice(3).join("_");
      const decoded = Buffer.from(b64User, "base64").toString("utf-8");
      if (decoded) {
        username = decoded;
      }
    }
  } catch (err) {
    console.warn("Không thể giải mã username từ token:", err);
  }

  const officer = findOfficerByUsername(username) || getOfficersData().officers[0];

  return NextResponse.json({
    authenticated: true,
    user: {
      username: officer.username,
      fullName: officer.fullName,
      title: officer.title,
      role: officer.role,
      phone: officer.phone,
      avatar: "/images/logo-mttq.png",
      canPost: officer.canPost ?? true,
      canDelete: officer.canDelete ?? true,
      canManageOfficers: officer.canManageOfficers ?? (officer.role === "ADMIN"),
    },
  });
}
