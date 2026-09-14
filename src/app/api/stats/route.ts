import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [donationsAgg, disbursementsAgg, campaignsCount] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.disbursement.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
      prisma.campaign.count({
        where: { status: "ACTIVE" },
      }),
    ]);

    const totalDonations = Number(donationsAgg._sum.amount || 0);
    const donationCount = donationsAgg._count || 0;
    const totalDisbursed = Number(disbursementsAgg._sum.amount || 0);
    const disbursementCount = disbursementsAgg._count || 0;
    const netBalance = totalDonations - totalDisbursed;

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,      // 1. Tổng thu (Tổng vận động)
        totalDisbursed,      // 2. Tổng chi (Đã giải ngân)
        netBalance,          // 3. Số dư thực tế khả dụng
        donationCount,       // 4. Số lượt ủng hộ
        disbursementCount,   // Số lượt hộ được hỗ trợ
        activeCampaigns: campaignsCount,
      },
      accountInfo: {
        bankName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
        accountNumber: "8630100930",
        accountName: "UY BAN MTTQ VN XA EA SUP",
        branch: "Chi nhánh Ea Súp - Đắk Lắk",
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi API /api/stats:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
