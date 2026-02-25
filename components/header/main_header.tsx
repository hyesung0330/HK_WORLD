"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { IoPartlySunny } from "react-icons/io5";
import { useTheme } from "../../app/context/darkmood";
import {SearchDialog} from "@/components/dialog/mainSearchDialog/page";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { darkMode, toggleDarkMode } = useTheme();

    // 글쓰기 페이지인지 확인
    const isWritePage = pathname.includes('/write');

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-8 py-4 border-b z-50 transition-colors 
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left: Logo --- */}
            <div className="flex items-center gap-8">
                <h1 className="text-sm font-black tracking-widest uppercase cursor-pointer" onClick={() => router.push('/')}>
                    HK.WORLD
                </h1>
                {/* 글쓰기 페이지가 아닐 때만 메뉴 표시 */}
                {!isWritePage && (
                    <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                        <span className="hover:opacity-100 cursor-pointer transition">커뮤니티</span>
                        <span className="hover:opacity-100 cursor-pointer transition">홍보하기</span>
                    </div>
                )}
            </div>

            {/* --- Center: Search Bar (글쓰기 페이지에서는 숨김) --- */}
            {!isWritePage ? (
                <div className="flex-1 max-w-md mx-8 hidden md:block">
                    <div className="relative group">
                        <SearchDialog />
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex justify-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest animate-pulse">
                        작성 모드: 자동 저장 중
                    </span>
                </div>
            )}

            {/* --- Right: Actions & Profile --- */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDarkMode}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all
                        ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                    {darkMode ? <IoPartlySunny/> : <IoPartlySunny className="text-black"/>}
                </button>

                <div className="h-4 w-[1px] bg-current opacity-10 mx-1"></div>

                {isWritePage ? (
                    <button className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                        ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        발행하기
                    </button>
                ) : (
                    <>
                    <button onClick={()=> router.push('/main/auth/login')} className={`text-[10px] font-black tracking-widest hover:opacity-60 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            로그인
                        </button>
                        <button onClick={()=> router.push('/main/auth/join')} className={`text-[10px] font-black tracking-widest hover:opacity-60  ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            회원가입
                        </button>
                        <button
                            onClick={() => router.push('/main/write')}
                            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                                ${darkMode ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
                        >
                            글쓰기
                        </button>
                    </>
                )}

                <div className={`w-8 h-8 rounded-full overflow-hidden border cursor-pointer transition-transform hover:scale-105
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <img src="https://ui-avatars.com/api/?name=HwangKing&background=0D8ABC&color=fff" alt="avatar" />
                </div>
            </div>
        </nav>
    );
}