import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // IN, OUT, ALL
    const search = searchParams.get("search")?.trim() || "";
    const campaignCode = searchParams.get("campaign")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // 1. Thống kê tổng hợp toàn bộ tài khoản BIDV 8630100930
    const [statsIn, statsOut, latestTx] = await Promise.all([
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
      prisma.transaction.findFirst({
        where: { accountNumber: "8630100930" },
        orderBy: { transactionDateTime: "desc" },
        select: { transactionDateTime: true, runningBalance: true },
      }),
    ]);

    const totalIn = Number(statsIn._sum.amount || 0);
    const totalOut = Number(statsOut._sum.amount || 0);
    const currentBalance = totalIn - totalOut;

    // 2. Xây dựng điều kiện lọc (Where Clause)
    const where: any = {
      accountNumber: "8630100930",
    };

    if (type && (type === "IN" || type === "OUT")) {
      where.type = type;
    }

    if (campaignCode) {
      where.campaignCode = campaignCode;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { donorName: { contains: search, mode: "insensitive" } },
        { reference: { contains: search, mode: "insensitive" } },
        { receiptNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // 3. Truy vấn danh sách giao dịch phân trang
    const [transactions, totalRecords] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDateTime: "desc" },
        skip,
        take: limit,
        include: {
          campaign: {
            select: { title: true, code: true, slug: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

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
        runningBalanceBank: latestTx?.runningBalance ? Number(latestTx.runningBalance) : currentBalance,
        totalDonationsCount: statsIn._count,
        totalDisbursementsCount: statsOut._count,
        lastSync: latestTx?.transactionDateTime || new Date(),
        certifiedBy: "Casso Live Banking API",
      },
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
      transactions,
    });
  } catch (error: any) {
    console.error("API sao-ke error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch statement data" },
      { status: 500 }
    );
  }
}
