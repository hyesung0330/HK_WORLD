"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { ArrowUpRight, MessageSquare, Eye, Heart, Search } from "lucide-react";
import { motion } from "framer-motion";

function SearchResultsContent() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (query) {
            fetchSearchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Search results fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

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
                <header className="relative mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-20 -left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px]"
                    />

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 text-indigo-500 font-black uppercase tracking-[0.4em] text-xs"
                        >
                            <Search size={14} />
                            검색결과
                        </motion.div>
                        
                        <h1 className="relative text-3xl sm:text-5xl md:text-7xl font-[900] tracking-tighter leading-none mb-8">
                            &#34;{query}&#34;
                        </h1>

                        <p className={`text-lg font-medium opacity-40 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {loading ? "검색 중..." : `총 ${posts.length}개의 결과를 찾았습니다.`}
                        </p>
                    </div>
                </header>

                <div className="flex flex-col gap-0 bg-transparent">
                    {loading ? (
                        <div className="py-40 text-center animate-pulse tracking-[0.3em] font-black opacity-20 uppercase">Searching...</div>
                    ) : posts.length === 0 ? (
                        <div className="py-40 text-center space-y-6">
                            <div className="text-4xl font-black opacity-10 uppercase  tracking-widest">No Results Found</div>
                            <p className="opacity-40 font-medium">다른 검색어를 입력해보세요.</p>
                        </div>
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
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
