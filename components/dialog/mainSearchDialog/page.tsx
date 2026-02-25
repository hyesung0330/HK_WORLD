"use client";

import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {FaSearch} from "react-icons/fa";
import {useTheme} from "@/app/context/darkmood";

interface SearchDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchDialog({
                                 isOpen,
                                 onOpenChange,
                                 onSearch,
                                 placeholder = "검색어를 입력하세요..."
                             }: SearchDialogProps) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!isOpen) setQuery("");
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(query);
            // 검색 후 닫고 싶다면 여기서 onOpenChange(false) 호출
        }
    };

    const {darkMode} = useTheme();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger>
                <div className="flex items-center justify-end flex-1 w-full min-w-[300px] lg:min-w-[500px] ml-auto">
                    {/* 1. 모바일: 아이콘만 노출 (md 미만) */}
                    <button
                        className={`p-2 rounded-full md:hidden transition-colors
                    ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <FaSearch className="w-4 h-4" />
                    </button>

                    {/* 2. 데스크톱: 유연한 검색바 (md 이상) */}
                    <div
                        className="relative group cursor-pointer w-full hidden md:block"
                    >
                        <FaSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3 transition-colors
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
            <DialogContent className="sm:max-w-[525px] top-[20%] translate-y-0">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground"/>
                        <span>Search</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="text-lg py-6 shadow-sm focus-visible:ring-primary"
                        autoFocus
                    />
                </div>

                {/* 여기에 실시간 검색 결과 리스트를 추가할 수 있습니다 */}
                {query && (
                    <div className="text-sm text-muted-foreground px-1">
                        "{query}"에 대한 검색 결과
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}