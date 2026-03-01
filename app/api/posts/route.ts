import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// UI 모드 -> DB PostType 매핑
function mapModeToPostType(mode: string): "PIECE" | "COLUMN" | "TECHNICAL" {
  switch (mode) {
    case "community":
      return "TECHNICAL"; // 정보/토론 성격
    case "promote":
      return "COLUMN"; // 홍보/소개 성격
    case "note":
    default:
      return "PIECE"; // 개인 노트/에세이 성격
  }
}

function buildSummary(title: string, content: string): string {
  const base = content?.trim() ? content.trim() : title.trim();
  return base.substring(0, 180);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "PIECE" | "COLUMN" | "TECHNICAL" | null;

    const posts = await prisma.post.findMany({
      where: type ? { postType: type } : {},
      include: {
        author: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_POSTS_ERROR", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, mode, link, techStack, coverImage } = body as {
      title: string;
      content: string;
      mode: "community" | "promote" | "note";
      link?: string;
      techStack?: string;
      coverImage?: string | null;
    };

    if (!title || !content || !mode) {
      return NextResponse.json({ message: "필수 값이 누락되었습니다." }, { status: 400 });
    }

    const postType = mapModeToPostType(mode);

    // promote 모드 보조 정보는 본문 맨 앞에 메타로 병합 저장 (스키마 확장 전 임시 처리)
    const promoteMeta = mode === "promote"
      ? `\n\n---\nLink: ${link || "-"}\nTech: ${techStack || "-"}`
      : "";

    const composedContent = `${content}${promoteMeta}`;

    const created = await prisma.post.create({
      data: {
        title,
        content: composedContent,
        summary: buildSummary(title, content),
        postType,
        authorId: parseInt(session.user.id),
        // coverImage, link, techStack 은 스키마 확장 후 별도 컬럼으로 이동 예정
      },
      select: {
        id: true,
        title: true,
        postType: true,
        authorId: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      message: "게시글이 등록되었습니다.",
      post: created,
    }, { status: 201 });
  } catch (e) {
    console.error("POST_CREATE_ERROR", e);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
