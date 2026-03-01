import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

        // 1. 인증 체크: 로그인이 되어있는가?
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        // 2. 권한 체크: 본인의 정보만 수정 가능한가?
        const currentUserId = parseInt(session.user.id);
        
        if (currentUserId !== targetId) {
            return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
        }

        // 3. 요청 데이터 파싱
        const body = await req.json();
        const { nickname, github } = body;

        // 4. DB 업데이트
        const updatedUser = await prisma.user.update({
            where: { id: targetId },
            data: {
                name: nickname,
                githubUrl: github,
            },
        });

        return NextResponse.json({
            message: "프로필이 성공적으로 업데이트되었습니다.",
            user: {
                name: updatedUser.name,
                github: updatedUser.githubUrl,
            },
        }, { status: 200 });

    } catch (error) {
        console.error("USER_UPDATE_ERROR:", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}