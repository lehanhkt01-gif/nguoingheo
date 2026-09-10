import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNghiDinh30Report } from "@/lib/export-docx";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Quý I/2026";
    const reportNumber = searchParams.get("reportNumber") || "15/BC-BVĐ";

    const [statsIn, statsOut, campaignCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "IN", accountNumber: "8630100930" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: "OUT", accountNumber: "8630100930" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
    ]);

    const totalIn = Number(statsIn._sum.amount || 0);
    const totalOut = Number(statsOut._sum.amount || 0);
    const currentBalance = totalIn - totalOut;

    const buffer = await generateNghiDinh30Report({
      reportNumber,
      reportPeriod: period,
      totalIn,
      totalOut,
      currentBalance,
      transactionCount: statsIn._count,
      activeCampaignCount: campaignCount,
      signerName: "Lê Hồng Hạnh",
    });

    const filename = `Bao_Cao_Nghi_Dinh_30_MTTQ_Ea_Sup_${new Date().toISOString().slice(0, 10)}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export DOCX Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
