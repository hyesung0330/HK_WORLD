import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: {
        xp: 'desc'
      },
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        role: true,
        bio: true,
        _count: {
          select: {
            posts: true,
            followers: true
          }
        }
      }
    });

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("RANKING_GET_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
