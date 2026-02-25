"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LuGithub, LuMail, LuTrophy, LuExternalLink, LuSettings, LuLogOut, LuUser } from "react-icons/lu";

export default function ProfileSheet() {
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const user = {
        nickname: "HWANGKING",
        email: "contact@hwangking.dev",
        level: 99,
        levelTitle: "MASTER",
        github: "github.com/hwangking",
        avatar: "https://github.com/shadcn.png"
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <LuUser className="w-8 h-8" />
                </Button>
            </SheetTrigger>

            {/* side="left"로 설정하여 왼쪽에서 나오게 함 */}
            <SheetContent
                side="right"
                className={`w-full sm:max-w-md p-0 border-r transition-colors duration-500 overflow-y-auto
                ${darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
                {/* 내부 컨텐츠 */}
                <div className="p-8 space-y-10">
                    <SheetHeader className="text-left">
                        <div className="flex items-center justify-between mb-6">
                            <Badge className="bg-blue-600 font-black italic uppercase text-[10px]">Active Now</Badge>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <LuSettings className="w-4 h-4 opacity-40 hover:opacity-100" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500">
                                    <LuLogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <Avatar className="w-20 h-20 border-2 border-blue-500 mb-4 shadow-xl">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>HK</AvatarFallback>
                        </Avatar>
                        <SheetTitle className={`text-4xl font-black tracking-tighter italic uppercase leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {user.nickname}
                        </SheetTitle>
                        <SheetDescription className="text-xs font-medium opacity-50">
                            PRO Member since 2026
                        </SheetDescription>
                    </SheetHeader>

                    {/* 벤토 그리드: 시트 폭에 맞춰 1~2열 재배치 */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* 레벨 (가로형 강조) */}
                        <Card className="bg-blue-600 border-none shadow-lg text-white overflow-hidden relative">
                            <div className="absolute -right-2 -bottom-2 opacity-10">
                                <LuTrophy size={80} />
                            </div>
                            <CardContent className="p-5 flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Rank</p>
                                    <div className="text-2xl font-black italic leading-none">LV.{user.level}</div>
                                </div>
                                <span className="text-[10px] font-black uppercase italic bg-white/20 px-2 py-0.5 rounded">
                                    {user.levelTitle}
                                </span>
                            </CardContent>
                        </Card>

                        {/* 이메일 */}
                        <Card className={`border-none shadow-sm ${darkMode ? 'bg-white/5 text-white' : 'bg-white'}`}>
                            <CardHeader className="p-5 pb-0">
                                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Email</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-1">
                                <div className="text-sm font-bold truncate">{user.email}</div>
                            </CardContent>
                        </Card>

                        {/* 깃허브 */}
                        <Card className={`border-none shadow-sm group cursor-pointer ${darkMode ? 'bg-white/5 text-white' : 'bg-white'}`}>
                            <a href={`https://${user.github}`} target="_blank" className="block p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <LuGithub className="w-4 h-4 opacity-40" />
                                    <LuExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-sm font-black tracking-tight group-hover:text-blue-500 transition-colors">
                                    {user.github}
                                </div>
                            </a>
                        </Card>

                        {/* 최근 활동 요약 */}
                        <div className="pt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 px-2">최근 활동</h4>
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${darkMode ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white shadow-sm'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold leading-tight">새로운 포스트를 작성했습니다.</p>
                                            <p className="text-[9px] opacity-40 font-medium">2시간 전</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 하단 푸터 영역 */}
                    {/*<div className={`pt-10 border-t ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>*/}
                    {/*    <Button className={`w-full font-black text-[11px] uppercase tracking-widest h-12 rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white'}`}>*/}
                    {/*        View Full Profile*/}
                    {/*    </Button>*/}
                    {/*</div>*/}
                </div>
            </SheetContent>
        </Sheet>
    );
}