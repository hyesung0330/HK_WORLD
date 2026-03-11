"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import {ArrowUpRight, Eye, Heart, MessageSquare, Search} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

function SearchResultsContent() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [posts, setPosts] = useState<any[]>([]);
    const [pageResults, setPageResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const STATIC_PAGES = [
        { id: 'p1', title: "일반 컬럼", path: "/main/content/content_c", description: "다른 작가들과 소통하고 정보를 나누는 공간", category: "MENU" },
        // { id: 'p2', title: "전문 컬럼", path: "/main/content/content_c", description: "시니어 작가들의 깊이 있는 글을 만나보세요", category: "MENU" },
        { id: 'p3', title: "홍보하기", path: "/main/content/content_sell", description: "자신의 작품이나 서비스를 홍보해보세요", category: "MENU" },
        { id: 'p4', title: "로그라 (Logra)", path: "/main/Logra", description: "AI Life Stylist - 일상을 특별하게 기록하세요", category: "SERVICE" },
        { id: 'p5', title: "코더라 (Codera)", path: "/main/codera", description: "개발자를 위한 AI 도우미", category: "SERVICE" },
        { id: 'p6', title: "가이드", path: "/main/guide", description: "Textra 사용법 및 정책 안내", category: "INFO" },
        { id: 'p7', title: "출석체크", path: "/main/attendance", description: "매일 출석하고 XP를 받으세요", category: "ACTION" },
        { id: 'p8', title: "게임", path: "/main/game", description: "Textra 미니 게임을 즐겨보세요", category: "FUN" },
        { id: 'p9', title: "랭킹", path: "/main/ranking", description: "실시간 작가 및 게시글 순위", category: "INFO" },
        { id: 'p10', title: "글쓰기", path: "/main/write", description: "새로운 이야기를 시작해보세요", category: "ACTION" },
        { id: 'p11', title: "정산하기", path: "/main/settlement", description: "작가 활동 수익을 정산받으세요", category: "ACTION" },
    ];

    useEffect(() => {
        setMounted(true);
        if (query) {
            fetchSearchResults();
            filterStaticPages();
        } else {
            setLoading(false);
        }
    }, [query]);

    const filterStaticPages = () => {
        const lowerQuery = query.toLowerCase();
        const filtered = STATIC_PAGES.filter(page => 
            page.title.toLowerCase().includes(lowerQuery) || 
            page.description.toLowerCase().includes(lowerQuery)
        );
        setPageResults(filtered);
    };

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
                <BackButton />
                <header className="relative mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute -top-20 -left-10 w-64 h-64 ${darkMode ? 'bg-white/5' : 'bg-black/5'} rounded-full blur-[120px]`}
                    />

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-4 ${darkMode ? 'text-white' : 'text-zinc-900'} font-black uppercase tracking-[0.4em] text-xs`}
                        >
                            <Search size={14} />
                            검색결과
                        </motion.div>
                        
                        <h1 className="relative text-3xl sm:text-5xl md:text-7xl font-[900] tracking-tighter leading-none mb-8">
                            &#34;{query}&#34;
                        </h1>

                        <p className={`text-lg font-medium opacity-40 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {loading ? "검색 중..." : `총 ${posts.length + pageResults.length}개의 결과를 찾았습니다.`}
                        </p>
                    </div>
                </header>

                <div className="flex flex-col gap-0 bg-transparent">
                    {loading ? (
                        <div className="py-40 flex justify-center items-center">
                            <Loading message="검색 결과를 가져오고 있습니다" />
                        </div>
                    ) : (posts.length === 0 && pageResults.length === 0) ? (
                        <div className="py-40 text-center space-y-6">
                            <div className="text-3xl font-black opacity-10 uppercase  tracking-widest">검색 결과가 없어요</div>
                            <p className="opacity-40 font-medium">다른 검색어를 입력해보세요.</p>
                        </div>
                    ) : (
                        <>
                            {/* 메뉴/페이지 검색 결과 섹션 */}
                            {pageResults.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6 opacity-40">
                                        <div className="h-[1px] flex-1 bg-current"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Menu & Pages</span>
                                        <div className="h-[1px] flex-1 bg-current"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pageResults.map((page, index) => (
                                            <motion.div
                                                key={page.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                onClick={() => router.push(page.path)}
                                                className={`p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 flex flex-col gap-3 group
                                                    ${darkMode 
                                                        ? 'bg-violet-500/5 border-violet-500/10 hover:bg-violet-500/10 hover:border-violet-500/30' 
                                                        : 'bg-violet-50 border-violet-100 hover:bg-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase
                                                        bg-violet-600 text-white`}>
                                                        {page.category}
                                                    </span>
                                                    <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-violet-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black mb-1 group-hover:text-violet-500 transition-colors">{page.title}</h3>
                                                    <p className="text-sm opacity-50 font-medium break-keep">{page.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 게시글 검색 결과 섹션 */}
                            {posts.length > 0 && (
                                <div>
                                    {pageResults.length > 0 && (
                                        <div className="flex items-center gap-3 mb-10 opacity-40">
                                            <div className="h-[1px] flex-1 bg-current"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Posts</span>
                                            <div className="h-[1px] flex-1 bg-current"></div>
                                        </div>
                                    )}
                                    {posts.map((post, index) => (
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
                                                    ${darkMode ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                                                    {post.postType === "TECHNICAL" ? "일반 컬럼" :
                                                        post.postType === "COLUMN" ? "전문 컬럼" :
                                                            post.postType === "PIECE" ? "홍보하기" : post.postType}
                                                </span>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3 group-hover:opacity-70 transition-colors leading-snug break-keep">
                                                        {post.title}
                                                    </h3>
                                                    <p className={`text-[14px] md:text-[15px] leading-relaxed line-clamp-2 mb-4 md:mb-6 max-w-2xl break-keep ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                                        {post.summary || "본문 요약 내용이 없습니다. 클릭하여 상세 내용을 확인해보세요."}
                                                    </p>
                                                </div>

                                                {post.coverImage && (
                                                    <div className="shrink-0">
                                                        <div className={`relative w-full md:w-48 h-40 md:h-32 rounded-2xl overflow-hidden border transition-transform duration-500 group-hover:scale-[1.02]
                                                        ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'}`}>
                                                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 md:gap-6 mt-6 text-[10px] md:text-[11px] font-bold opacity-40 uppercase tracking-widest">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
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
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Loading fullScreen message="검색 페이지를 준비 중입니다" />}>
            <SearchResultsContent />
        </Suspense>
    );
}
