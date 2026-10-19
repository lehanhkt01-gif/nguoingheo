import { NextRequest, NextResponse } from "next/server";
import {
  getOfficersData,
  addOfficer,
  deleteOfficer,
  changeOfficerPassword,
  findOfficerByUsername,
} from "@/lib/officers";

export async function GET() {
  try {
    const store = getOfficersData();
    // Ẩn mật khẩu khi trả về danh sách, chỉ giữ lại độ dài hoặc trạng thái
    const safeOfficers = store.officers.map((o) => ({
      id: o.id,
      username: o.username,
      fullName: o.fullName,
      title: o.title,
      phone: o.phone || "",
      role: o.role,
      canPost: o.canPost,
      canDelete: o.canDelete,
      canManageOfficers: o.canManageOfficers,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: safeOfficers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Hành động Đổi mật khẩu
    if (action === "change_password") {
      const { username, newPassword, confirmPassword } = body;
      if (!username || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập tên tài khoản và mật khẩu mới." },
          { status: 400 }
        );
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu xác nhận không trùng khớp." },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự." },
          { status: 400 }
        );
      }

      changeOfficerPassword(username, newPassword);
      return NextResponse.json({
        success: true,
        message: `Đã thay đổi mật khẩu thành công cho tài khoản "${username}". Vui lòng ghi nhớ mật khẩu mới!`,
      });
    }

    // 2. Hành động Thêm cán bộ quản lý
    if (action === "create") {
      const { fullName, title, username, password, phone, role, canPost, canDelete, canManageOfficers } = body;

      if (!fullName || !username || !password || !title) {
        return NextResponse.json(
          { success: false, message: "Vui lòng điền đầy đủ Họ tên, Chức danh, Tên đăng nhập và Mật khẩu." },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu cán bộ phải có ít nhất 6 ký tự." },
          { status: 400 }
        );
      }

      const newOfficer = addOfficer({
        username,
        password,
        fullName,
        title,
        phone: phone || "",
        role: role === "ADMIN" ? "ADMIN" : "OFFICER",
        canPost: canPost !== false,
        canDelete: canDelete === true,
        canManageOfficers: canManageOfficers === true,
      });

      return NextResponse.json({
        success: true,
        message: `Đã tạo tài khoản cán bộ "${fullName}" (${username}) thành công!`,
        data: {
          id: newOfficer.id,
          username: newOfficer.username,
          fullName: newOfficer.fullName,
          title: newOfficer.title,
          role: newOfficer.role,
        },
      });
    }

    // 3. Hành động Xóa cán bộ
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, message: "Thiếu mã định danh cán bộ cần xóa." },
          { status: 400 }
        );
      }

      deleteOfficer(id);
      return NextResponse.json({
        success: true,
        message: "Đã xóa cán bộ khỏi hệ thống quản lý thành công.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Hành động không hợp lệ." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xử lý yêu cầu quản lý cán bộ." },
      { status: 500 }
    );
  }
}
