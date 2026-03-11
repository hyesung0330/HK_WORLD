import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function buildSummary(title: string, content: string): string {
    // HTML 태그 제거 로직 추가
    const stripped = content?.replace(/<[^>]*>?/gm, ' ')?.trim();
    const base = stripped ? stripped : title.trim();
    return base.substring(0, 180);
}

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

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        bio: true,
                        level: true,
                        role: true,
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            }
        });

        if (!post) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 현재 로그인한 사용자가 작성자를 팔로우 중인지 확인
        let isFollowing = false;
        if (session?.user?.id && post.authorId) {
            const currentUserId = parseInt(session.user.id);
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: post.authorId,
                    }
                }
            });
            isFollowing = !!follow;
        }

        return NextResponse.json({ ...post, isFollowing });
    } catch (error) {
        console.error("GET_POST_DETAIL_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const { id } = await params;
        const postId = parseInt(id);
        if (isNaN(postId)) {
            return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
        }

        const body = await req.json();
        const { title, content, coverImage, tags, link, techStack } = body;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true, content: true }
        });

        if (!post) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        if (post.authorId !== parseInt(session.user.id)) {
            return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
        }

        // 업데이트 데이터 구성
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) {
            updateData.content = content;
            updateData.summary = buildSummary(title || post.title, content);
        } else if (title !== undefined) {
            // 제목만 바뀔 때도 요약본 갱신 (제목 기반일 수 있으니)
            updateData.summary = buildSummary(title, post.content);
        }
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (link !== undefined) updateData.link = link;
        if (techStack !== undefined) updateData.techStack = techStack;

        // 태그 처리
        if (tags && Array.isArray(tags)) {
            // 기존 태그 삭제 후 새로 생성
            await prisma.postTag.deleteMany({
                where: { postId }
            });

            updateData.tags = {
                create: tags.map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                }))
            };
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: updateData,
            include: {
                tags: { include: { tag: true } }
            }
        });

        return NextResponse.json({
            message: "게시글이 수정되었습니다.",
            post: updatedPost
        });
    } catch (error: any) {
        console.error("PATCH_POST_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다.", details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const { id } = await params;
        const postId = parseInt(id);
        if (isNaN(postId)) {
            return NextResponse.json({ message: "유효하지 않은 게시글 ID입니다." }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });

        if (!post) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        if (post.authorId !== parseInt(session.user.id)) {
            return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({
            message: "게시글이 삭제되었습니다."
        });
    } catch (error: any) {
        console.error("DELETE_POST_ERROR", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다.", details: error.message }, { status: 500 });
    }
}
