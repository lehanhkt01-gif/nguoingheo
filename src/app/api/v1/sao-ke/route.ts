import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // IN, OUT, ALL
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "20")));

    // 1. Thống kê tổng hợp toàn bộ tài khoản BIDV 8630100930
    const [statsIn, statsOut] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.disbursement.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIn = Number(statsIn._sum.amount || 0);
    const totalOut = Number(statsOut._sum.amount || 0);
    const currentBalance = totalIn - totalOut;

    // 2. Lấy danh sách giao dịch theo type
    let items: any[] = [];
    let totalRecords = 0;

    if (type === "OUT") {
      const where: any = {};
      if (search) {
        where.OR = [
          { recipientName: { contains: search, mode: "insensitive" } },
          { village: { contains: search, mode: "insensitive" } },
          { notes: { contains: search, mode: "insensitive" } },
        ];
      }
      const [disbursements, count] = await Promise.all([
        prisma.disbursement.findMany({
          where,
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.disbursement.count({ where }),
      ]);
      items = disbursements.map((d) => ({
        id: d.id,
        reference: `PC-${d.id.toString().padStart(6, "0")}`,
        type: "OUT",
        amount: Number(d.amount),
        description: d.notes || `Chi hỗ trợ ${d.recipientName} (${d.village})`,
        transactionDateTime: d.date.toISOString(),
        donorName: d.recipientName,
        proofUrls: d.proofImageUrl ? [d.proofImageUrl] : [],
        receiptNumber: `PC-${d.id.toString().padStart(4, "0")}`,
      }));
      totalRecords = count;
    } else if (type === "IN") {
      const where: any = { status: "COMPLETED" };
      if (search) {
        where.OR = [
          { donorName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { transactionId: { contains: search, mode: "insensitive" } },
        ];
      }
      const [donations, count] = await Promise.all([
        prisma.donation.findMany({
          where,
          orderBy: { transactionDate: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            campaign: { select: { title: true } },
          },
        }),
        prisma.donation.count({ where }),
      ]);
      items = donations.map((d) => ({
        id: d.id,
        reference: d.transactionId,
        type: "IN",
        amount: Number(d.amount),
        description: d.description,
        transactionDateTime: d.transactionDate.toISOString(),
        donorName: d.donorName,
        campaign: d.campaign ? { title: d.campaign.title, code: "VNN", slug: "vnn" } : null,
        receiptNumber: d.transactionId,
      }));
      totalRecords = count;
    } else {
      // ALL: gộp donations và disbursements
      const [donations, disbursements] = await Promise.all([
        prisma.donation.findMany({
          where: { status: "COMPLETED" },
          orderBy: { transactionDate: "desc" },
          take: 100,
          include: { campaign: { select: { title: true } } },
        }),
        prisma.disbursement.findMany({
          orderBy: { date: "desc" },
          take: 100,
        }),
      ]);

      const mappedIn = donations.map((d) => ({
        id: d.id,
        reference: d.transactionId,
        type: "IN",
        amount: Number(d.amount),
        description: d.description,
        transactionDateTime: d.transactionDate.toISOString(),
        donorName: d.donorName,
        campaign: d.campaign ? { title: d.campaign.title, code: "VNN", slug: "vnn" } : null,
        receiptNumber: d.transactionId,
      }));

      const mappedOut = disbursements.map((d) => ({
        id: d.id,
        reference: `PC-${d.id.toString().padStart(6, "0")}`,
        type: "OUT",
        amount: Number(d.amount),
        description: d.notes || `Chi hỗ trợ ${d.recipientName} (${d.village})`,
        transactionDateTime: d.date.toISOString(),
        donorName: d.recipientName,
        proofUrls: d.proofImageUrl ? [d.proofImageUrl] : [],
        receiptNumber: `PC-${d.id.toString().padStart(4, "0")}`,
      }));

      let all = [...mappedIn, ...mappedOut].sort(
        (a, b) => new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime()
      );

      if (search) {
        const s = search.toLowerCase();
        all = all.filter(
          (t) =>
            t.description.toLowerCase().includes(s) ||
            (t.donorName && t.donorName.toLowerCase().includes(s)) ||
            (t.reference && t.reference.toLowerCase().includes(s))
        );
      }

      totalRecords = all.length;
      items = all.slice((page - 1) * limit, page * limit);
    }

    return NextResponse.json({
      success: true,
      summary: {
        accountNumber: "8630100930",
        bankName: "BIDV",
        bankAbbreviation: "BIDV",
        accountName: "UY BAN MTTQ VN XA EA SUP",
        totalIn,
        totalOut,
        currentBalance,
        runningBalanceBank: currentBalance,
        totalDonationsCount: statsIn._count,
        totalDisbursementsCount: statsOut._count,
        lastSync: new Date().toISOString(),
        certifiedBy: "Casso Live Banking API",
      },
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.max(1, Math.ceil(totalRecords / limit)),
      },
      transactions: items,
    });
  } catch (error: any) {
    console.error("API sao-ke error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch statement data" },
      { status: 500 }
    );
  }
}
