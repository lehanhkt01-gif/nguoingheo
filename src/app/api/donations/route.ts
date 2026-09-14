import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get("limit") || "15")));
    const search = searchParams.get("search")?.trim() || "";
    const village = searchParams.get("village")?.trim() || "";
    const campaignId = searchParams.get("campaignId") ? parseInt(searchParams.get("campaignId")!) : undefined;

    // Xây dựng điều kiện lọc (Where Clause)
    const where: any = {
      status: "COMPLETED",
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (village && village !== "ALL") {
      where.description = {
        contains: village,
        mode: "insensitive",
      };
    }

    const skip = (page - 1) * limit;

    // Truy vấn song song dữ liệu và tổng số bản ghi
    const [donations, totalCount, aggregateAmount] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { transactionDate: "desc" },
        skip,
        take: limit,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.donation.count({ where }),
      prisma.donation.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: donations,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        totalAmount: Number(aggregateAmount._sum.amount || 0),
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi API /api/donations:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
