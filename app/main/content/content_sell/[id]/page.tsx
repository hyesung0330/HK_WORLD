"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentSection from "@/components/comment/CommentSection";
import { Loading } from "@/components/ui/loading";
import { BackButton } from "@/components/ui/back-button";
import { Heart, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

// --- 메인 상세 페이지 컴포넌트 ---
export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (id) {
            fetchPost();

            // 페이지 진입 시 한 번만 실행되도록 보장
            const hasIncremented = sessionStorage.getItem(`viewed_${id}`);
            if (!hasIncremented) {
                incrementView();
                sessionStorage.setItem(`viewed_${id}`, 'true');
            }

            checkLikeStatus();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data);
                setLikeCount(data._count?.likes || 0);
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);
        }
    };

    const incrementView = async () => {
        try {
            await fetch(`/api/posts/${id}/view`, { method: "PATCH" });
        } catch (error) {
            console.error("Error incrementing view:", error);
        }
    };

    const checkLikeStatus = async () => {
        try {
            const res = await fetch(`/api/posts/${id}/like`);
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.isLiked);
            }
        } catch (error) {
            console.error("Error checking like status:", error);
        }
    };

    const handleToggleLike = async () => {
        try {
            const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.isLiked);
                setLikeCount(prev => data.isLiked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleToggleFollow = async () => {
        if (!session) {
            toast.error("로그인이 필요한 기능입니다.");
            return;
        }
        if (session.user?.id === String(post.authorId)) {
            toast.error("자신은 팔로우할 수 없습니다.");
            return;
        }

        setFollowLoading(true);
        try {
            const res = await fetch(`/api/user/${post.authorId}/follow`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.isFollowing);
                toast.success(data.message);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            toast.error("팔로우 처리 중 오류가 발생했습니다.");
        } finally {
            setFollowLoading(false);
        }
    };

    if (!mounted) return null;

    if (loading) {
        return <Loading fullScreen />;
    }

    if (!post) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="opacity-40 mb-8 font-black uppercase tracking-widest">게시글을 찾을 수 없습니다.</p>
                <Button onClick={() => router.back()} className="rounded-full px-8 font-black ">GO BACK</Button>
            </div>
        );
    }

    const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).toUpperCase();

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-3xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
                <BackButton />

                {/* 포스트 헤더 */}
                <header className="space-y-6 md:space-y-8 mb-10 md:mb-16">
                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-black  rounded-md px-4 py-1 border-none shadow-none text-[10px] tracking-widest uppercase">
                        {post.postType}
                    </Badge>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight break-keep  uppercase">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span onClick={() => router.push(`/user/${post.author?.id}`)} className="text-sm font-black  uppercase tracking-tight leading-none cursor-pointer hover:underline">{post.author?.name || "익명"}</span>
                                    {post.author?.role && (
                                        <Badge variant="secondary" className="rounded-full px-2 py-0 text-[8px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {post.author.role === "JUNIOR" ? "주니어" :
                                                post.author.role === "SENIOR" ? "시니어" :
                                                    post.author.role === "PRO" ? "프로" :
                                                        post.author.role === "PROFESSIONAL" ? "전문" : "에디터"}
                                        </Badge>
                                    )}
                                    {session?.user?.id !== String(post.authorId) && (
                                        <button 
                                            onClick={handleToggleFollow}
                                            disabled={followLoading}
                                            className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all
                                                ${isFollowing 
                                                    ? 'bg-zinc-200 text-zinc-600 dark:bg-white/10 dark:text-zinc-400' 
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            {isFollowing ? '팔로잉' : '팔로우'}
                                        </button>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold opacity-30 tracking-[0.2em]">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                            VIEW / {post.views}
                        </div>
                    </div>

                    {/* 태그 리스트 */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4">
                            {post.tags.map((pt: any) => (
                                <span key={pt.tag.id} className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                                    #{pt.tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* 본문 기사 */}
                <article className={`text-xl md:text-2xl leading-relaxed font-medium mb-24
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <p className="whitespace-pre-wrap">
                        {post.content}
                    </p>
                </article>

                {/* 좋아요 버튼 섹션 */}
                <div className={`flex flex-col items-center gap-6 py-20 border-y transition-colors mb-20
                    ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <button 
                        onClick={handleToggleLike}
                        className={`px-12 py-6 border-2 rounded-full font-black  tracking-[0.3em] transition-all shadow-none flex items-center gap-3
                        ${isLiked 
                            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
                            : darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-slate-900 hover:bg-black hover:text-white'}`}>
                        <Heart className={isLiked ? "fill-current" : ""} />
                        LIKE {likeCount}
                    </button>
                </div>

                {/* 댓글 컴포넌트 호출 */}
                <CommentSection darkMode={darkMode} postId={id as string} />

                {/* 다음 콘텐츠 푸터 */}
                <footer className="mt-32">
                    <div className={`p-12 rounded-[40px] border flex flex-col items-center text-center gap-6 group cursor-pointer transition-all
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-none' : 'bg-slate-100 border-slate-200 hover:bg-white shadow-none'}`}>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">Next Thought</span>
                        <h4 className="text-3xl font-black tracking-tighter group-hover: uppercase leading-tight">
                            The Paradox of Minimalism in Frontend Dev →
                        </h4>
                    </div>
                </footer>
            </main>
        </div>
    );
}