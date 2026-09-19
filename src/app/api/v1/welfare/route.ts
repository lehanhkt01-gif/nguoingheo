import { NextRequest, NextResponse } from "next/server";
import { getWelfareData, saveWelfareData, INITIAL_CASES, INITIAL_GIFTS } from "@/lib/welfare";

export async function GET() {
  try {
    const data = getWelfareData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cases, gifts, action } = body;

    if (action === "reset") {
      const resetData = saveWelfareData({
        cases: INITIAL_CASES,
        gifts: INITIAL_GIFTS,
      });
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục dữ liệu mẫu hệ thống thành công!",
        data: resetData,
      });
    }

    const updated = saveWelfareData({
      cases: Array.isArray(cases) ? cases : undefined,
      gifts: Array.isArray(gifts) ? gifts : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Đã lưu vào hệ thống máy chủ thành công!",
      data: updated,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật API welfare:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
