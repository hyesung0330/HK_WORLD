"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { LuExternalLink, LuArrowRight, LuSparkles } from "react-icons/lu";
import { Loading } from "@/components/ui/loading";

export default function PromotePage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts?type=PIECE");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Fetch posts error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    // 인덱스에 따라 카드 사이즈 결정
    const getCardSize = (index: number) => {
        const pattern = ['large', 'small', 'small', 'wide'];
        return pattern[index % pattern.length];
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <BackButton />
                {/* 상단 홍보 문구 */}
                <header className="mb-20 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-500 font-black  text-sm tracking-widest uppercase">
                        <LuSparkles /> <span>Available for new projects</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                        Showcase<br/>Your Vision
                    </h2>
                    <p className={`max-w-xl text-lg font-medium leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                        당신의 가치를 자랑하고 보여주세요<br/>
                        혁신적인 아이디어와 기술력을 세상에 알려보세요
                    </p>
                </header>

                {/* 벤토 그리드 홍보 섹션 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
                    {loading ? (
                        <div className="col-span-full py-40 flex justify-center items-center border border-dashed rounded-[40px] border-current/10">
                            <Loading message="홍보 게시글을 불러오고 있습니다" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="col-span-full py-40 text-center opacity-20 font-black uppercase tracking-widest border border-dashed rounded-[40px] border-current/10">
                            등록된 게시글이 없습니다.
                        </div>
                    ) : (
                        posts.map((post, index) => {
                            const size = getCardSize(index);
                            return (
                                <div
                                    key={post.id}
                                    onClick={() => router.push(`/main/content/content_sell/${post.id}`)}
                                    className={`group relative rounded-[40px] overflow-hidden border cursor-pointer transition-all duration-700
                                        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                        ${size === 'wide' ? 'md:col-span-2 md:row-span-1' : ''}
                                        ${size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
                                        ${darkMode ? 'bg-[#121212] border-white/5 shadow-2xl shadow-black' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
                                >
                                    {/* 배경 이미지 */}
                                    <img
                                        src={post.coverImage || `https://picsum.photos/seed/${post.id}/800/800`}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0"
                                    />

                                    {/* 컨텐츠 오버레이 */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                        <div className="flex justify-between items-start">
                                            <Badge className="bg-white/10 backdrop-blur-md text-white border-none font-black  text-[10px]">
                                                {post.postType}
                                            </Badge>
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <LuExternalLink className="text-white" />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`font-black tracking-tighter leading-tight  uppercase group-hover:text-indigo-500 transition-colors
                                                ${size === 'large' ? 'text-5xl mb-4' : 'text-2xl mb-2'}`}>
                                                {post.title}
                                            </h3>
                                            <p className={`font-bold opacity-0 group-hover:opacity-60 transition-all transform translate-y-4 group-hover:translate-y-0
                                                ${size === 'large' ? 'text-lg line-clamp-2' : 'text-xs line-clamp-1'}`}>
                                                {post.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 하단 그라데이션 */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60`} />
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}