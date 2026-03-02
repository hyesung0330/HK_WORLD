"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MessageSquare, Eye, Heart } from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";

export default function CommunityPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts");
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

    const sequences = [
        { title: "THOUGHTS", sub: "COLLECTIVE", desc: "생각의 흐름이 모여 지식이 되는 공간" },
        { title: "CREATIVE", sub: "INSIGHTS", desc: "당신만의 독창적인 영감을 기록하세요" },
        { title: "CONNECT", desc: "세상의 모든 가치와 소통하는 플랫폼" }
    ];

    const [index, setIndex] = useState(0);

    // 2. 5초마다 인덱스 변경 (자동 슬라이드)
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % sequences.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    const getPostDetailPath = (post: any) => {
        switch (post.postType) {
            case "TECHNICAL": return `/main/content/content_comunity/${post.id}`;
            case "COLUMN": return `/main/content/content_c/${post.id}`;
            case "PIECE": return `/main/content/content_sell/${post.id}`;
            default: return `/main/content/content_comunity/${post.id}`;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return "방금 전";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        return date.toLocaleDateString("ko-KR", { month: 'long', day: 'numeric' });
    };

    return (
        <div className={`min-h-screen transition-all duration-700 selection:bg-indigo-500 selection:text-white 
            ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}>

            <MainHeader />

            <main className="pt-24 md:pt-40 pb-20 md:pb-32 max-w-6xl mx-auto px-4 md:px-8">
                <header className="relative md:mb-24 min-h-[300px] md:min-h-[400px]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-20 -left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px]"
                    />

                    {/* AnimatePresence로 슬라이드 전환 감지 */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h1 className="relative text-5xl sm:text-7xl md:text-9xl font-[900] tracking-tighter leading-[0.85] mb-8">
                                <div className="overflow-hidden py-1 md:py-2">
                                    <motion.span
                                        initial={{ y: "110%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="inline-block"
                                    >
                                        {sequences[index].title}
                                        <span className="text-indigo-500 text-[0.4em] align-top ml-2 inline-block">●</span>
                                    </motion.span>
                                </div>

                                {sequences[index].sub && (
                                    <div className="overflow-hidden py-2">
                                        <motion.span
                                            initial={{ y: "110%" }}
                                            animate={{ y: 0 }}
                                            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                            className={`inline-block opacity-20 ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            {sequences[index].sub}
                                        </motion.span>
                                    </div>
                                )}
                            </h1>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="flex flex-col md:flex-row justify-between items-end gap-6"
                            >
                                <p className={`max-w-md text-lg font-medium leading-relaxed break-keep ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {sequences[index].desc} <br/>
                                    <span className={darkMode ? 'text-white' : 'text-black'}>Textra</span>에서 당신의 생각을 공유해봐요
                                </p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* 현재 위치 표시 (인디케이터) */}
                    <div className="flex gap-2 mt-12">
                        {sequences.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-600 opacity-30'}`}
                            />
                        ))}
                    </div>
                </header>

                {/* --- 필터 바 --- */}
                <nav className={`flex justify-between items-center mb-0 md:mb-12 py-4 md:py-6 transition-colors ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex gap-6 md:gap-10 text-sm md:text-base font-black">
                        <button className="relative group text-indigo-500">
                            최근 컬럼
                            <span className="absolute -bottom-6 left-0 w-full h-0.5 bg-indigo-500" />
                        </button>
                    </div>
                    <div className="text-[11px] font-bold opacity-40">
                        {loading ? "SYNCING..." : `최근 ${posts.length}개`}
                    </div>
                </nav>

                {/* --- 포스트 리스트: 카드 스타일 --- */}
                <div className="flex flex-col gap-0 bg-transparent">
                    {loading ? (
                        <div className="py-40 text-center animate-pulse tracking-[0.3em] font-black opacity-20">LOADING...</div>
                    ) : (
                        posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                onClick={() => router.push(getPostDetailPath(post))}
                                className={`group relative py-10 px-2 border-b transition-all duration-500 cursor-pointer
                    ${darkMode ? 'border-white/5 hover:bg-white/[0.01]' : 'border-slate-100 hover:bg-slate-50/50'}`}
                            >
                                {/* 1. 상단 영역: 작성자 정보 및 타입 */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${darkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {post.author?.name?.charAt(0) || "A"}
                                    </div>
                                    <span className="text-[12px] font-bold tracking-tight">
                        {post.author?.name || "익명"}
                    </span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] tracking-tighter uppercase ml-1
                        ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {post.postType}
                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
                                    {/* 2. 좌측 영역: 타이틀 & 요약 */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3 group-hover:text-indigo-500 transition-colors leading-snug break-keep">
                                            {post.title}
                                        </h3>
                                        <p className={`text-[14px] md:text-[15px] leading-relaxed line-clamp-2 mb-4 md:mb-6 max-w-2xl break-keep ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                            {post.summary || "본문 요약 내용이 없습니다. 클릭하여 상세 내용을 확인해보세요."}
                                        </p>
                                    </div>

                                    {/* 3. 우측 영역: 이미지 썸네일 (이미지가 있는 경우만 표시하거나 기본 이미지) */}
                                    <div className="shrink-0">
                                        <div className={`relative w-full md:w-48 h-40 md:h-32 rounded-2xl overflow-hidden border transition-transform duration-500 group-hover:scale-[1.02]
                            ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'}`}>
                                            {post.thumbnail ? (
                                                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                                    <span className="text-[10px] font-black ">NO IMAGE</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. 하단 영역: 메타 정보 및 인터랙션 */}
                                <div className="flex items-center gap-4 md:gap-6 mt-6 text-[10px] md:text-[11px] font-bold opacity-40 uppercase tracking-widest">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                            <Heart size={14} /> {post._count?.likes || 0}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare size={14} /> {post._count?.comments || 0}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye size={14} /> {post.views || 0}
                                        </div>
                                    </div>
                                    <div className="h-3 w-[1px] bg-current opacity-20" />
                                    <span>{formatDate(post.createdAt)}</span>

                                    {/* 우측 끝 화살표 - 모바일 제외 표시 */}
                                    <div className="ml-auto hidden md:block">
                                        <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    )}
                </div>

                {/* --- 푸터 섹션 --- */}
                <footer className={`mt-20 md:mt-40 pt-10 md:pt-20 border-t flex flex-col md:flex-row justify-between items-start gap-12 transition-colors
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="space-y-4">
                        <div className="text-xl md:text-2xl font-black tracking-tighter">Textra<span className="ml-2 text-[10px] font-bold opacity-30 max-w-[200px] leading-loose uppercase tracking-widest">2026</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 md:gap-20">
                        <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className="opacity-30">Open Source</span>
                            <a
                                href="https://github.com/hyesung0330/HK_WORLD"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-indigo-500 transition-colors duration-300 flex items-center gap-1"
                            >
                                Github
                            </a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}