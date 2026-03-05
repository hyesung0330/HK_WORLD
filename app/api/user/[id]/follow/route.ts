import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        const { id } = await params;
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const followerId = parseInt(session.user.id);
        const followingId = parseInt(id);

        if (isNaN(followingId)) {
            return NextResponse.json({ message: "유효하지 않은 사용자 ID입니다." }, { status: 400 });
        }

        if (followerId === followingId) {
            return NextResponse.json({ message: "자신을 팔로우할 수 없습니다." }, { status: 400 });
        }

        // 이미 팔로우 중인지 확인
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            // 언팔로우
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            return NextResponse.json({ message: "언팔로우했습니다.", isFollowing: false });
        } else {
            // 팔로우
            await prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            });

            // 알림 생성 (Raw Query 사용 - Prisma Client 재생성 문제 대비)
            try {
                await prisma.$executeRaw`
                    INSERT INTO notifications (user_id, sender_id, type, is_read, created_at)
                    VALUES (${followingId}, ${followerId}, 'FOLLOW', false, NOW())
                `;
            } catch (notifyError) {
                console.error("NOTIFICATION_CREATE_ERROR:", notifyError);
                // 알림 생성 실패가 팔로우 자체의 실패로 이어지지는 않게 함
            }

            return NextResponse.json({ message: "팔로우했습니다.", isFollowing: true });
        }

    } catch (error) {
        console.error("FOLLOW_ERROR:", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
