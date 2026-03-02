"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";

// Shadcn UI
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LuPencilLine, LuHeart, LuMessageSquare, LuEye } from "react-icons/lu";

// 더미 데이터 (이미지 포함)
const MOCK_POSTS = Array.from({ length: 40 }, (_, i) => ({
    id: 40 - i,
    title: i % 3 === 0 ? "벤토 그리드 레이아웃의 마법" : "Next.js 15와 다크모드 구현하기",
    category: ["개발", "디자인", "인공지능", "일상"][Math.floor(Math.random() * 4)],
    author: "Hwangking",
    date: "2026.02.25",
    description: "정보를 구획화하여 시각적으로 정돈된 느낌을 주는 벤토 그리드 디자인에 대해 알아봅니다.",
    image: `https://picsum.photos/seed/${i + 10}/600/400`,
    avatar: "https://github.com/shadcn.png",
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
    views: "1.2k"
}));

export default function CommunityFeedPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const TAGS = ["전체", "IT", "연애", "주식", "정부지원"] as const;
    const [selectedTag, setSelectedTag] = useState<typeof TAGS[number]>("전체");

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 12; // 4열 배수

    useEffect(() => {
        setMounted(true);
        fetchPosts(selectedTag);
    }, [selectedTag]);

    const fetchPosts = async (tag?: string) => {
        try {
            const query = new URLSearchParams({ type: "TECHNICAL" });
            if (tag && tag !== "전체") query.set("tag", tag);
            const res = await fetch(`/api/posts?${query.toString()}`);
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

    const totalPages = Math.ceil(posts.length / postsPerPage);
    const currentPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    const postTypeLabels = {
        TECHNICAL: "컬럼",
        COLUMN: "전문 칼럼",
        PIECE: "단편/에세이"
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-[1400px] mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
                {/* 헤더 섹션 */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
                            Column
                        </h2>
                        <p className={`text-sm font-bold tracking-tight ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            당신의 이야기를 들려주세요
                        </p>
                    </div>

                    {/* 태그 필터 */}
                    <div className="flex items-center gap-2">
                        {TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-colors ${
                                    selectedTag === tag
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : (darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100')
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 opacity-40 font-black uppercase tracking-widest">컬럼을 불러오고 있어요.</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 opacity-40 font-black uppercase tracking-widest">작성된 글이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentPosts.map((post) => (
                            <Card
                                key={post.id}
                                onClick={() => router.push(`/main/content/content_comunity/${post.id}`)}
                                className={`group cursor-pointer border-none overflow-hidden transition-all duration-500 hover:-translate-y-2
                                    ${darkMode ? 'bg-[#121212] hover:bg-[#181818]' : 'bg-white shadow-xl shadow-slate-200/50'}`}
                            >
                                {/* 카드 이미지 영역 */}
                                <div className="relative overflow-hidden">
                                    <AspectRatio ratio={16 / 10}>
                                        <img
                                            src={post.image || `https://picsum.photos/seed/${post.id}/600/400`}
                                            alt={post.title}
                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                        />
                                    </AspectRatio>
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-blue-600/90 backdrop-blur-md border-none font-black  text-[10px]">
                                            {postTypeLabels[post.postType as keyof typeof postTypeLabels] || post.postType}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="p-5 pb-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Avatar className="w-5 h-5 border border-white/10">
                                            <AvatarImage src={post.author?.image} />
                                            <AvatarFallback>HK</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[10px] font-black  opacity-40 uppercase tracking-tighter">
                                            {post.author?.name || "익명"}
                                        </span >
                                    </div>
                                    <h3 className="text-lg font-black leading-tight tracking-tighter group-hover:text-blue-500 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                </CardHeader>

                                <CardContent className="px-5 pb-4">
                                    <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                                        {post.summary}
                                    </p>
                                </CardContent>

                                <CardFooter className={`px-5 py-4 border-t flex items-center justify-between
                                    ${darkMode ? 'border-white/5' : 'border-slate-50'}`}>
                                    <div className="flex items-center gap-3 opacity-40">
                                        <div className="flex items-center gap-1">
                                            <LuHeart size={14} />
                                            <span className="text-[10px] font-bold">{post.likes || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <LuMessageSquare size={14} />
                                            <span className="text-[10px] font-bold">{post._count?.comments || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-20">
                                        <LuEye size={14} />
                                        <span className="text-[10px] font-bold">{post.views || 0}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 페이지네이션 */}
                <div className="mt-20">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={`cursor-pointer ${currentPage === 1 && 'opacity-20 pointer-events-none'}`}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        isActive={currentPage === p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`rounded-full w-10 h-10 font-black cursor-pointer border-none
                                            ${currentPage === p ? 'bg-gray-300 text-white' : 'hover:bg-gray-600'}`}
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={`cursor-pointer ${currentPage === totalPages && 'opacity-20 pointer-events-none'}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </main>
        </div>
    );
}