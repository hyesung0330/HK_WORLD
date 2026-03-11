import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        console.log("SUBSCRIPTION_SESSION_CHECK:", {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id
        });

        if (!session || !session.user) {
            console.error("SUBSCRIPTION_AUTH_ERROR: No session found");
            return NextResponse.json({ error: "세션이 만료되었습니다. 다시 로그인해 주세요." }, { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;

        console.log("SUBSCRIPTION_REQUEST_DETAILS:", { userId: session.user.id, plan });

        if (!plan || !["FREE", "STANDARD", "PRO"].includes(plan)) {
            console.error("INVALID_PLAN_ERROR:", { plan });
            return NextResponse.json({ error: "유효하지 않은 요금제입니다." }, { status: 400 });
        }

        if (!session.user.id) {
            console.error("SUBSCRIPTION_USERID_ERROR: No user ID in session");
            return NextResponse.json({ error: "사용자 정보(ID)를 찾을 수 없습니다." }, { status: 400 });
        }

        const rawId = session.user.id;
        const userId = typeof rawId === 'string' ? parseInt(rawId) : Number(rawId);

        if (isNaN(userId)) {
            console.error("INVALID_USERID_FORMAT:", { rawId });
            return NextResponse.json({ error: "사용자 ID 형식이 유효하지 않습니다." }, { status: 400 });
        }

        // 무료 플랜은 중복 구독 방지 (이미 구독 중이면 무시하거나 갱신)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                lograSubscription: plan,
                lograUsageCount: 0,
                lograNextReset: nextMonth,
            },
        });

        return NextResponse.json({
            message: "Subscription updated successfully",
            subscription: updatedUser.lograSubscription,
        });
    } catch (error: any) {
        console.error("SUBSCRIPTION_ERROR:", error);
        return NextResponse.json({ error: error.message || "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
