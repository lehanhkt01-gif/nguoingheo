import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".jfif": "image/jpeg",
  ".ico": "image/x-icon",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const pathParts = resolvedParams?.path || [];
    if (!pathParts.length) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Tên file hoặc đường dẫn con an toàn
    const relativePath = pathParts.join("/");
    // Chặn directory traversal an toàn
    if (relativePath.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Các vị trí lưu trữ file khả dĩ trên container và host
    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", ...pathParts),
      path.join(process.cwd(), "public", relativePath),
      path.join("/app/public/uploads", ...pathParts),
      path.join(process.cwd(), "data", "uploads", ...pathParts),
    ];

    let targetFilePath = "";
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          targetFilePath = p;
          break;
        }
      } catch {}
    }

    if (!targetFilePath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Uploads Route] Lỗi phục vụ file tải lên:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
