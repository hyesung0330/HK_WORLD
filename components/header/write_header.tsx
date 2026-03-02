"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { IoPartlySunny } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { useTheme } from "@/app/context/darkmood";
import ProfileSheet from "@/components/sheet/profileSheet/page";
import { useSession } from "next-auth/react";

type WriteModeHeaderProps = {
    postData?: {
        title: string;
        content: string;
        mode: "community" | "promote" | "note";
        link?: string;
        techStack?: string;
        coverImage?: string | null;
        tags?: string[];
    };
    onPreview?: () => void;
};

export default function WriteModeHeader({ postData, onPreview }: WriteModeHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { darkMode, toggleDarkMode } = useTheme();
    const { data: session } = useSession();

    // 현재 페이지가 글쓰기 페이지인지 확인
    const isWritePage = pathname.includes('/write');

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b z-50 transition-colors 
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left Section: Logo & Status --- */}
            <div className="flex items-center gap-3 md:gap-6">
                <div className="cursor-pointer shrink-0" onClick={() => router.push('/')}>
                    <img
                        src={darkMode ? "/image/Logo/MainLogo/Textra_Logo_v1_black2.png" : "/image/Logo/MainLogo/Textra_Logo_v1.png "}
                        alt="Textra Logo"
                        className={darkMode ? "w-14 md:w-18 h-10 md:h-14" : "w-14 md:w-18 h-10 md:h-15"}
                    />
                </div>

                {isWritePage && (
                    <div className="hidden sm:flex items-center gap-3 md:gap-6">
                        <div className="h-4 w-[1px] bg-current opacity-20"></div>
                        <span className="text-[9px] md:text-[10px] font-bold opacity-40 uppercase tracking-widest animate-pulse whitespace-nowrap">
                            자동 저장 완료
                        </span>
                    </div>
                )}

                {!isWritePage && (
                    <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                        <span onClick={() => router.push('/main/content/content_comunity')} className="hover:opacity-100 cursor-pointer transition">커뮤니티</span>
                        <span onClick={() => router.push('/main/content/content_c')} className="hover:opacity-100 cursor-pointer transition">컬럼보기</span>
                        <span onClick={() => router.push('/main/content/content_sell')} className="hover:opacity-100 cursor-pointer transition">홍보하기</span>
                    </div>
                )}
            </div>

            {/* --- Center Section: Search Bar (Main Only) --- */}
            {!isWritePage && (
                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="필요한 정보를 검색해보세요"
                            className={`w-full py-2 px-10 text-[11px] font-bold rounded-full border transition-all outline-none
                                ${darkMode
                                ? 'bg-white/5 border-white/10 focus:border-white/30 text-white placeholder:text-gray-600'
                                : 'bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 text-slate-900'
                            }`}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-40">
                            <FaSearch />
                        </span>
                    </div>
                </div>
            )}

            {/* --- Right Section: Actions --- */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* 다크 모드 토글 */}
                <button
                    onClick={toggleDarkMode}
                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border transition-all
                        ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                    {darkMode ? <IoPartlySunny size={18} /> : <IoPartlySunny size={18} className="text-black" />}
                </button>

                <div className="h-4 w-[1px] bg-current opacity-10 mx-0 md:mx-1"></div>

                {isWritePage ? (
                    /* 글쓰기 페이지용 버튼 */
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onPreview}
                            className="text-[10px] md:text-[11px] font-bold opacity-40 hover:opacity-100 transition uppercase tracking-widest"
                        >
                            미리보기
                        </button>
                        <button
                            data-publish-trigger="true"
                            onClick={async () => {
                                if (!session) {
                                    alert("로그인이 필요합니다.");
                                    return;
                                }
                                if (!postData) {
                                    alert("작성 중인 글 데이터가 없습니다.");
                                    return;
                                }
                                const { title, content, mode, link, techStack, coverImage, tags } = postData;
                                if (!title?.trim() || !content?.trim()) {
                                    alert("제목과 내용을 입력해주세요.");
                                    return;
                                }
                                try {
                                    const res = await fetch("/api/posts", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ title, content, mode, link, techStack, coverImage, tags }),
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        router.push(`/main/content/content_comunity/${data.post.id}`);
                                    } else {
                                        const err = await res.json().catch(() => ({}));
                                        throw new Error(err.message || "게시글 작성에 실패했습니다.");
                                    }
                                } catch (e: any) {
                                    alert(e.message || "오류가 발생했습니다.");
                                }
                            }}
                            className={`px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-[11px] font-bold rounded-full transition-all uppercase tracking-widest shadow-lg
                            ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            {isWritePage ? "컬럼 등록" : "글 올리기"}
                        </button>
                    </div>
                ) : (
                    /* 메인 페이지용 버튼 */
                    <>
                        <button className={`hidden sm:block text-[10px] font-black uppercase tracking-widest hover:opacity-60 transition
                            ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            회원가입
                        </button>
                        <button
                            onClick={() => router.push('/main/write')}
                            className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                                ${darkMode
                                ? 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
                        >
                            글쓰기
                        </button>
                    </>
                )}

                <div className="flex items-center justify-center">
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center
                        ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                        <ProfileSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}