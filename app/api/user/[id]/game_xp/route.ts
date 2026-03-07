import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addXp } from "@/lib/xp";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    // 1. 서버 세션 확인 (서버가 인증한 유저 정보)
    const session = await auth();

    // 로그인이 안 되어 있으면 즉시 차단
    if (!session || !session.user) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        const { id } = await params;
        const sessionUserId = (session.user as any).id;
        
        // URL의 ID와 세션의 ID가 일치하는지 확인 (보안 강화)
        if (String(id) !== String(sessionUserId)) {
            return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
        }

        const { xp, score } = await req.json();

        // 2. XP 값 검증 (숫자인지, 음수는 아닌지)
        const earnedXp = Number(xp);
        if (isNaN(earnedXp) || earnedXp <= 0) {
            return NextResponse.json({ error: "유효하지 않은 XP 값입니다." }, { status: 400 });
        }

        // 3. 일일 한도 체크 (1000 XP & 10 games)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        // 오늘 플레이한 게임 횟수 조회
        const dailyGameCount = await prisma.gameLog.count({
            where: {
                userId: Number(sessionUserId),
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        if (dailyGameCount >= 10) {
            return NextResponse.json({
                success: false,
                message: "오늘 플레이 가능한 횟수(10판)를 모두 소진했습니다.",
                limitReached: true
            });
        }

        const dailyXpSum = await prisma.gameLog.aggregate({
            where: {
                userId: Number(sessionUserId),
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            _sum: {
                xp: true
            }
        });

        const currentDailyXp = dailyXpSum._sum.xp || 0;
        const remainingLimit = Math.max(0, 1000 - currentDailyXp);

        if (remainingLimit <= 0) {
            return NextResponse.json({ 
                success: false, 
                message: "오늘 획득 가능한 게임 경험치를 모두 소진했습니다. (일일 한도 1000 XP)",
                limitReached: true
            });
        }

        const safeXp = Math.min(earnedXp, remainingLimit);

        // 4. GameLog 저장
        await prisma.gameLog.create({
            data: {
                userId: Number(sessionUserId),
                score: Number(score) || 0,
                xp: safeXp
            }
        });

        // 5. lib/xp.ts의 addXp를 사용하여 DB 업데이트 및 레벨/역할 갱신
        await addXp(Number(sessionUserId), safeXp);

        return NextResponse.json({
            success: true,
            message: `${safeXp} XP가 적립되었습니다.${safeXp < earnedXp ? " (일일 한도 적용)" : ""}`,
            earnedXp: safeXp,
            limitReached: safeXp < earnedXp || safeXp + currentDailyXp >= 1000 || dailyGameCount + 1 >= 10,
            dailyGameCount: dailyGameCount + 1
        });

    } catch (error) {
        console.error("XP 적립 API 오류:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}