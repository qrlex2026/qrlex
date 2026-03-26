import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Restoran kredi bakiyesini getir
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId gerekli" }, { status: 400 });
  }

  // Kredi kaydı yoksa otomatik oluştur (100 kredi)
  let credit = await (prisma as any).aiCredit.findUnique({
    where: { restaurantId },
  });

  if (!credit) {
    credit = await (prisma as any).aiCredit.create({
      data: { restaurantId, balance: 500 },
    });
  }

  return NextResponse.json({
    balance: credit.balance,
    id: credit.id,
  });
}

