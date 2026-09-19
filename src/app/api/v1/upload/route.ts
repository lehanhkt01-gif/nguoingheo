import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const fileList: File[] = [];
    if (singleFile && singleFile.size > 0) fileList.push(singleFile);
    for (const f of files) {
      if (f && f.size > 0 && !fileList.some((existing) => existing.name === f.name && existing.size === f.size)) {
        fileList.push(f);
      }
    }

    if (fileList.length === 0) {
      return NextResponse.json({ success: false, message: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
      }
      fs.chmodSync(uploadDir, 0o777);
    } catch (e) {
      console.warn("Không thể chmod uploadDir:", e);
    }

    const savedFiles = [];

    for (const file of fileList) {
      const originalName = file.name;
      const ext = path.extname(originalName).toLowerCase();
      const isPdf = ext === ".pdf" || file.type === "application/pdf";
      const isImage =
        [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ||
        file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${originalName} không hợp lệ. Chỉ chấp nhận file hình ảnh (JPG, PNG, WEBP) hoặc tài liệu chứng từ PDF.`,
          },
          { status: 400 }
        );
      }

      // Giới hạn dung lượng: tối đa 15MB/file
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: `File ${originalName} vượt quá dung lượng tối đa (15MB).` },
          { status: 400 }
        );
      }

      const safeBaseName = path
        .basename(originalName, ext)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);

      const uniqueFileName = `${Date.now()}_${safeBaseName}${ext}`;
      const targetFilePath = path.join(uploadDir, uniqueFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        fs.writeFileSync(targetFilePath, buffer);
        try {
          fs.chmodSync(targetFilePath, 0o666);
        } catch {}
      } catch (writeErr: any) {
        if (writeErr.code === "EACCES") {
          try {
            fs.chmodSync(uploadDir, 0o777);
            fs.writeFileSync(targetFilePath, buffer);
            try {
              fs.chmodSync(targetFilePath, 0o666);
            } catch {}
          } catch (retryErr) {
            console.error("Lỗi quyền ghi EACCES:", retryErr);
            throw new Error("Lỗi quyền ghi file trên máy chủ VPS (EACCES). Vui lòng chạy lệnh cấp quyền: chmod -R 777 public/uploads");
          }
        } else {
          throw writeErr;
        }
      }

      savedFiles.push({
        url: `/uploads/${uniqueFileName}`,
        name: originalName,
        type: isPdf ? "pdf" : "image",
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã tải lên ${savedFiles.length} file thành công!`,
      files: savedFiles,
      file: savedFiles[0],
    });
  } catch (error: any) {
    console.error("Lỗi upload file:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi lưu file lên máy chủ" }, { status: 500 });
  }
}
