import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      description,
      campaignCode,
      receiptNumber,
      verifiedBy,
      proofUrls,
      note,
      transactionDateTime,
    } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập số tiền và nội dung giải ngân." },
        { status: 400 }
      );
    }

    const tx = await prisma.disbursement.create({
      data: {
        recipientName: verifiedBy || "Hộ nghèo xã Ea Súp",
        village: note || "Ea Súp",
        amount: Number(amount),
        notes: description,
        proofImageUrl: Array.isArray(proofUrls) && proofUrls.length > 0 ? proofUrls[0] : null,
        date: transactionDateTime ? new Date(transactionDateTime) : new Date(),
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
