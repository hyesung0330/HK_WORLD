"use client";

import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {Search, Loader2} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useTheme } from "@/app/context/darkmood";

export function SearchDialog({
                                 placeholder = "검색어를 입력하세요"
                             }: { placeholder?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [pageResults, setPageResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const STATIC_PAGES = [
        { id: 'p1', title: "일반 컬럼", path: "/main/content/content_comunity", description: "모든 작가들의 글을 볼 수 있어요", category: "MENU" },
        { id: 'p2', title: "전문 컬럼", path: "/main/content/content_c", description: "시니어 작가들의 깊이 있는 글을 만나보세요", category: "MENU" },
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
        if (!isOpen) {
            setQuery("");
            setResults([]);
            setPageResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                fetchResults();
                filterStaticPages();
            } else {
                setResults([]);
                setPageResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const filterStaticPages = () => {
        const lowerQuery = query.toLowerCase();
        const filtered = STATIC_PAGES.filter(page => 
            page.title.toLowerCase().includes(lowerQuery) || 
            page.description.toLowerCase().includes(lowerQuery)
        );
        setPageResults(filtered.slice(0, 3)); // 상위 3개만 표시
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.slice(0, 5)); // 상위 5개만 표시
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            setIsOpen(false);
            router.push(`/main/search?q=${encodeURIComponent(query)}`);
        }
    };

    const getPostDetailPath = (post: any) => {
        switch (post.postType) {
            case "TECHNICAL": return `/main/content/content_comunity/${post.id}`;
            case "COLUMN": return `/main/content/content_c/${post.id}`;
            case "PIECE": return `/main/content/content_sell/${post.id}`;
            default: return `/main/content/content_comunity/${post.id}`;
        }
    };

    const {darkMode} = useTheme();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTitle/>
            <DialogTrigger asChild>
                <div className="flex items-center justify-center w-full md:flex-1 md:min-w-[300px] lg:min-w-[500px]">
                    {/* 1. 모바일: 아이콘만 노출 (md 미만) */}
                    <button
                        className={`p-2 rounded-full md:hidden transition-all active:scale-95 flex items-center justify-center
                    ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <Search className="w-4.5 h-4.5" />
                    </button>

                    {/* 2. 데스크톱: 유연한 검색바 (md 이상) */}
                    <div
                        className="relative group cursor-pointer w-full hidden md:block"
                    >
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3 transition-colors
                    ${darkMode ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-slate-400 group-hover:text-slate-600'}`}
                        />

                        <div className={`w-full py-2.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border transition-all duration-300
                    ${darkMode
                            ? 'bg-white/[0.03] border-white/5 group-hover:border-white/20 text-zinc-500 group-hover:text-zinc-300'
                            : 'bg-slate-100 border-transparent group-hover:border-slate-300 text-slate-400 group-hover:text-slate-600'
                        }`}
                        >
                            <span className="truncate block">검색어를 입력하세요</span>
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[525px] top-[15%] md:top-[20%] translate-y-0 rounded-3xl p-4 md:p-6">
                <DialogHeader className="p-0 mb-4">
                    <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                        <Search className="w-4 h-4 text-muted-foreground"/>
                        <span>검색</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={`text-base md:text-lg py-5 md:py-6 shadow-sm focus-visible:ring-indigo-600 pr-12 rounded-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`}
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            </div>
                        )}
                    </div>

                    {/* 실시간 검색 결과 리스트 */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {query.trim() !== "" && loading && results.length === 0 && pageResults.length === 0 && (
                            <div className="py-20 flex justify-center items-center">
                                <Loading message="검색 결과 분석 중" />
                            </div>
                        )}

                        {query.trim() !== "" && !loading && results.length === 0 && pageResults.length === 0 && (
                            <div className="py-10 text-center opacity-40 font-bold uppercase tracking-widest text-xs">
                                검색 결과가 없습니다
                            </div>
                        )}

                        {/* 메뉴/페이지 검색 결과 */}
                        {pageResults.map((page) => (
                            <div
                                key={page.id}
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push(page.path);
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col gap-1
                                    ${darkMode ? 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' : 'bg-violet-50 border-transparent hover:bg-violet-100 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-tighter uppercase
                                        bg-violet-600 text-white`}>
                                        {page.category}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-tight">
                                        System Menu
                                    </span>
                                </div>
                                <h4 className="text-sm font-black flex items-center gap-2">
                                    {page.title}
                                    <span className="text-[10px] opacity-30 font-medium tracking-tight">바로가기</span>
                                </h4>
                                <p className="text-[11px] opacity-40 line-clamp-1 font-medium">{page.description}</p>
                            </div>
                        ))}

                        {/* 게시글 검색 결과 */}
                        {results.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push(getPostDetailPath(post));
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col gap-1
                                    ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 shadow-sm hover:shadow-md'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-tighter uppercase
                                        ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {post.postType}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-tight">
                                        {post.author?.name || "익명"}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold line-clamp-1">{post.title}</h4>
                                <p className="text-[11px] opacity-40 line-clamp-1 font-medium">{post.summary}</p>
                            </div>
                        ))}

                        {query.trim() !== "" && (results.length > 0 || pageResults.length > 0) && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push(`/main/search?q=${encodeURIComponent(query)}`);
                                }}
                                className={`w-full py-3 text-[10px] font-black uppercase tracking-widest border-t mt-2 transition-opacity hover:opacity-100 opacity-60
                                    ${darkMode ? 'border-white/5' : 'border-slate-100'}`}
                            >
                                전체 결과 보기 ({query})
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}