"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import CommentSection from "@/components/comment/CommentSection";

// --- 메인 페이지 컴포넌트 ---
export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        setMounted(true);
        if (id) {
            fetchPost();
            incrementView();
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
            } else {
                console.error("Failed to fetch post");
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

    if (!mounted) return null;

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
                <div className="animate-pulse font-black uppercase tracking-[0.3em] opacity-40">Loading Content...</div>
            </div>
        );
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
                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-10 md:mb-16">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 opacity-40 hover:opacity-100 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:-translate-x-1 transition-transform">← BACK</span>
                    </button>
                    <button className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100">SHARE</button>
                </div>

                {/* 기사 헤더 */}
                <header className="space-y-6 md:space-y-8 mb-10 md:mb-16">
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-black  rounded-md px-4 py-1 border-none shadow-none text-[10px] tracking-widest uppercase">
                        {post.postType}
                    </Badge>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight break-keep  uppercase">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10 border border-white/10 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                <AvatarImage src={post.author?.image} />
                                <AvatarFallback className="font-black  text-xs">{post.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-black  uppercase tracking-tight leading-none mb-1">{post.author?.name || "ANONYMOUS"}</span>
                                <span className="text-[10px] font-bold opacity-30 tracking-[0.2em]">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                            <span>VIEW / {post.views || 0}</span>
                            <span className="hidden md:inline">·</span>
                            <span className="hidden md:inline">LEVEL / {post.author?.level || 1}</span>
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
                <article className={`text-xl md:text-2xl leading-relaxed font-medium mb-24 whitespace-pre-wrap
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <div className="first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-blue-500 ">
                        {post.content}
                    </div>
                </article>

                {/* 인터랙션 영역 */}
                <div className={`flex flex-col items-center gap-6 py-20 border-y transition-colors mb-20
                    ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <button 
                        onClick={handleToggleLike}
                        className={`px-12 py-6 border-2 rounded-full font-black transition-all
                        ${isLiked 
                            ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                            : (darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-slate-900 hover:bg-black hover:text-white')}`}>
                        좋아요 {likeCount}
                    </button>
                </div>

                {/* 댓글 섹션 */}
                <CommentSection darkMode={darkMode} postId={id as string} />

                {/* 다음 글 유도 (작가 소개로 대체 또는 보강) */}
                <div className="mt-32">
                    <div className={`p-12 rounded-[40px] border flex flex-col items-center text-center gap-6 group cursor-pointer transition-all
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-white'}`}>
                        <span className="text-XL font-black opacity-30 uppercase tracking-[0.4em]">글쓴이</span>
                        <Avatar className="w-20 h-20 border-2 border-blue-500/20 grayscale group-hover:grayscale-0 transition-all">
                             <AvatarImage src={post.author?.image} />
                             <AvatarFallback className="font-black ">{post.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h4 className="text-3xl font-black tracking-tighter group-hover: uppercase leading-tight">
                            {post.author?.name}
                        </h4>
                        <p className="text-sm opacity-40 max-w-md font-medium leading-relaxed">
                            {post.author?.bio || "No bio yet. Follow this artist for more upcoming thoughts and deep-dives into tech and design."}
                        </p>
                        <Button variant="outline" className="rounded-full font-black  text-[10px] tracking-widest mt-4">
                            FOLLOW ARTIST
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}