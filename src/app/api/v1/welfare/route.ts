import { NextRequest, NextResponse } from "next/server";
import {
  getWelfareData,
  saveWelfareData,
  syncWelfareGiftsToDisbursements,
  clearWelfareDisbursements,
  INITIAL_CASES,
  INITIAL_GIFTS,
} from "@/lib/welfare";

export async function GET() {
  try {
    const data = getWelfareData();
    // Đảm bảo dữ liệu Đợt trao quà được đồng bộ sang Disbursement
    syncWelfareGiftsToDisbursements(data.gifts).catch((err) => {
      console.warn("Background welfare sync warning:", err);
    });
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

    if (action === "reset" || action === "clear_all") {
      const resetData = saveWelfareData({
        cases: [],
        gifts: [],
      });
      await clearWelfareDisbursements();
      return NextResponse.json({
        success: true,
        message: "Đã xóa toàn bộ dữ liệu mẫu cũ và làm sạch sổ chi giải ngân!",
        data: resetData,
      });
    }

    const updated = saveWelfareData({
      cases: Array.isArray(cases) ? cases : undefined,
      gifts: Array.isArray(gifts) ? gifts : undefined,
    });

    // Tự động đồng bộ ngay lập tức vào bảng Disbursement để Tiền ra (-) cập nhật thời gian thực
    if (Array.isArray(gifts)) {
      await syncWelfareGiftsToDisbursements(updated.gifts);
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu vào hệ thống máy chủ và cập nhật sổ tiền ra thành công!",
      data: updated,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật API welfare:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

