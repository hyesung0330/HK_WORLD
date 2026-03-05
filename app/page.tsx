"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MessageSquare, Eye, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loading } from "@/components/ui/loading";

export default function CommunityPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [index, setIndex] = useState(0);

    const sequences = [
        { title: "THOUGHTS", sub: "COLLECTIVE", desc: "생각의 흐름이 모여 지식이 되는 공간" },
        { title: "CREATIVE", sub: "INSIGHTS", desc: "당신만의 독창적인 영감을 기록하세요" },
        { title: "CONNECT", sub: "PLATFORM", desc: "세상의 모든 가치와 소통하는 플랫폼" }
    ];

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

    useEffect(() => {
        const timer = setInterval(() => {
            if (typeof document !== 'undefined' && document.body.style.overflow === 'hidden') {
                return;
            }
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
                {/* [수정] 헤더 영역 고정
                    h-clamp 또는 명시적 높이를 주어 애니메이션 전환 시 하단 콘텐츠가 흔들리지 않게 합니다.
                */}
                <header className="relative mb-16 md:mb-28 h-[320px] md:h-[420px] flex flex-col justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-20 -left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"
                    />

                    {/* 슬라이드 컨테이너: 내부 요소가 absolute로 겹치더라도 영역을 유지함 */}
                    <div className="relative w-full h-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 flex flex-col justify-end pb-12"
                            >
                                <h1 className="text-5xl sm:text-7xl md:text-9xl font-[900] tracking-tighter leading-[0.85] mb-6 flex flex-col">
                                    <div className="overflow-hidden py-1 md:py-2">
                                        <motion.span
                                            initial={{ y: "100%" }}
                                            animate={{ y: 0 }}
                                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                            className="inline-block"
                                        >
                                            {sequences[index].title}
                                            <span className="text-indigo-500 text-[0.4em] align-top ml-2 inline-block">●</span>
                                        </motion.span>
                                    </div>

                                    <div className="overflow-hidden py-1 h-[1.1em]">
                                        <motion.span
                                            initial={{ y: "100%" }}
                                            animate={{ y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                            className={`inline-block opacity-20 ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            {sequences[index].sub}
                                        </motion.span>
                                    </div>
                                </h1>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="flex flex-col md:flex-row justify-between items-end gap-6"
                                >
                                    <p className={`max-w-md text-lg font-medium leading-relaxed break-keep ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                        {sequences[index].desc} <br/>
                                        <span className={darkMode ? 'text-white' : 'text-black'}>Textra</span>에서 당신의 생각을 공유해봐요
                                    </p>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 인디케이터: 레이아웃에 영향받지 않도록 하단 고정 */}
                    <div className="flex gap-2 mt-4 absolute -bottom-6 left-0">
                        {sequences.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-600 opacity-30'}`}
                            />
                        ))}
                    </div>
                </header>

                <nav className={`flex justify-between items-center mb-0 md:mb-12 py-4 md:py-6 transition-colors border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex gap-6 md:gap-10 text-sm md:text-base font-black">
                        <button className="relative group text-indigo-500">
                            최근 컬럼
                            <span className="absolute -bottom-6 left-0 w-full h-0.5 bg-indigo-500" />
                        </button>
                    </div>
                    <div className="text-[11px] font-bold opacity-40 uppercase tracking-tighter">
                        {loading ? "SYNCING..." : `최근 ${posts.length}개 컬럼`}
                    </div>
                </nav>

                <div className="flex flex-col gap-0 bg-transparent min-h-[400px]">
                    {loading ? (
                        <div className="py-40 flex justify-center items-center">
                            <Loading message="콘텐츠를 동기화 중입니다" />
                        </div>
                    ) : (
                        posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.7, delay: index * 0.05 }}
                                onClick={() => router.push(getPostDetailPath(post))}
                                className={`group relative py-10 px-2 border-b transition-all duration-500 cursor-pointer
                    ${darkMode ? 'border-white/5 hover:bg-white/[0.01]' : 'border-slate-100 hover:bg-slate-50/50'}`}
                            >
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
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3 group-hover:text-indigo-500 transition-colors leading-snug break-keep">
                                            {post.title}
                                        </h3>
                                        <p className={`text-[14px] md:text-[15px] leading-relaxed line-clamp-2 mb-4 md:mb-6 max-w-2xl break-keep ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                            {post.summary || "본문 요약 내용이 없습니다. 클릭하여 상세 내용을 확인해보세요."}
                                        </p>
                                    </div>

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

                                    <div className="ml-auto hidden md:block">
                                        <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    )}
                </div>

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