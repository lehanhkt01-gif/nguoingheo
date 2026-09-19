import { NextRequest, NextResponse } from "next/server";
import { getCampaignsData, saveCampaignsData, INITIAL_CAMPAIGNS, CampaignItem } from "@/lib/campaigns";

export async function GET() {
  try {
    const store = getCampaignsData();
    return NextResponse.json({
      success: true,
      data: store.campaigns,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, campaigns, campaign } = body;

    if (action === "reset" || action === "clear_all") {
      const resetData = saveCampaignsData({
        campaigns: [],
      });
      return NextResponse.json({
        success: true,
        message: "Đã xóa sạch toàn bộ dữ liệu hoàn cảnh/chiến dịch cũ thành công!",
        data: resetData.campaigns,
      });
    }

    if (Array.isArray(campaigns)) {
      const updated = saveCampaignsData({ campaigns });
      return NextResponse.json({
        success: true,
        message: "Đã lưu danh mục chiến dịch vào hệ thống máy chủ vĩnh viễn!",
        data: updated.campaigns,
      });
    }

    if (action === "create" && campaign) {
      const current = getCampaignsData().campaigns;
      const newId = campaign.id || Date.now();
      const newCode = campaign.code || `CD-${newId}`;
      const newCampaign: CampaignItem = {
        ...campaign,
        id: newId,
        code: newCode,
        amount: Number(campaign.amount) || Number(campaign.currentAmount) || 0,
        images: Array.isArray(campaign.images) ? campaign.images.slice(0, 5) : [],
        files: Array.isArray(campaign.files) ? campaign.files.slice(0, 5) : [],
        createdAt: new Date().toISOString(),
      };
      const updated = saveCampaignsData({ campaigns: [newCampaign, ...current] });
      return NextResponse.json({
        success: true,
        message: "Tạo chiến dịch/hoàn cảnh mới thành công!",
        data: updated.campaigns,
      });
    }

    if (action === "update" && campaign && campaign.id) {
      const current = getCampaignsData().campaigns;
      const updatedList = current.map((c) =>
        c.id === campaign.id
          ? {
              ...c,
              ...campaign,
              amount: Number(campaign.amount) || Number(campaign.currentAmount) || c.amount || 0,
              images: Array.isArray(campaign.images) ? campaign.images.slice(0, 5) : c.images,
              files: Array.isArray(campaign.files) ? campaign.files.slice(0, 5) : c.files,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      const updated = saveCampaignsData({ campaigns: updatedList });
      return NextResponse.json({
        success: true,
        message: "Cập nhật chiến dịch thành công!",
        data: updated.campaigns,
      });
    }

    if (action === "delete" && body.id) {
      const current = getCampaignsData().campaigns;
      const updatedList = current.filter((c) => c.id !== body.id);
      const updated = saveCampaignsData({ campaigns: updatedList });
      return NextResponse.json({
        success: true,
        message: "Đã xóa chiến dịch thành công!",
        data: updated.campaigns,
      });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    console.error("Lỗi cập nhật API campaigns:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
