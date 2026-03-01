import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 랜덤 닉네임 생성기
const adjectives = ["익명의", "수줍은", "대담한", "즐거운", "고민하는", "창의적인", "열정적인", "차분한", "똑똑한", "용감한"];
const nouns = ["개발자", "코더", "작가", "철학자", "탐험가", "아티스트", "러너", "마법사", "디자이너", "독자"];

function generateRandomNickname() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj} ${noun} ${num}`;
}

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

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 최상위 댓글만 필터링 (parentId가 없는 것)
    const rootComments = comments.filter(c => !c.parentId);

    return NextResponse.json(rootComments);
  } catch (error) {
    console.error("GET_COMMENTS_ERROR", error);
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

    const { content, parentId, isAnonymous } = await req.json();

    if (!content) {
      return NextResponse.json({ message: "댓글 내용을 입력해주세요." }, { status: 400 });
    }

    const data: any = {
      content,
      postId,
      parentId: parentId ? parseInt(parentId) : null,
    };

    if (session?.user?.id) {
      data.authorId = parseInt(session.user.id);
      data.isAnonymous = !!isAnonymous; // 로그인 상태에서도 익명 체크 가능
      if (isAnonymous) {
          data.nickname = generateRandomNickname();
      }
    } else {
      // 비로그인 사용자는 무조건 익명
      data.isAnonymous = true;
      data.nickname = generateRandomNickname();
    }

    const newComment = await prisma.comment.create({
      data,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("POST_COMMENT_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
