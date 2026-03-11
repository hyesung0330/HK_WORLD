"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";

// Shadcn UI
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { LuPencilLine, LuSearch } from "react-icons/lu";
import { Loading } from "@/components/ui/loading";

// 더미 데이터 생성
export default function ColumnsPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));

    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts?type=COLUMN");
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

    // 현재 페이지에 해당하는 데이터 슬라이싱
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
        ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            {/* 공통 헤더 */}
            <MainHeader />

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                <BackButton />
                {/* 상단 섹션: 타이틀 및 글쓰기 버튼 */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase mb-4">
                            Columns
                        </h2>
                        <p className={`text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            인증된 에디터가 글을 쓰는 공간이에요
                        </p>
                    </div>

                    {/*<Button*/}
                    {/*    onClick={() => router.push('/main/write')}*/}
                    {/*    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-6 gap-2 shadow-lg shadow-indigo-500/20"*/}
                    {/*>*/}
                    {/*    <LuPencilLine size={18} />*/}
                    {/*    글쓰기*/}
                    {/*</Button>*/}
                </div>

                {/* 게시글 목록 테이블 */}
                <div className={`rounded-[32px] border overflow-hidden transition-colors min-h-[400px]
          ${darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                    {loading ? (
                        <div className="py-40 flex justify-center items-center">
                            <Loading message="전문 컬럼을 불러오고 있습니다" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-40 text-center opacity-20 font-black uppercase tracking-widest">
                            등록된 컬럼이 없습니다.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className={`${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="w-20 text-center font-black text-[10px] uppercase tracking-widest opacity-40">No.</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest opacity-40">Category</TableHead>
                                    <TableHead className="w-[50%] font-black text-[10px] uppercase tracking-widest opacity-40">Title</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest opacity-40 text-center">Author</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest opacity-40 text-center">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentPosts.map((post) => (
                                    <TableRow
                                        key={post.id}
                                        onClick={() => router.push(`/main/content/content_c/${post.id}`)}
                                        className={`cursor-pointer transition-colors border-b last:border-none
                        ${darkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}
                                    >
                                        <TableCell className="text-center font-mono text-xs opacity-40">{post.id}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-md font-bold text-[10px] border-indigo-500/30 text-indigo-500`}>
                                                {post.postType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold tracking-tight text-base py-5">
                                            {post.title}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-black  opacity-60 tracking-tighter">
                                            {post.author?.name || "익명"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-medium opacity-40">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* 페이지네이션 */}
                <div className="mt-12">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={`cursor-pointer ${currentPage === 1 && 'opacity-30 pointer-events-none'}`}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page} className="hidden md:block">
                                    <PaginationLink
                                        isActive={currentPage === page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`cursor-pointer rounded-full w-10 h-10 font-black
                      ${currentPage === page
                                            ? 'bg-indigo-600 text-white border-none'
                                            : darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className={`cursor-pointer ${currentPage === totalPages && 'opacity-30 pointer-events-none'}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </main>
        </div>
    );
}