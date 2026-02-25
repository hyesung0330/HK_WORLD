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
import { LuArrowLeft, LuShare2, LuMessageSquare, LuHeart } from "react-icons/lu";

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // 실제로는 API를 통해 id값으로 데이터를 가져와야 합니다.
    const post = {
        title: "2026년 웹 디자인 트렌드 정리 (Bento Grid 중심으로)",
        category: "디자인",
        author: "Hwangking",
        date: "2026. 02. 25",
        content: `
            최근 유행하는 벤토 그리드(Bento Grid) 레이아웃은 정보를 구획화하여 시각적으로 정돈된 느낌을 줍니다. 
            특히 모바일 대응이 쉽고, 카드 형태의 디자인이 주는 신뢰감이 높습니다.

            디자인의 핵심은 적절한 여백과 둥근 모서리(border-radius)의 일관성입니다. 
            이번 포스트에서는 실제 서비스에 적용할 때 주의해야 할 점들을 살펴보겠습니다...
        `,
        views: 1240,
        likes: 42,
        avatar: "https://github.com/shadcn.png"
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
                {/* 상단 액션바 */}
                <div className="flex items-center justify-between mb-12">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 -ml-4 opacity-50 hover:opacity-100 transition-all"
                    >
                        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full"><LuShare2 size={18} /></Button>
                    </div>
                </div>

                {/* 기사 헤더 섹션 */}
                <header className="space-y-8 mb-16">
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-black italic rounded-md px-3">
                        {post.category}
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] break-keep">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-blue-500/20">
                                <AvatarImage src={post.avatar} />
                                <AvatarFallback>HK</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic tracking-tight">{post.author}</span>
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{post.date}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 opacity-40 text-[10px] font-black tracking-widest uppercase">
                            <span>Views {post.views}</span>
                        </div>
                    </div>
                </header>

                <Separator className={`mb-16 ${darkMode ? 'bg-white/5' : 'bg-slate-200'}`} />

                {/* 본문 섹션 */}
                <article className={`text-lg md:text-xl leading-relaxed font-medium space-y-8 mb-20
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <p className="first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-blue-500">
                        {post.content}
                    </p>
                    {/* 추가 본문 내용이 들어갈 자리 */}
                </article>

                {/* 하단 인터랙션바 */}
                <div className={`flex items-center justify-center gap-4 py-12 border-y transition-colors
                    ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <Button variant="outline" className="rounded-full px-8 py-6 gap-2 font-black italic tracking-widest group">
                        <LuHeart className="group-hover:text-red-500 transition-colors" />
                        LIKE {post.likes}
                    </Button>
                    <Button variant="outline" className="rounded-full px-8 py-6 gap-2 font-black italic tracking-widest">
                        <LuMessageSquare />
                        COMMENTS
                    </Button>
                </div>

                {/* 하단 푸터 (이전/다음글 유도) */}
                <footer className="mt-20">
                    <div className={`p-10 rounded-[40px] border flex flex-col items-center text-center gap-4
                        ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Next Thought</span>
                        <h4 className="text-2xl font-black tracking-tighter hover:italic cursor-pointer transition-all">
                            미니멀리즘이 프론트엔드 성능에 미치는 영향 ↗
                        </h4>
                    </div>
                </footer>
            </main>
        </div>
    );
}