import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTransactionsExcel } from "@/lib/export-excel";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const campaignCode = searchParams.get("campaign");

    const where: any = { accountNumber: "8630100930" };
    if (type === "IN" || type === "OUT") {
      where.type = type;
    }
    if (campaignCode) {
      where.campaignCode = campaignCode;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDateTime: "desc" },
      take: 2000, // Tối đa 2000 dòng sao kê mới nhất
    });

    const buffer = await generateTransactionsExcel(
      transactions.map((t) => ({
        id: t.id,
        reference: t.reference,
        type: t.type,
        amount: Number(t.amount),
        runningBalance: t.runningBalance ? Number(t.runningBalance) : null,
        description: t.description,
        transactionDateTime: t.transactionDateTime,
        campaignCode: t.campaignCode,
        donorName: t.donorName,
        receiptNumber: t.receiptNumber,
        note: t.note,
      }))
    );

    const filename = `Sao_Ke_BIDV_8630100930_Ea_Sup_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export Excel Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
