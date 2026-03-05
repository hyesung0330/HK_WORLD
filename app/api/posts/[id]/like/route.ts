import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { addXp, XP_RULES } from "@/lib/xp";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
    }

    let isLiked = false;

    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: parseInt(session.user.id),
            postId: postId,
          },
        },
      });
      isLiked = !!like;
    } else {
      const anonymousId = (await cookies()).get("anonymousId")?.value;
      if (anonymousId) {
        const like = await prisma.like.findUnique({
          where: {
            anonymousId_postId: {
              anonymousId: anonymousId,
              postId: postId,
            },
          },
        });
        isLiked = !!like;
      }
    }

    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error("GET_LIKE_ERROR", error);
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
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
    }

    if (session?.user?.id) {
      const userId = parseInt(session.user.id);
      
      const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ isLiked: false });
      } else {
        await prisma.like.create({
          data: { userId, postId },
        });

        // 알림 생성 (Raw Query 사용)
        try {
            const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
            if (post && post.authorId !== userId) {
                await prisma.$executeRaw`
                    INSERT INTO notifications (user_id, sender_id, post_id, type, is_read, created_at)
                    VALUES (${post.authorId}, ${userId}, ${postId}, 'LIKE', false, NOW())
                `;
            }
        } catch (notifyError) {
            console.error("LIKE_NOTIFICATION_ERROR:", notifyError);
        }

        // 게시글 작성자 XP 지급
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
        if (post) {
          await addXp(post.authorId, XP_RULES.LIKE);
        }
        return NextResponse.json({ isLiked: true });
      }
    } else {
      // 익명 좋아요 처리
      let anonymousId = (await cookies()).get("anonymousId")?.value;
      if (!anonymousId) {
        anonymousId = Math.random().toString(36).substring(2, 15);
        // 쿠키 설정 (간단히 1년)
        (await cookies()).set("anonymousId", anonymousId, { maxAge: 60 * 60 * 24 * 365 });
      }

      const existingLike = await prisma.like.findUnique({
        where: { anonymousId_postId: { anonymousId, postId } },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ isLiked: false });
      } else {
        await prisma.like.create({
          data: { anonymousId, postId },
        });

        // 익명 좋아요는 알림 생략 (또는 발신자 없이 생성 가능하지만 일단 생략)

        // 게시글 작성자 XP 지급 (익명 좋아요도 반영)
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
        if (post) {
          await addXp(post.authorId, XP_RULES.LIKE);
        }
        return NextResponse.json({ isLiked: true });
      }
    }
  } catch (error) {
    console.error("POST_LIKE_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
