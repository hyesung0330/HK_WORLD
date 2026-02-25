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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LuArrowLeft, LuShare2, LuHeart, LuMessageSquare, LuBookmark, LuEye } from "react-icons/lu";

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // 피드에서 클릭한 데이터 예시
    const post = {
        title: "벤토 그리드 레이아웃의 마법: 2026년 디자인 트렌드",
        category: "디자인",
        author: "Hwangking",
        date: "2026.02.25",
        image: `https://picsum.photos/seed/${id}/1200/600`,
        avatar: "https://github.com/shadcn.png",
        content: `
            최근 유행하는 벤토 그리드(Bento Grid) 레이아웃은 정보를 구획화하여 시각적으로 정돈된 느낌을 줍니다. 
            특히 모바일 대응이 쉽고, 카드 형태의 디자인이 주는 신뢰감이 높습니다.

            디자인의 핵심은 적절한 여백과 둥근 모서리(border-radius)의 일관성입니다. 
            이번 포스트에서는 실제 서비스에 적용할 때 주의해야 할 점들을 살펴보겠습니다...
        `,
        likes: 128,
        views: "1.2k",
        comments: 24
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* 상단 액션바 */}
                <div className="flex items-center justify-between mb-10">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 -ml-4 opacity-50 hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Feed
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full"><LuBookmark size={20} /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full"><LuShare2 size={20} /></Button>
                    </div>
                </div>

                {/* 제목 및 메타 정보 */}
                <header className="space-y-6 mb-12">
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-black italic px-3 py-1 rounded-md text-[11px]">
                        {post.category}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] break-keep italic uppercase">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between pt-6">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-11 h-11 border-2 border-blue-500/30">
                                <AvatarImage src={post.avatar} />
                                <AvatarFallback>HK</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic tracking-tight">{post.author}</span>
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none mt-1">{post.date}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 opacity-40 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-1.5"><LuEye size={14}/> {post.views}</span>
                            <span className="flex items-center gap-1.5"><LuMessageSquare size={13}/> {post.comments}</span>
                        </div>
                    </div>
                </header>

                {/* 대표 히어로 이미지 */}
                <div className="mb-16 rounded-[40px] overflow-hidden shadow-2xl">
                    <AspectRatio ratio={16 / 8}>
                        <img
                            src={post.image}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </AspectRatio>
                </div>

                {/* 본문 섹션 */}
                <article className={`text-lg md:text-xl leading-relaxed font-medium space-y-10 mb-20
                    ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <p className="first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-blue-500 italic">
                        {post.content}
                    </p>
                    <p>
                        본문 내용은 에디터에서 작성한 서식이 그대로 반영되도록 구성됩니다.
                        다크모드 환경에서는 텍스트의 대비를 조절하여 장시간 독서에도 피로감이 없도록 설계되었습니다.
                    </p>
                </article>

                <Separator className={`mb-12 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* 하단 반응바 (좋아요 등) */}
                <div className="flex flex-col items-center gap-8 py-10">
                    <Button
                        variant="outline"
                        className={`rounded-full h-20 px-10 gap-3 border-2 transition-all group
                        ${darkMode ? 'hover:bg-white hover:text-black border-white/10' : 'hover:bg-black hover:text-white border-slate-200'}`}
                    >
                        <LuHeart className="w-6 h-6 group-hover:scale-125 transition-transform" />
                        <span className="text-2xl font-black italic leading-none">{post.likes}</span>
                    </Button>
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Enjoyed this post?</p>
                </div>

                {/* 추천 게시글 유도 */}
                <footer className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-8 rounded-[32px] border group cursor-pointer transition-all
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-white'}`}>
                        <span className="text-[9px] font-black opacity-40 uppercase tracking-widest block mb-2">Previous Post</span>
                        <h5 className="font-bold tracking-tight group-hover:italic">인공지능과 디자인의 결합 ↗</h5>
                    </div>
                    <div className={`p-8 rounded-[32px] border group cursor-pointer transition-all text-right
                        ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-white'}`}>
                        <span className="text-[9px] font-black opacity-40 uppercase tracking-widest block mb-2">Next Post</span>
                        <h5 className="font-bold tracking-tight group-hover:italic">미니멀리즘의 역설 ↗</h5>
                    </div>
                </footer>
            </main>
        </div>
    );
}