"use client";

import React from "react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function JoinPage() {
    const { darkMode } = useTheme();
    const router = useRouter();

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
            darkMode ? "bg-[#0a0a0a] text-white" : "bg-slate-50 text-slate-900"
        }`}>
            <MainHeader />

            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
                <Card className={`w-full max-w-[400px] rounded-2xl shadow-2xl transition-all duration-500 border-none ${
                    darkMode
                        ? "bg-[#121212] text-white shadow-black/40"
                        : "bg-white text-slate-900 shadow-slate-200/60"
                }`}>
                    <CardHeader className="space-y-1 pt-8 px-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-black tracking-tight uppercase">
                                Join
                            </CardTitle>
                            <button
                                onClick={() => router.push('/main/auth/login')}
                                className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
                                    darkMode ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                                }`}>
                                이미 회원이신가요?
                            </button>
                        </div>
                        <CardDescription className={`text-[11px] font-medium tracking-tight ${
                            darkMode ? "text-zinc-600" : "text-slate-400"
                        }`}>
                            새로운 계정을 생성하고 커뮤니티에 참여하세요.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 px-8 py-6">
                        {/* 이메일 입력 섹션 */}

                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                                닉네임
                            </Label>
                            <Input
                                id="confirm-password"
                                type="text"
                                placeholder="닉네임을 입력하세요"
                                className={`h-12 rounded-xl border-none transition-all ${
                                    darkMode
                                        ? "bg-[#1c1c1c] focus-visible:ring-1 focus-visible:ring-white/20 text-white"
                                        : "bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300 text-slate-900"
                                }`}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                                GitHub
                            </Label>
                            <Input
                                id="confirm-password"
                                type="url"
                                placeholder="github.com(선택)"
                                className={`h-12 rounded-xl border-none transition-all ${
                                    darkMode
                                        ? "bg-[#1c1c1c] focus-visible:ring-1 focus-visible:ring-white/20 text-white"
                                        : "bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300 text-slate-900"
                                }`}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                                이메일
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className={`h-12 rounded-xl border-none transition-all placeholder:text-zinc-700 ${
                                    darkMode
                                        ? "bg-[#1c1c1c] focus-visible:ring-1 focus-visible:ring-white/20 text-white"
                                        : "bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300 text-slate-900"
                                }`}
                            />
                        </div>

                        {/* 비밀번호 입력 섹션 */}
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                                비밀번호
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className={`h-12 rounded-xl border-none transition-all ${
                                    darkMode
                                        ? "bg-[#1c1c1c] focus-visible:ring-1 focus-visible:ring-white/20 text-white"
                                        : "bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300 text-slate-900"
                                }`}
                            />
                        </div>

                        {/* 비밀번호 확인 섹션 */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                                비밀번호 확인
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                                className={`h-12 rounded-xl border-none transition-all ${
                                    darkMode
                                        ? "bg-[#1c1c1c] focus-visible:ring-1 focus-visible:ring-white/20 text-white"
                                        : "bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300 text-slate-900"
                                }`}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-8 pb-10 pt-2">
                        {/* 회원가입 버튼 */}
                        <Button className={`w-full font-semibold text-base uppercase h-12 rounded-xl transition-all ${
                            darkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-black text-white hover:bg-zinc-800"
                        }`}>
                            회원가입
                        </Button>

                        <p className={`text-[9px] text-center mt-2 font-medium opacity-40 leading-relaxed`}>
                            가입 시 이용약관 및 개인정보 처리방침에<br/>동의하는 것으로 간주됩니다.
                        </p>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}