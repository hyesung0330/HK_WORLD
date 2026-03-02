import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addXp, XP_RULES } from "@/lib/xp";

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
    const search = searchParams.get("search");
    const tag = searchParams.get("tag"); // 프리셋 태그 필터

    const where: any = {};
    if (type) where.postType = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { author: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (tag && tag !== "전체") {
      where.tags = {
        some: { tag: { name: tag } }
      };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          }
        },
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            comments: true,
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
    const { title, content, mode, link, techStack, coverImage, tags } = body as {
      title: string;
      content: string;
      mode: "community" | "promote" | "note";
      link?: string;
      techStack?: string;
      coverImage?: string | null;
      tags?: string[];
    };

    if (!title || !content || !mode) {
      return NextResponse.json({ message: "필수 값이 누락되었습니다." }, { status: 400 });
    }

    const postType = mapModeToPostType(mode);

    // 프로 에디터(레벨 31+)만 COLUMN 작성 가능
    if (postType === "COLUMN") {
      const me = await prisma.user.findUnique({ where: { id: parseInt(session.user.id) } });
      if (!me) {
        return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
      }
      if ((me.level || 1) < 31) {
        return NextResponse.json({ message: "프로 등급(레벨 31+)만 전문 컬럼을 작성할 수 있습니다." }, { status: 403 });
      }
    }

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
        tags: tags && tags.length > 0 ? {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      select: {
        id: true,
        title: true,
        postType: true,
        authorId: true,
        createdAt: true,
      }
    });

    // 글쓰기 XP 지급 (20)
    await addXp(created.authorId, XP_RULES.POST);

    return NextResponse.json({
      message: "게시글이 등록되었습니다.",
      post: created,
    }, { status: 201 });
  } catch (e) {
    console.error("POST_CREATE_ERROR", e);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
