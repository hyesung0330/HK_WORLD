"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { IoPartlySunny } from "react-icons/io5";
import { useTheme } from "@/app/context/darkmood";
import {SearchDialog} from "@/components/dialog/mainSearchDialog/page";
import ProfileSheet from "@/components/sheet/profileSheet/page";
import LoginDialog from "@/components/dialog/AuthDialog/page";
import AuthDialog from "@/components/dialog/AuthDialog/page";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { darkMode, toggleDarkMode } = useTheme();

    const tabs = [
        { value: "home", label: "홈", path: "/" },
        { value: "community", label: "컬럼보기", path: "/main/content/content_comunity" },
    ];

    const isWritePage = pathname.includes('/write');
    const activeTab = tabs.find((tab) => tab.path === pathname)?.value || "home";
    const isAuthenticated = !!session;

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b z-50 transition-colors max-h-[88px]
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left: Logo --- */}
            <div className="flex items-center gap-3 md:gap-8">
                <div className="cursor-pointer shrink-0" onClick={() => router.push('/')}>
                    <img
                        src={darkMode ? "/image/Logo/MainLogo/Textra_Logo_v1_black2.png" : "/image/Logo/MainLogo/Textra_Logo_v1.png "}
                        alt="Textra Logo"
                        className={darkMode ? "w-14 md:w-18 h-10 md:h-14" : "w-14 md:w-18 h-10 md:h-15"}
                    />
                </div>
                {/* 글쓰기 페이지가 아닐 때만 메뉴 표시 */}
                {!isWritePage && (
                    <div className="hidden lg:flex">
                        <Tabs value={activeTab} className="w-full">
                            <TabsList className="flex w-full justify-start gap-10 bg-transparent p-0 dark:border-white/5">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => router.push(tab.path)}
                                        className="
                                          relative h-8 px-0
                                          text-[15px] font-medium tracking-tight
                                          text-gray-400 transition-all duration-200

                                          /* 호버 시 텍스트만 살짝 진하게 */
                                          hover:text-gray-900 dark:hover:text-gray-200

                                          /* 활성화 상태: 텍스트를 검정(흰색)으로, 아래에 굵은 선 */
                                          data-[state=active]:text-black dark:data-[state=active]:text-white
                                          data-[state=active]:font-bold

                                          /* 활성 표시 바: 심플한 직선 */
                                          after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full
                                          after:bg-black dark:after:bg-white
                                          after:opacity-0 data-[state=active]:after:opacity-100
                                        "
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
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
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={toggleDarkMode}
                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border transition-all
                        ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                    {darkMode ? <IoPartlySunny size={18}/> : <IoPartlySunny size={18} className="text-black"/>}
                </button>

                <div className="h-4 w-[1px] bg-current opacity-10 mx-0 md:mx-1"></div>

                {isWritePage ? (
                    <button 
                        onClick={() => {
                            const publishButton = document.querySelector('button[data-publish-trigger="true"]') as HTMLButtonElement;
                            if (publishButton) publishButton.click();
                        }}
                        className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                        ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        발행하기
                    </button>
                ) : (
                    <>
                        {!isAuthenticated && (
                            <div className="scale-90 md:scale-100 origin-right">
                                <AuthDialog/>
                            </div>
                        )}
                        {isAuthenticated && (
                            <button
                                onClick={() => router.push('/main/write')}
                                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                                    ${darkMode ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
                            >
                                글쓰기
                            </button>
                        )}
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