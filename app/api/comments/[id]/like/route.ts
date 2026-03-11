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
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return NextResponse.json({ message: "유효하지 않은 댓글 ID입니다." }, { status: 400 });
    }

    if (!session?.user?.id) {
        return NextResponse.json({ isLiked: false });
    }

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: parseInt(session.user.id),
          commentId,
        },
      },
    });

    return NextResponse.json({ isLiked: !!like });
  } catch (error) {
    console.error("GET_COMMENT_LIKE_STATUS_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return NextResponse.json({ message: "유효하지 않은 댓글 ID입니다." }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ isLiked: false });
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      // 알림 생성 로직 (선택 사항)
      try {
        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          select: { authorId: true, postId: true }
        });
        if (comment && comment.authorId && comment.authorId !== userId) {
            await prisma.notification.create({
              data: {
                userId: comment.authorId,
                senderId: userId,
                postId: comment.postId,
                type: 'LIKE',
                isRead: false
              }
            });
        }
      } catch (notifyError) {
        console.error("COMMENT_LIKE_NOTIFICATION_ERROR:", notifyError);
      }

      return NextResponse.json({ isLiked: true });
    }
  } catch (error) {
    console.error("POST_COMMENT_LIKE_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
