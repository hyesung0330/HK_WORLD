import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const postId = parseInt(id);

        if (isNaN(postId)) {
            return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        bio: true,
                        level: true,
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            }
        });

        if (!post) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("GET_POST_DETAIL_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
