"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut, Menu, Sun, Moon, Pencil, Home, Award, FileText, CalendarCheck, Gamepad2, Trophy, Sparkles } from "lucide-react"; // Sparkles 아이콘 추가
import { useTheme } from "@/app/context/darkmood";
import { SearchDialog } from "@/components/dialog/mainSearchDialog/page";
import ProfileSheet from "@/components/sheet/profileSheet/page";
import NotificationBell from "@/components/notification/NotificationBell";
import AuthDialog from "@/components/dialog/AuthDialog/page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "next-auth/react";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { darkMode, toggleDarkMode } = useTheme();

    const tabs = [
        { value: "home", label: "홈", path: "/", icon: Home },
        { value: "community", label: "컬럼보기", path: "/main/content/content_comunity", icon: FileText },
        { value: "guide", label: "가이드", path: "/main/guide", icon: Award },
        { value: "attendance", label: "출석체크", path: "/main/attendance", icon: CalendarCheck },
        { value: "game", label: "게임", path: "/main/game", icon: Gamepad2 },
        { value: "ranking", label: "랭킹", path: "/main/ranking", icon: Trophy },
        { value: "Codera", label: "Codera", path: "/main/codera", icon: Sparkles, isSpecial: true }, // 경로 수정 및 특별 속성 추가
        { value: "Logra", label: "Logra", path: "/main/Logra", icon: Sparkles, isSpecial: true }, // 경로 수정 및 특별 속성 추가
    ];

    const isWritePage = pathname.includes('/write');
    const activeTab = tabs.find((tab) => tab.path === pathname)?.value || "home";
    const isAuthenticated = !!session;

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b z-50 transition-colors
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10 text-white' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left: Logo & Desktop Tabs --- */}
            <div className="flex items-center gap-8 z-1000">
                <div className="cursor-pointer z-1000" onClick={() => router.push('/')}>
                    <span className={"font-semibold"}>Textra</span>
                </div>

                {!isWritePage && (
                    <div className="hidden md:flex">
                        <Tabs value={activeTab}>
                            <TabsList className="bg-transparent gap-8 font-bold">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => router.push(tab.path)}
                                        className={`relative ${tab.isSpecial ? 'text-indigo-500 dark:text-indigo-400' : ''}`}
                                    >
                                        {tab.label}
                                        {/* Codera 전용 하단 강조 라인 또는 포인트 */}
                                        {tab.isSpecial && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                            </span>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* --- Right Actions --- */}
            <div className="flex items-center gap-2 md:gap-4">
                <SearchDialog />
                <div className="md:hidden">
                    {isAuthenticated && <NotificationBell />}
                </div>

                {!isWritePage && (
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all">
                                    <Menu size={28} />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className={`${darkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white'} w-[300px] p-0 flex flex-col`}>

                                <div className={`p-8 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    {isAuthenticated ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                <ProfileSheet />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-lg truncate">{session.user?.name || "사용자"}</span>
                                                <span className="text-xs opacity-50 truncate">{session.user?.email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm opacity-60">로그인이 필요합니다.</p>
                                            <div className="w-full origin-left scale-110">
                                                <AuthDialog />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col py-4 flex-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.value}
                                            onClick={() => router.push(tab.path)}
                                            className={`flex items-center gap-4 px-8 py-5 text-[16px] font-semibold transition-colors relative
                                                ${pathname === tab.path
                                                ? 'bg-indigo-500/10 text-indigo-500'
                                                : tab.isSpecial
                                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5' // Codera는 기본적으로 배경색 살짝 추가
                                                    : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            <tab.icon size={22} className={tab.isSpecial ? "animate-pulse" : ""} />
                                            {tab.label}
                                            {tab.isSpecial && (
                                                <span className="ml-auto bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">New</span>
                                            )}
                                        </button>
                                    ))}

                                    <div className={`h-[1px] my-2 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`} />

                                    <button onClick={toggleDarkMode} className="flex items-center gap-4 px-8 py-5 text-[16px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5">
                                        {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                                        {darkMode ? "Light Mode" : "Dark Mode"}
                                    </button>

                                    {isAuthenticated && (
                                        <button onClick={() => router.push('/main/write')} className="flex items-center gap-4 px-8 py-5 text-[16px] font-bold  hover:bg-indigo-500/5">
                                            <Pencil size={22} />
                                            글쓰기
                                        </button>
                                    )}
                                </div>

                                {isAuthenticated && (
                                    <div className="p-6 mt-auto border-t dark:border-white/5">
                                        <button
                                            onClick={() => signOut()}
                                            className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity"
                                        >
                                            <LogOut size={18} />
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated && <NotificationBell />}
                    <button onClick={toggleDarkMode} className="p-2 rounded-full border border-slate-200 dark:border-white/10">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {isAuthenticated ? (
                        <button onClick={() => router.push('/main/write')} className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                            글쓰기
                        </button>
                    ) : (
                        <AuthDialog />
                    )}
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border overflow-hidden">
                        <ProfileSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}