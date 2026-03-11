"use client";

import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Home, FileText, Award, CalendarCheck, Gamepad2, Trophy,
    Sparkles, Menu, Sun, Moon, Pencil, LogOut
} from "lucide-react";
import { useTheme } from "@/app/context/darkmood";
import { SearchDialog } from "@/components/dialog/mainSearchDialog/page";
import ProfileSheet from "@/components/sheet/profileSheet/page";
import NotificationBell from "@/components/notification/NotificationBell";
import AuthDialog from "@/components/dialog/AuthDialog/page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { darkMode, toggleDarkMode } = useTheme();

    const tabs = [
        { value: "home", label: "홈", path: "/", icon: Home },
        { value: "community", label: "컬럼", path: "/main/content/content_comunity", icon: FileText },
        { value: "community", label: "전문 컬럼", path: "/main/content/content_c", icon: FileText },
        { value: "guide", label: "가이드", path: "/main/guide", icon: Award },
        { value: "attendance", label: "출석체크", path: "/main/attendance", icon: CalendarCheck },
        { value: "game", label: "게임", path: "/main/game", icon: Gamepad2 },
        { value: "ranking", label: "랭킹", path: "/main/ranking", icon: Trophy },
        {
            value: "Codera", label: "Codera", path: "/main/codera", icon: Sparkles,
            theme: "indigo" // 코데라는 인디고
        },
        {
            value: "Logra", label: "Logra", path: "/main/Logra", icon: Sparkles,
            theme: "violet" // 로그라는 보라색
        },
    ];

    const isWritePage = pathname.includes('/write');
    const activeTab = tabs.find((tab) => tab.path === pathname)?.value || "home";
    const isAuthenticated = !!session;

    const writePath = (session?.user as any)?.lograSubscription && (session?.user as any)?.lograSubscription !== "NONE"
        ? '/main/write/logra/logra_free'
        : '/main/write';

    return (
        <nav className={`fixed top-0 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b z-50 transition-colors
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10 text-white' : 'bg-white/80 border-slate-200'} backdrop-blur-xl`}>

            {/* --- Left: Logo & Desktop Tabs --- */}
            <div className="flex items-center gap-8">
                <div className="cursor-pointer font-semibold tracking-tighter text-xl" onClick={() => router.push('/')}>
                    <span>Textra</span>
                </div>

                {!isWritePage && (
                    <div className="hidden md:flex">
                        <Tabs value={activeTab}>
                            <TabsList className="bg-transparent gap-6 font-bold">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => router.push(tab.path)}
                                        className={`relative px-2 transition-all hover:opacity-100 
                                            ${tab.theme === 'violet' ? 'text-violet-600 dark:text-violet-400 font-black' :
                                            tab.theme === 'indigo' ? 'text-indigo-500 dark:text-indigo-400 font-black' : 'opacity-60'}`}
                                    >
                                        {tab.label}
                                        {/* 테마별 강조 포인트 */}
                                        {tab.theme && (
                                            <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tab.theme === 'violet' ? 'bg-violet-400' : 'bg-indigo-400'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${tab.theme === 'violet' ? 'bg-violet-600' : 'bg-indigo-500'}`}></span>
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
                            <SheetContent side="right" className={`${darkMode ? 'bg-[#0a0a0b] border-white/10' : 'bg-white'} w-[300px] p-0 flex flex-col`}>

                                <div className={`p-8 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    {isAuthenticated ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                                                <ProfileSheet />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-lg truncate tracking-tight">{session.user?.name}</span>
                                                <span className="text-[10px] uppercase font-bold opacity-30 truncate">사용자 정보</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm font-bold opacity-40">Create with Textra</p>
                                            <div className="w-full origin-left scale-110">
                                                <AuthDialog />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col py-4 flex-1 overflow-y-auto custom-scrollbar">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.value}
                                            onClick={() => router.push(tab.path)}
                                            className={`flex items-center gap-4 px-8 py-5 text-[15px] font-black transition-all relative
                                                ${pathname === tab.path
                                                ? (tab.theme === 'violet' ? 'bg-violet-500/10 text-violet-600' :
                                                    tab.theme === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' :
                                                        'bg-slate-100 dark:bg-white/5')
                                                : tab.theme === 'violet' ? 'text-violet-500 bg-violet-500/5' :
                                                    tab.theme === 'indigo' ? 'text-indigo-500 bg-indigo-500/5' :
                                                        'hover:bg-slate-50 dark:hover:bg-white/5 opacity-70'}`}
                                        >
                                            <tab.icon size={20} className={tab.theme ? "animate-pulse" : ""} />
                                            <span className="tracking-tight">{tab.label}</span>
                                            {tab.theme && (
                                                <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase text-white ${tab.theme === 'violet' ? 'bg-violet-600' : 'bg-indigo-500'}`}>
                                                    AI
                                                </span>
                                            )}
                                        </button>
                                    ))}

                                    <div className={`h-[1px] my-4 mx-8 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`} />

                                    <button onClick={toggleDarkMode} className="flex items-center gap-4 px-8 py-4 text-[14px] font-bold opacity-60 hover:opacity-100">
                                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                        {darkMode ? "Light Mode" : "Dark Mode"}
                                    </button>

                                    {isAuthenticated && (
                                        <button onClick={() => router.push(writePath)} className="flex items-center gap-4 px-8 py-4 text-[14px] font-bold opacity-60 hover:opacity-100 text-emerald-600">
                                            <Pencil size={20} />
                                            새 글 작성하기
                                        </button>
                                    )}
                                </div>

                                {isAuthenticated && (
                                    <div className="p-8 border-t dark:border-white/5 bg-inherit">
                                        <button
                                            onClick={() => signOut()}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase opacity-30 hover:opacity-100 transition-all hover:text-rose-500"
                                        >
                                            <LogOut size={16} />
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
                    <button onClick={toggleDarkMode} className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {isAuthenticated ? (
                        <button onClick={() => router.push(writePath)} className="px-6 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-black rounded-xl text-[10px] font-[1000] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg">
                            글 쓰기
                        </button>
                    ) : (
                        <AuthDialog />
                    )}
                    <div className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <ProfileSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}