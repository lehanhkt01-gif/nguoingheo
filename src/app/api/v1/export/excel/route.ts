import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTransactionsExcel } from "@/lib/export-excel";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const campaignCode = searchParams.get("campaign");

    const [donations, disbursements] = await Promise.all([
      prisma.donation.findMany({
        where: { status: "COMPLETED" },
        orderBy: { transactionDate: "desc" },
        take: 1000,
      }),
      prisma.disbursement.findMany({
        orderBy: { date: "desc" },
        take: 1000,
      }),
    ]);

    const mappedIn = donations.map((d) => ({
      id: d.id,
      reference: d.transactionId,
      type: "IN",
      amount: Number(d.amount),
      runningBalance: null,
      description: d.description,
      transactionDateTime: d.transactionDate,
      campaignCode: "VNN",
      donorName: d.donorName,
      receiptNumber: d.transactionId,
      note: null,
    }));

    const mappedOut = disbursements.map((d) => ({
      id: d.id,
      reference: `PC-${d.id.toString().padStart(6, "0")}`,
      type: "OUT",
      amount: Number(d.amount),
      runningBalance: null,
      description: d.notes || `Chi hỗ trợ ${d.recipientName} (${d.village})`,
      transactionDateTime: d.date,
      campaignCode: "VNN",
      donorName: d.recipientName,
      receiptNumber: `PC-${d.id.toString().padStart(4, "0")}`,
      note: d.village,
    }));

    let all = [...mappedIn, ...mappedOut].sort(
      (a, b) => new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime()
    );

    if (type === "IN") all = mappedIn;
    if (type === "OUT") all = mappedOut;

    const buffer = await generateTransactionsExcel(all);

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
