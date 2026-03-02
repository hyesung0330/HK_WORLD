import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addXp } from "@/lib/xp";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
        authorId: true,
      }
    });

    // 조회수 5당 1 XP 지급
    if (updatedPost.views % 5 === 0) {
      await addXp(updatedPost.authorId, 1);
    }

    return NextResponse.json({ views: updatedPost.views });
  } catch (error) {
    console.error("PATCH_VIEW_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
