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
  // HTML 태그 제거 로직 추가
  const stripped = content?.replace(/<[^>]*>?/gm, ' ')?.trim();
  const base = stripped ? stripped : title.trim();
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
    console.log("POST_SESSION", session); // 세션 확인용 로그 추가
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    console.log("POST_BODY", body); // 요청 바디 확인용 로그 추가
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
    const authorId = parseInt(session.user.id);

    if (isNaN(authorId)) {
      console.error("INVALID_AUTHOR_ID", session.user.id);
      return NextResponse.json({ message: "유효하지 않은 사용자 ID입니다." }, { status: 400 });
    }

    // --- Logra 구독 횟수 체크 ---
    const user = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        lograSubscription: true,
        lograUsageCount: true,
        lograNextReset: true,
        level: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (user.lograSubscription === "FREE") {
      const now = new Date();
      // 초기화 날짜가 지났다면 리셋
      if (user.lograNextReset && now > user.lograNextReset) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await prisma.user.update({
          where: { id: authorId },
          data: {
            lograUsageCount: 0,
            lograNextReset: nextMonth
          }
        });
        user.lograUsageCount = 0;
      }

      if (user.lograUsageCount >= 10) {
        return NextResponse.json({ message: "이번 달 무료 포스트 생성 횟수(10회)를 모두 사용하셨습니다. 다음 달에 다시 이용해 주세요." }, { status: 403 });
      }
    }
    // --- ---------------- ---

    // 프로 에디터(레벨 31+)만 COLUMN 작성 가능
    if (postType === "COLUMN") {
      if ((user.level || 1) < 31) {
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
        authorId: authorId,
        coverImage,
        link,
        techStack,
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

    // 로그라 사용 횟수 증가 (무료 구독자만)
    if (user.lograSubscription === "FREE") {
      await prisma.user.update({
        where: { id: authorId },
        data: {
          lograUsageCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({
      message: "게시글이 등록되었습니다.",
      post: created,
    }, { status: 201 });
  } catch (e: any) {
    console.error("POST_CREATE_ERROR", e);
    return NextResponse.json({ 
      message: e.message || "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}
