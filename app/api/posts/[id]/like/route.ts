import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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
        return NextResponse.json({ isLiked: true });
      }
    }
  } catch (error) {
    console.error("POST_LIKE_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
