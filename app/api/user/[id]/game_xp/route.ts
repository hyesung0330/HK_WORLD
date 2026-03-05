import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addXp } from "@/lib/xp";

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

        const { xp } = await req.json();

        // 2. XP 값 검증 (숫자인지, 음수는 아닌지, 최대치 제한 등)
        const earnedXp = Number(xp);
        if (isNaN(earnedXp) || earnedXp <= 0) {
            return NextResponse.json({ error: "유효하지 않은 XP 값입니다." }, { status: 400 });
        }

        // 최대 100,000 XP 상한선 재검증 (보안 핵심)
        const safeXp = Math.min(earnedXp, 100000);

        // 3. lib/xp.ts의 addXp를 사용하여 DB 업데이트 및 레벨/역할 갱신
        await addXp(Number(sessionUserId), safeXp);

        return NextResponse.json({
            success: true,
            message: `${safeXp} XP가 적립되었습니다.`,
        });

    } catch (error) {
        console.error("XP 적립 API 오류:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}