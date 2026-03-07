"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { LuPencilLine, LuArrowRight, LuEye, LuClock } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { Loading } from "@/components/ui/loading";

export default function ColumnsPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 8;
    const totalPages = Math.ceil(posts.length / postsPerPage);

    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts?type=TECHNICAL");
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

    const currentPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    return (
        <div className={`min-h-screen transition-all duration-700 selection:bg-indigo-500 selection:text-white
        ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#f8f9fa] text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-32">
                <div className="mb-16">
                    <BackButton />
                </div>

                {/* --- 헤더 섹션: 압도적인 타이포그래피 --- */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="relative">
                        <h2 className="text-7xl md:text-9xl font-[950] tracking-tighter leading-[0.8] uppercase">
                            COL<br/>UMNS<span className="text-indigo-600">.</span>
                        </h2>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-6">
                        <p className={`max-w-[280px] text-sm font-medium leading-relaxed md:text-right break-keep ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            생각의 단편들이 모여 깊은 통찰이 되는 공간, <span className={darkMode ? 'text-white' : 'text-black'}>Textra Columns</span>입니다.
                        </p>
                        <Button
                            onClick={() => router.push('/main/write')}
                            className="group h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 gap-3 shadow-xl shadow-indigo-500/20"
                        >
                            <LuPencilLine size={20} />
                            컬럼 쓰기
                        </Button>
                    </div>
                </header>

                {/* --- 게시글 리스트: 카드형 리스트 --- */}
                <div className="flex flex-col gap-1 border-t border-b border-current/5 min-h-[400px]">
                    {loading ? (
                        <div className="py-40 flex justify-center items-center">
                            <Loading message="콘텐츠를 불러오는 중입니다" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-40 text-center opacity-20 font-black uppercase tracking-widest">
                            등록된 게시글이 없습니다.
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {currentPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/main/content/content_comunity/${post.id}`)}
                                    className={`group relative py-10 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer border-b last:border-none transition-all duration-500
                                    ${darkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-black/5 hover:bg-black/[0.01]'}`}
                                >
                                    {/* 좌측: 메타 정보 및 타이틀 */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-[10px] opacity-30 group-hover:text-indigo-500 group-hover:opacity-100 transition-all">
                                                #{String(post.id).padStart(2, '0')}
                                            </span>
                                            <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${darkMode ? 'bg-white/5 text-zinc-400' : 'bg-black/5 text-slate-500'}`}>
                                                {post.postType}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-3xl font-bold tracking-tight group-hover:translate-x-2 transition-transform duration-500 break-keep leading-tight">
                                            {post.title}
                                        </h3>
                                    </div>

                                    {/* 우측: 작성자 정보 및 통계 */}
                                    <div className="flex items-center justify-between md:justify-end gap-10">
                                        <div className="flex flex-col md:items-end gap-1">
                                            <span className="text-xs font-black uppercase tracking-tighter">{post.author?.name || "탈퇴회원"}</span>
                                            <div className="flex items-center gap-3 opacity-30 text-[10px] font-bold">
                                                <span className="flex items-center gap-1"><LuEye size={12}/> {post.views}</span>
                                                <span className="flex items-center gap-1"><LuClock size={12}/> {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-current/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-500">
                                            <LuArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                        </div>
                                    </div>

                                    {/* 호버 시 배경 강조 효과 */}
                                    <motion.div
                                        className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/[0.02] transition-colors pointer-events-none"
                                        layoutId="hoverBg"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* --- 페이지네이션: 미니멀 스타일 --- */}
                <div className="mt-24">
                    <Pagination>
                        <PaginationContent className="gap-4">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={`h-14 w-14 rounded-full border border-current/10 hover:bg-current hover:text-white transition-all
                                    ${currentPage === 1 && 'opacity-10 pointer-events-none'}`}
                                />
                            </PaginationItem>

                            <div className="flex items-center gap-2 px-4">
                                <span className="text-sm font-black text-indigo-600">{currentPage}</span>
                                <span className="text-[10px] font-bold opacity-20">/</span>
                                <span className="text-sm font-black opacity-30">{totalPages}</span>
                            </div>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className={`h-14 w-14 rounded-full border border-current/10 hover:bg-current hover:text-white transition-all
                                    ${currentPage === totalPages && 'opacity-10 pointer-events-none'}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </main>

            <footer className="pb-20 text-center">
                <p className="text-[10px] font-black opacity-80 ">
                    Designed by Textra Studio 2026
                </p>
            </footer>
        </div>
    );
}