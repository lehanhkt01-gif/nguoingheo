import { NextRequest, NextResponse } from "next/server";
import { getPostsData, addPost, deletePost } from "@/lib/posts";

export async function GET(req: NextRequest) {
  try {
    const store = getPostsData();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let posts = store.posts;
    if (category && category !== "ALL") {
      posts = posts.filter((p) => p.category === category);
    }

    return NextResponse.json({
      success: true,
      data: posts,
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

    // 1. Đăng thông tin bài đăng mới
    if (action === "create") {
      const { title, category, summary, content, authorName, authorUsername, village, imageUrl, date } = body;

      if (!title || !content) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập đầy đủ tiêu đề và nội dung bài đăng." },
          { status: 400 }
        );
      }

      const newPost = addPost({
        title,
        category: category || "TIN_TUC",
        summary: summary || (content.length > 150 ? content.slice(0, 150) + "..." : content),
        content,
        authorName: authorName || "Ban Biên Tập MTTQ xã",
        authorUsername: authorUsername || "admin",
        village: village || "Toàn xã Ea Súp",
        imageUrl: imageUrl || "/images/hero-charity-bg.jpg",
        date: date || new Date().toISOString().slice(0, 10),
        status: "PUBLISHED",
      });

      return NextResponse.json({
        success: true,
        message: `Đã đăng bài viết "${title}" lên cổng thông tin thành công!`,
        data: newPost,
      });
    }

    // 2. Xóa thông tin bài đăng
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, message: "Thiếu mã định danh bài đăng cần xóa." },
          { status: 400 }
        );
      }

      deletePost(id);
      return NextResponse.json({
        success: true,
        message: "Đã xóa bài đăng khỏi hệ thống thành công.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Hành động không hợp lệ." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi xử lý quản lý bài đăng." },
      { status: 500 }
    );
  }
}
