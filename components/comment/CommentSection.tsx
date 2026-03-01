"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

    if (loading) return <div className="mt-10 opacity-40 text-xs font-black uppercase tracking-widest">Loading Comments...</div>;

    const totalCommentCount = comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0);

    return (
        <section className="mt-20 space-y-10">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <span>댓글</span>
                <span className="text-blue-500 font-mono text-lg">({totalCommentCount})</span>
            </h3>

            {/* 댓글 입력 */}
            <div className={`flex gap-4 p-5 rounded-[24px] border transition-all
                ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-blue-500/50' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
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
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] tracking-widest px-6 shadow-none text-white">
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
                                    답글 달기
                                </button>
                            </div>
                        </div>

                        {/* 대댓글 */}
                        {comment.replies?.map((reply: any) => (
                            <div key={reply.id} className="pl-12 flex gap-4 text-left">
                                <div className="w-px h-10 bg-blue-500/20 mt-2 self-start" />
                                <div className="flex-1 space-y-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black  text-blue-500 uppercase">
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
