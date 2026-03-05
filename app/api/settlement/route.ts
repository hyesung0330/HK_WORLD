import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const { amount } = await req.json();

        if (!amount || amount < 5000) {
            return NextResponse.json({ message: "최소 5,000P 이상부터 정산 신청이 가능합니다." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });

        if (!user || user.points < amount) {
            return NextResponse.json({ message: "보유 포인트가 부족합니다." }, { status: 400 });
        }

        // 포인트 차감 및 정산 신청 기록 생성
        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { points: { decrement: amount } }
            }),
            prisma.settlementRequest.create({
                data: {
                    userId,
                    amount,
                    status: "PENDING"
                }
            })
        ]);

        return NextResponse.json({
            message: "정산 신청이 완료되었습니다.",
            newPoints: result[0].points,
            request: result[1]
        }, { status: 201 });

    } catch (error) {
        console.error("SETTLEMENT_POST_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const requests = await prisma.settlementRequest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("SETTLEMENT_GET_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
