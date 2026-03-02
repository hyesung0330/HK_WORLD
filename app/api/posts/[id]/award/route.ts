import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addXp, XP_RULES } from "@/lib/xp";
import { BestEditorType } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
    }

    const body = await req.json();
    const { type } = body as { type: keyof typeof BestEditorType | "GOLD" | "SILVER" | "BRONZE" };

    const normalizedType = String(type).toUpperCase();
    if (!['GOLD','SILVER','BRONZE'].includes(normalizedType)) {
      return NextResponse.json({ message: "유효하지 않은 메달 타입입니다." }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const giverId = parseInt(session.user.id);

    // 자기 글에는 수여 불가
    if (post.authorId === giverId) {
      return NextResponse.json({ message: "자기 자신의 글에는 수여할 수 없습니다." }, { status: 400 });
    }

    // 게시글당 1개만 허용(A안): 이미 존재하면 거절
    const existing = await prisma.bestEditorAward.findUnique({ where: { postId: postId } });
    if (existing) {
      return NextResponse.json({ message: "이미 이 게시글에는 베스트 에디터 메달이 수여되었습니다." }, { status: 409 });
    }

    const created = await prisma.bestEditorAward.create({
      data: {
        type: normalizedType as BestEditorType,
        postId: postId,
        giverId: giverId,
        receiverId: post.authorId,
      }
    });

    // 수상자(게시글 작성자) XP 지급
    const awardXp = XP_RULES.AWARD[normalizedType as 'GOLD'|'SILVER'|'BRONZE'];
    await addXp(post.authorId, awardXp);

    return NextResponse.json({ message: "베스트 에디터 메달이 수여되었습니다.", award: created }, { status: 201 });
  } catch (error) {
    console.error("AWARD_POST_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
