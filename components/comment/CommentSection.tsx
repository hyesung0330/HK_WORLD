"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Loading} from "@/components/ui/loading";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Heart} from "lucide-react";
import {toast} from "sonner";

interface CommentSectionProps {
    darkMode: boolean;
    postId: string;
}

export default function CommentSection({ darkMode, postId }: CommentSectionProps) {
    const { data: session } = useSession();
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [replyInput, setReplyInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Fetch comments error response:", res.status, errorData);
                toast.error(`댓글을 불러오는데 실패했습니다: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error("Fetch comments error:", error);
            toast.error("댓글 서버 연결에 실패했습니다.");
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
                    isAnonymous: !session
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

    const handleToggleCommentLike = async (commentId: number) => {
        if (!session) {
            toast.error("로그인이 필요한 기능입니다.");
            return;
        }

        try {
            const res = await fetch(`/api/comments/${commentId}/like`, {
                method: "POST",
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => {
                    return prev.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                isLiked: data.isLiked,
                                _count: {
                                    ...comment._count,
                                    likes: data.isLiked ? (comment._count?.likes || 0) + 1 : (comment._count?.likes || 0) - 1
                                }
                            };
                        }
                        if (comment.replies) {
                            return {
                                ...comment,
                                replies: comment.replies.map((reply: any) => {
                                    if (reply.id === commentId) {
                                        return {
                                            ...reply,
                                            isLiked: data.isLiked,
                                            _count: {
                                                ...reply._count,
                                                likes: data.isLiked ? (reply._count?.likes || 0) + 1 : (reply._count?.likes || 0) - 1
                                            }
                                        };
                                    }
                                    return reply;
                                })
                            };
                        }
                        return comment;
                    });
                });
            }
        } catch (error) {
            console.error("Toggle comment like error:", error);
        }
    };

    if (loading) return (
        <div className="mt-20 flex justify-center py-10">
            <Loading message="댓글을 불러오고 있습니다" />
        </div>
    );

    const totalCommentCount = comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0);

    return (
        <section className="mt-20 space-y-10">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <span>댓글</span>
                <span className="font-mono text-lg">{totalCommentCount}</span>
            </h3>

            {/* 댓글 입력 */}
            <div className={`flex gap-4 p-5 rounded-[24px] border transition-all
                ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50' : 'bg-white border-slate-200 focus-within:border-indigo-600'}`}>
                <div className="flex-1 flex items-center gap-3">
                    <Input
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="댓글을 입력하세요"
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
                        className="rounded-xl bg-indigo-500 hover:bg-indigo-600 font-black text-[10px] tracking-widest px-6 shadow-none text-white">
                        댓글 올리기
                    </Button>
                </div>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-12">
                {comments.map((comment) => (
                    <div key={comment.id} className="space-y-6">
                        <div className="flex gap-4 group text-left">
                            <Avatar className="w-10 h-10 shrink-0 grayscale">
                                <AvatarImage src={comment.author?.image} />
                                <AvatarFallback>{(comment.nickname || comment.author?.name || "U")[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black  uppercase tracking-tight">
                                            {comment.isAnonymous ? comment.nickname : (comment.author?.name || "작가")}
                                        </span>
                                        {!comment.isAnonymous && comment.author?.role && (
                                            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[8px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {comment.author.role === "JUNIOR" ? "주니어" :
                                                    comment.author.role === "SENIOR" ? "시니어" :
                                                        comment.author.role === "PRO" ? "프로" :
                                                            comment.author.role === "PROFESSIONAL" ? "전문" : "에디터"}
                                            </Badge>
                                        )}
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest leading-none">
                                            {new Date(comment.createdAt).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <button className="text-[9px] font-black opacity-0 group-hover:opacity-40 tracking-widest uppercase transition-opacity">MORE</button>
                                </div>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{comment.content}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:line-through"
                                    >
                                        답글 달기
                                    </button>
                                    <button
                                        onClick={() => handleToggleCommentLike(comment.id)}
                                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors
                                            ${comment.isLiked ? 'text-rose-500' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <Heart size={10} className={comment.isLiked ? "fill-current" : ""} />
                                        좋아요 {comment._count?.likes || 0}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 대댓글 */}
                        {comment.replies?.map((reply: any) => (
                            <div key={reply.id} className="pl-12 flex gap-4 text-left">
                                <div className="w-px h-10 bg-indigo-500/20 mt-2 self-start" />
                                <div className="flex-1 space-y-2 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black  text-indigo-600 uppercase">
                                            {reply.isAnonymous ? reply.nickname : (reply.author?.name || "작가")}
                                        </span>
                                        {!reply.isAnonymous && reply.author?.role && (
                                            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[8px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {reply.author.role === "JUNIOR" ? "주니어" :
                                                    reply.author.role === "SENIOR" ? "시니어" :
                                                        reply.author.role === "PRO" ? "프로" :
                                                            reply.author.role === "PROFESSIONAL" ? "전문" : "에디터"}
                                            </Badge>
                                        )}
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest">
                                            {new Date(reply.createdAt).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{reply.content}</p>
                                    <button
                                        onClick={() => handleToggleCommentLike(reply.id)}
                                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors
                                            ${reply.isLiked ? 'text-rose-500' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <Heart size={10} className={reply.isLiked ? "fill-current" : ""} />
                                        좋아요 {reply._count?.likes || 0}
                                    </button>
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
                                        placeholder="입력해주세요"
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
                                        size="sm" className="rounded-lg bg-zinc-800 text-[9px] font-black tracking-widest text-white shadow-none px-4">전송</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
