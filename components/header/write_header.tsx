"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { IoPartlySunny } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { useTheme } from "@/app/context/darkmood";
import ProfileSheet from "@/components/sheet/profileSheet/page";

export default function WriteModeHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { darkMode, toggleDarkMode } = useTheme();

    // 현재 페이지가 글쓰기 페이지인지 확인
    const isWritePage = pathname.includes('/write');

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-8 py-4 border-b z-50 transition-colors 
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left Section: Logo & Status --- */}
            <div className="flex items-center gap-6">
                <h1
                    className="text-sm font-black tracking-widest uppercase cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    HK.WRITE
                </h1>

                {isWritePage && (
                    <>
                        <div className="h-4 w-[1px] bg-current opacity-20"></div>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest animate-pulse">
                            자동 저장 완료: 오후 1:02
                        </span>
                    </>
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
            <div className="flex items-center gap-4">
                {/* 다크 모드 토글 */}
                <button
                    onClick={toggleDarkMode}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all
                        ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                    {darkMode ? <IoPartlySunny /> : <IoPartlySunny className="text-black" />}
                </button>

                <div className="h-4 w-[1px] bg-current opacity-10 mx-1"></div>

                {isWritePage ? (
                    /* 글쓰기 페이지용 버튼 */
                    <>
                        <button className="text-[11px] font-bold opacity-40 hover:opacity-100 transition uppercase tracking-widest">
                            미리보기
                        </button>
                        <button className={`px-6 py-2 text-[11px] font-bold rounded-full transition-all uppercase tracking-widest
                            ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                            글 올리기
                        </button>
                    </>
                ) : (
                    /* 메인 페이지용 버튼 */
                    <>
                        <button className={`text-[10px] font-black uppercase tracking-widest hover:opacity-60 transition
                            ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            회원가입
                        </button>
                        <button
                            onClick={() => router.push('/main/write')}
                            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                                ${darkMode
                                ? 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
                        >
                            글쓰기
                        </button>
                    </>
                )}

                <div className="flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full overflow-hidden border cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center
                        ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                        <ProfileSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}