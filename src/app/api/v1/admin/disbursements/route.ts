import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const village = searchParams.get("village")?.trim() || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { recipientName: { contains: search, mode: "insensitive" } },
        { village: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (village && village !== "ALL") {
      where.village = { contains: village, mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [disbursements, totalCount, aggregateAmount] = await Promise.all([
      prisma.disbursement.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.disbursement.count({ where }),
      prisma.disbursement.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: disbursements,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        totalAmount: Number(aggregateAmount._sum.amount || 0),
      },
    });
  } catch (error: any) {
    console.error("GET disbursements error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      description,
      recipientName,
      verifiedBy,
      village,
      note,
      proofUrls,
      proofImageUrl,
      transactionDateTime,
      date,
    } = body;

    const finalAmount = Number(amount);
    const finalDesc = description || note || "";

    if (!finalAmount || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập số tiền giải ngân hợp lệ (> 0 đ)." },
        { status: 400 }
      );
    }

    const resolvedProofUrl =
      proofImageUrl || (Array.isArray(proofUrls) && proofUrls.length > 0 ? proofUrls[0] : null);

    const txDate = transactionDateTime || date ? new Date(transactionDateTime || date) : new Date();

    const tx = await prisma.disbursement.create({
      data: {
        recipientName: recipientName || verifiedBy || "Hộ nghèo xã Ea Súp",
        village: village || note || "Xã Ea Súp",
        amount: finalAmount,
        notes: finalDesc || `Chi hỗ trợ ${recipientName || verifiedBy || "hộ nghèo"}`,
        proofImageUrl: resolvedProofUrl,
        date: !isNaN(txDate.getTime()) ? txDate : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo phiếu giải ngân thành công!",
      transaction: tx,
    });
  } catch (error: any) {
    console.error("Create disbursement error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, amount, recipientName, village, notes, description, proofImageUrl, date } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID phiếu giải ngân cần cập nhật." },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (amount !== undefined) dataToUpdate.amount = Number(amount);
    if (recipientName !== undefined) dataToUpdate.recipientName = recipientName;
    if (village !== undefined) dataToUpdate.village = village;
    if (notes !== undefined || description !== undefined) dataToUpdate.notes = notes || description;
    if (proofImageUrl !== undefined) dataToUpdate.proofImageUrl = proofImageUrl;
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) dataToUpdate.date = parsed;
    }

    const updated = await prisma.disbursement.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật phiếu giải ngân thành công!",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update disbursement error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID phiếu giải ngân cần xóa." },
        { status: 400 }
      );
    }

    await prisma.disbursement.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa phiếu giải ngân thành công!",
    });
  } catch (error: any) {
    console.error("Delete disbursement error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

