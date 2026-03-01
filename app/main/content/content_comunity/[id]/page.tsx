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
import { useSession } from "next-auth/react";

// --- 내부 컴포넌트: 댓글 섹션 ---
function CommentSection({ darkMode, postId }: { darkMode: boolean; postId: string }) {
    const { data: session } = useSession();
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [replyInput, setReplyInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Fetch comments error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (parentId: number | null = null) => {
        const text = parentId ? replyInput : commentInput;
        if (!text.trim()) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: text,
                    parentId,
                    isAnonymous: !session // 로그인 안되어있으면 무조건 익명, 되어있으면 원하면 익명 가능하지만 여기선 기본 실명
                }),
            });

            if (res.ok) {
                if (parentId) {
                    setReplyInput("");
                    setReplyingTo(null);
                } else {
                    setCommentInput("");
                }
                fetchComments(); // 새로고침
            }
        } catch (error) {
            console.error("Post comment error:", error);
        }
    };

    if (loading) return <div className="mt-10 opacity-40 text-xs font-black uppercase tracking-widest">Loading Comments...</div>;

    const totalCommentCount = comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0);

    return (
        <section className="mt-20 space-y-10">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span>COMMENTS</span>
                <span className="text-blue-500 font-mono text-lg">({totalCommentCount})</span>
            </h3>

            {/* 댓글 입력 */}
            <div className={`flex gap-4 p-5 rounded-[24px] border transition-all
                ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-blue-500/50' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
                <div className="flex-1 flex items-center gap-3">
                    <Input
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="LEAVE A THOUGHT..."
                        className="bg-transparent border-none focus-visible:ring-0 placeholder:text-[10px] placeholder:font-black placeholder:tracking-widest font-medium"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handlePostComment();
                            }
                        }}
                    />
                    <Button 
                        onClick={() => handlePostComment()}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] tracking-widest px-6 shadow-none text-white">
                        댓글 올리기
                    </Button>
                </div>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-12">
                {comments.map((comment) => (
                    <div key={comment.id} className="space-y-6">
                        <div className="flex gap-4 group">
                            <Avatar className="w-10 h-10 shrink-0 grayscale">
                                <AvatarImage src={comment.author?.image} />
                                <AvatarFallback>{(comment.nickname || comment.author?.name || "U")[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black italic uppercase tracking-tight">
                                            {comment.isAnonymous ? comment.nickname : (comment.author?.name || "작가")}
                                        </span>
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest leading-none">
                                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <button className="text-[9px] font-black opacity-0 group-hover:opacity-40 tracking-widest uppercase transition-opacity">MORE</button>
                                </div>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{comment.content}</p>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] pt-1 hover:line-through"
                                >
                                    [ REPLY ]
                                </button>
                            </div>
                        </div>

                        {/* 대댓글 */}
                        {comment.replies?.map((reply: any) => (
                            <div key={reply.id} className="pl-12 flex gap-4">
                                <div className="w-px h-10 bg-blue-500/20 mt-2 self-start" />
                                <div className="flex-1 space-y-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black italic text-blue-500 uppercase">
                                            {reply.isAnonymous ? reply.nickname : (reply.author?.name || "작가")}
                                        </span>
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest">
                                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{reply.content}</p>
                                </div>
                            </div>
                        ))}

                        {replyingTo === comment.id && (
                            <div className="pl-12 animate-in fade-in slide-in-from-top-2">
                                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                    <Input 
                                        autoFocus 
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder="TYPE YOUR REPLY..." 
                                        className="bg-transparent border-none focus-visible:ring-0 text-[10px] font-bold tracking-widest" 
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePostComment(comment.id);
                                            }
                                        }}
                                    />
                                    <Button 
                                        onClick={() => handlePostComment(comment.id)}
                                        size="sm" className="rounded-lg bg-zinc-800 text-[9px] font-black tracking-widest text-white shadow-none px-4">SUBMIT</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

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
                <Button onClick={() => router.back()} className="rounded-full px-8 font-black italic">GO BACK</Button>
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

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 opacity-40 hover:opacity-100 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:-translate-x-1 transition-transform">← BACK</span>
                    </button>
                    <button className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100">SHARE</button>
                </div>

                {/* 기사 헤더 */}
                <header className="space-y-8 mb-16">
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-black italic rounded-md px-4 py-1 border-none shadow-none text-[10px] tracking-widest uppercase">
                        {post.postType}
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] break-keep italic uppercase">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10 border border-white/10 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                <AvatarImage src={post.author?.image} />
                                <AvatarFallback className="font-black italic text-xs">{post.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic uppercase tracking-tight leading-none mb-1">{post.author?.name || "ANONYMOUS"}</span>
                                <span className="text-[10px] font-bold opacity-30 tracking-[0.2em]">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                            <span>VIEW / {post.views || 0}</span>
                            <span className="hidden md:inline">·</span>
                            <span className="hidden md:inline">LEVEL / {post.author?.level || 1}</span>
                        </div>
                    </div>
                </header>

                {/* 본문 기사 */}
                <article className={`text-xl md:text-2xl leading-relaxed font-medium mb-24 whitespace-pre-wrap
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <div className="first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-blue-500 italic">
                        {post.content}
                    </div>
                </article>

                {/* 인터랙션 영역 */}
                <div className={`flex flex-col items-center gap-6 py-20 border-y transition-colors mb-20
                    ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <button 
                        onClick={handleToggleLike}
                        className={`px-12 py-6 border-2 rounded-full font-black italic tracking-[0.3em] transition-all
                        ${isLiked 
                            ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                            : (darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-slate-900 hover:bg-black hover:text-white')}`}>
                        LIKE {likeCount}
                    </button>
                    <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.5em]">End of Article</span>
                </div>

                {/* 댓글 섹션 */}
                <CommentSection darkMode={darkMode} postId={id as string} />

                {/* 다음 글 유도 (작가 소개로 대체 또는 보강) */}
                <footer className="mt-32">
                    <div className={`p-12 rounded-[40px] border flex flex-col items-center text-center gap-6 group cursor-pointer transition-all
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-white'}`}>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">Written By</span>
                        <Avatar className="w-20 h-20 border-2 border-blue-500/20 grayscale group-hover:grayscale-0 transition-all">
                             <AvatarImage src={post.author?.image} />
                             <AvatarFallback className="font-black italic">{post.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h4 className="text-3xl font-black tracking-tighter group-hover:italic uppercase leading-tight">
                            {post.author?.name}
                        </h4>
                        <p className="text-sm opacity-40 max-w-md font-medium leading-relaxed">
                            {post.author?.bio || "No bio yet. Follow this artist for more upcoming thoughts and deep-dives into tech and design."}
                        </p>
                        <Button variant="outline" className="rounded-full font-black italic text-[10px] tracking-widest mt-4">
                            FOLLOW ARTIST
                        </Button>
                    </div>
                </footer>
            </main>
        </div>
    );
}