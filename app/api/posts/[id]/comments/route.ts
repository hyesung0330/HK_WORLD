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

    const session = await auth();
    const currentUserIdString = session?.user?.id;
    const currentUserId = currentUserIdString ? parseInt(currentUserIdString) : null;

    console.log("Fetching comments for postId:", postId, "currentUserId:", currentUserId, "currentUserIdString:", currentUserIdString);

    if (currentUserIdString && isNaN(currentUserId as number)) {
      console.error("Invalid session user id:", currentUserIdString);
      return NextResponse.json({ message: "유효하지 않은 사용자 세션입니다." }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        } : undefined,
        replies: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
                role: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
            likes: currentUserId ? {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            } : undefined,
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

    // 가공: 유저가 좋아요를 눌렀는지 여부 추가
    const formattedComments = (comments || []).map(comment => {
      const isLiked = Array.isArray(comment.likes) && comment.likes.length > 0;
      return {
        ...comment,
        isLiked: isLiked,
        likes: undefined, // 원본 likes 데이터는 제거 (보안/효율)
        replies: (comment.replies || []).map(reply => {
          const isReplyLiked = Array.isArray(reply.likes) && reply.likes.length > 0;
          return {
            ...reply,
            isLiked: isReplyLiked,
            likes: undefined,
          };
        })
      };
    });

    // 최상위 댓글만 필터링 (parentId가 없는 것)
    const rootComments = formattedComments.filter(c => !c.parentId);

    return NextResponse.json(rootComments);
  } catch (error: any) {
    console.error("GET_COMMENTS_ERROR", error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      details: error.message,
      code: error.code
    }, { status: 500 });
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

    // 1. 기본 데이터 객체 생성 (Prisma의 관계 기반 연결 사용)
    const createData: any = {
      content,
      post: { connect: { id: postId } },
      isAnonymous: !!isAnonymous,
    };

    // 2. 부모 댓글(대댓글) 처리
    if (parentId) {
      const pId = parseInt(parentId);
      if (!isNaN(pId)) {
        createData.parent = { connect: { id: pId } };
      }
    }

    // 3. 작성자 및 닉네임 처리
    if (session?.user?.id) {
      const uId = parseInt(session.user.id);
      if (!isNaN(uId)) {
        // 익명이 아닐 때만 author 연결
        if (!isAnonymous) {
          createData.author = { connect: { id: uId } };
        } else {
          // 로그인 했어도 익명 체크했다면 authorId는 null, 랜덤 닉네임 부여
          createData.nickname = generateRandomNickname();
        }
      }
    } else {
      // 비로그인 사용자는 무조건 익명
      createData.isAnonymous = true;
      createData.nickname = generateRandomNickname();
    }

    // 4. 댓글 생성
    const newComment = await prisma.comment.create({
      data: createData,
      include: {
        author: {
          select: { name: true, image: true, role: true },
        },
      },
    });

    // 5. 알림 생성 (실패해도 댓글 생성은 유지되도록 별도 try-catch)
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });

      const senderId = session?.user?.id ? parseInt(session.user.id) : null;

      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parseInt(parentId) },
          select: { authorId: true }
        });
        // 본인이 본인 댓글에 대댓글 단 게 아닐 때만 알림
        if (parentComment?.authorId && parentComment.authorId !== senderId) {
          await prisma.notification.create({
            data: {
              userId: parentComment.authorId, // 수신자
              senderId: senderId,             // 발신자 (null 가능)
              postId: postId,                 // 관련 게시글
              type: 'COMMENT',
              isRead: false
            }
          });
        }
      } else {
        // 일반 댓글: 게시글 작성자에게 알림
        if (post && post.authorId !== senderId) {
          await prisma.notification.create({
            data: {
              userId: post.authorId,
              senderId: senderId,
              postId: postId,
              type: 'COMMENT',
              isRead: false
            }
          });
        }
      }
    } catch (notifyError) {
      console.error("NOTIFICATION_SILENT_ERROR:", notifyError);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.error("POST_COMMENT_ERROR_CRITICAL:", error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      debug: error.message
    }, { status: 500 });
  }
}
