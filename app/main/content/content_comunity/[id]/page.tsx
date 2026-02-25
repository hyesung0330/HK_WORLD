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

// --- 내부 컴포넌트: 댓글 섹션 ---
function CommentSection({ darkMode }: { darkMode: boolean }) {
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const comments = [
        {
            id: 1,
            author: "CreativeDesigner",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
            text: "벤토 그리드 레이아웃 설명이 정말 명쾌하네요! 실무에 바로 적용해봐야겠어요.",
            date: "2H AGO",
            replies: [
                {
                    id: 101,
                    author: "Hwangking",
                    avatar: "https://github.com/shadcn.png",
                    text: "도움이 되셨다니 다행입니다! 적용하시다가 궁금한 점 있으면 언제든 물어보세요.",
                    date: "1H AGO",
                }
            ]
        },
        {
            id: 2,
            author: "DevOps_Master",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
            text: "다크모드 색상 팔레트 정보도 알 수 있을까요? 배경색이 굉장히 고급스럽네요.",
            date: "30M AGO",
            replies: []
        }
    ];

    return (
        <section className="mt-20 space-y-10">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span>COMMENTS</span>
                <span className="text-blue-500 font-mono text-lg">({comments.length})</span>
            </h3>

            {/* 댓글 입력 */}
            <div className={`flex gap-4 p-5 rounded-[24px] border transition-all
                ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-blue-500/50' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
                <div className="flex-1 flex items-center gap-3">
                    <Input
                        placeholder="LEAVE A THOUGHT..."
                        className="bg-transparent border-none focus-visible:ring-0 placeholder:text-[10px] placeholder:font-black placeholder:tracking-widest font-medium"
                    />
                    <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black italic text-[10px] tracking-widest px-6 shadow-none text-white">
                        POST
                    </Button>
                </div>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-12">
                {comments.map((comment) => (
                    <div key={comment.id} className="space-y-6">
                        <div className="flex gap-4 group">
                            <Avatar className="w-10 h-10 shrink-0 grayscale">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black italic uppercase tracking-tight">{comment.author}</span>
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest leading-none">{comment.date}</span>
                                    </div>
                                    <button className="text-[9px] font-black opacity-0 group-hover:opacity-40 tracking-widest uppercase transition-opacity">MORE</button>
                                </div>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{comment.text}</p>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] pt-1 hover:line-through"
                                >
                                    [ REPLY ]
                                </button>
                            </div>
                        </div>

                        {/* 대댓글 */}
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className="pl-12 flex gap-4">
                                <div className="w-px h-10 bg-blue-500/20 mt-2 self-start" />
                                <div className="flex-1 space-y-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black italic text-blue-500 uppercase">{reply.author}</span>
                                        <span className="text-[9px] font-bold opacity-30 tracking-widest">{reply.date}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{reply.text}</p>
                                </div>
                            </div>
                        ))}

                        {replyingTo === comment.id && (
                            <div className="pl-12 animate-in fade-in slide-in-from-top-2">
                                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                    <Input autoFocus placeholder="TYPE YOUR REPLY..." className="bg-transparent border-none focus-visible:ring-0 text-[10px] font-bold tracking-widest" />
                                    <Button size="sm" className="rounded-lg bg-zinc-800 text-[9px] font-black tracking-widest text-white shadow-none px-4">SUBMIT</Button>
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

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const post = {
        title: "2026 WEB DESIGN TRENDS: FOCUS ON BENTO GRID",
        category: "DESIGN",
        author: "Hwangking",
        date: "FEB 25, 2026",
        content: `최근 유행하는 벤토 그리드(Bento Grid) 레이아웃은 정보를 구획화하여 시각적으로 정돈된 느낌을 줍니다. 특히 모바일 대응이 쉽고, 카드 형태의 디자인이 주는 신뢰감이 높습니다. 디자인의 핵심은 적절한 여백과 둥근 모서리의 일관성입니다.`,
        views: 1240,
        likes: 42,
        avatar: "https://github.com/shadcn.png"
    };

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
                        {post.category}
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] break-keep italic uppercase">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic uppercase tracking-tight leading-none mb-1">{post.author}</span>
                                <span className="text-[10px] font-bold opacity-30 tracking-[0.2em]">{post.date}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
                            VIEW / {post.views}
                        </div>
                    </div>
                </header>

                {/* 본문 기사 */}
                <article className={`text-xl md:text-2xl leading-relaxed font-medium mb-24
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <p className="first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-blue-500 italic">
                        {post.content}
                    </p>
                </article>

                {/* 인터랙션 영역 */}
                <div className={`flex flex-col items-center gap-6 py-20 border-y transition-colors mb-20
                    ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <button className={`px-12 py-6 border-2 rounded-full font-black italic tracking-[0.3em] transition-all
                        ${darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-slate-900 hover:bg-black hover:text-white'}`}>
                        LIKE {post.likes}
                    </button>
                    <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.5em]">End of Article</span>
                </div>

                {/* 댓글 섹션 */}
                <CommentSection darkMode={darkMode} />

                {/* 다음 글 유도 */}
                <footer className="mt-32">
                    <div className={`p-12 rounded-[40px] border flex flex-col items-center text-center gap-6 group cursor-pointer transition-all
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-white'}`}>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">Next Thought</span>
                        <h4 className="text-3xl font-black tracking-tighter group-hover:italic uppercase leading-tight">
                            The Paradox of Minimalism in Frontend Dev →
                        </h4>
                    </div>
                </footer>
            </main>
        </div>
    );
}