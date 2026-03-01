import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ message: "유효하지 않은 사용자 ID입니다." }, { status: 400 });
        }

        const posts = await prisma.post.findMany({
            where: {
                authorId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            select: {
                id: true,
                title: true,
                createdAt: true,
                postType: true,
            },
        });

        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error("GET_USER_POSTS_ERROR:", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
