import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);

        // Prisma Client 재생성 문제로 인해 (prisma as any).notification 사용
        const notifications = await (prisma as any).notification.findMany({
            where: { userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        postType: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50 
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("GET_NOTIFICATIONS_ERROR:", error);
        // 만약 모델을 찾을 수 없는 에러가 발생한다면 Raw Query로 백업 시도 가능
        return NextResponse.json({ error: "알림을 가져오는 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);
        const body = await req.json().catch(() => ({}));
        const { id } = body;

        if (id) {
            // 특정 알림 읽음 처리
            await (prisma as any).notification.update({
                where: { id: parseInt(id), userId },
                data: { isRead: true }
            });
        } else {
            // 모든 알림 읽음 처리
            await (prisma as any).notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH_NOTIFICATIONS_ERROR:", error);
        return NextResponse.json({ error: "알림 업데이트 중 오류가 발생했습니다." }, { status: 500 });
    }
}
