import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addXp, addPoints } from "@/lib/xp";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

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

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    
    let sessionId = null;
    if (!userId) {
      const cookieStore = await cookies();
      sessionId = cookieStore.get("session_id")?.value;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        // 실제 운영 환경에서는 응답에 쿠키를 설정해야 하지만, 
        // 여기서는 세션 식별 용도로만 사용하거나 클라이언트에서 처리하게 할 수 있습니다.
        // 일단 서버측에서 생성하여 추적합니다.
      }
    }

    // 해당 사용자의 이 게시글 조회 기록 확인
    const postView = await prisma.postView.findFirst({
      where: {
        postId,
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined }
        ]
      }
    });

    const currentCount = postView?.count || 0;

    // 5회 미만일 때만 조회수 증가 및 경험치 로직 실행
    if (currentCount < 5) {
      // 1. PostView 기록 업데이트/생성
      if (postView) {
        await prisma.postView.update({
          where: { id: postView.id },
          data: { count: { increment: 1 } }
        });
      } else {
        await prisma.postView.create({
          data: {
            postId,
            userId,
            sessionId,
            count: 1
          }
        });
      }

      // 2. 게시글 총 조회수 증가
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
          author: {
            select: { role: true }
          }
        }
      });

      // 3. 경험치 지급 (조회수 5당 1 XP)
      if (updatedPost.views % 5 === 0) {
        await addXp(updatedPost.authorId, 1);
      }

      // 4. 포인트 지급 (활동 등급에 따른 광고 수익 보상)
      // Professional: 조회수 5당 1P (XP랑 동일하게 높게 책정)
      // Pro: 조회수 10당 1P
      if (updatedPost.author.role === UserRole.PROFESSIONAL) {
          if (updatedPost.views % 5 === 0) {
              await addPoints(updatedPost.authorId, 1);
          }
      } else if (updatedPost.author.role === UserRole.PRO) {
          if (updatedPost.views % 10 === 0) {
              await addPoints(updatedPost.authorId, 1);
          }
      }

      const response = NextResponse.json({ views: updatedPost.views });
      
      // 비로그인 사용자에게 세션 아이디 쿠키 설정 (필요시)
      if (!userId && sessionId) {
        response.cookies.set("session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1주일
          path: "/",
        });
      }

      return response;
    }

    // 5회 이상 조회 시 조회수 변화 없이 현재 값 반환
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { views: true }
    });

    return NextResponse.json({ views: post?.views || 0, message: "조회수 제한 도달" });
  } catch (error) {
    console.error("PATCH_VIEW_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
