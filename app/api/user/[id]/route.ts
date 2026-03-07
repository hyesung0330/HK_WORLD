import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        const { id } = await params;
        const targetId = parseInt(id);

        if (isNaN(targetId)) {
            return NextResponse.json({ message: "유효하지 않은 사용자 ID입니다." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: targetId },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    }
                },
                awardsReceived: true,
                posts: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        _count: {
                            select: { likes: true, comments: true }
                        }
                    }
                },
            },
        });

        if (!user) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        // 현재 로그인한 사용자가 이 사용자를 팔로우 중인지 확인
        let isFollowing = false;
        if (session?.user?.id) {
            const currentUserId = parseInt(session.user.id);
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: targetId,
                    }
                }
            });
            isFollowing = !!follow;
        }

        const { password, ...userWithoutPassword } = user as any;
        const gold = user.awardsReceived.filter(a => a.type === 'GOLD').length;
        const silver = user.awardsReceived.filter(a => a.type === 'SILVER').length;
        const bronze = user.awardsReceived.filter(a => a.type === 'BRONZE').length;

        return NextResponse.json({
            ...userWithoutPassword,
            isFollowing,
            medals: {
                gold, silver, bronze, total: gold + silver + bronze
            }
        });

    } catch (error) {
        console.error("GET_USER_ERROR:", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
