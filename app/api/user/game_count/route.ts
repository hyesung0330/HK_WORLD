import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ dailyGameCount: 0 });
    }

    try {
        const userId = (session.user as any).id;
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const count = await prisma.gameLog.count({
            where: {
                userId: Number(userId),
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        return NextResponse.json({ dailyGameCount: count });
    } catch (error) {
        console.error("GET_GAME_COUNT_ERROR:", error);
        return NextResponse.json({ dailyGameCount: 0 }, { status: 500 });
    }
}
