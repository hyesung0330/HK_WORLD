"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/context/darkmood";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import GoogleLoginButton from "@/components/button/google_login_button/page";
import KaKaoLoginButton from "@/components/button/kakao_login_button/page";

export default function AuthDialog() {
    const { darkMode } = useTheme();
    const [isLoginView, setIsLoginView] = useState(true); // 로그인/회원가입 전환 상태
    const [showEmailForm, setShowEmailForm] = useState(false); // 이메일 가입 폼 표시 상태

    // 상태 전환 시 폼 노출 여부 초기화
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setShowEmailForm(false);
    };

    return (
        <Dialog onOpenChange={(open) => !open && setShowEmailForm(false)}>
            <DialogTrigger asChild>
                <Button variant="ghost">시작하기</Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-[420px] p-0 border-none overflow-hidden ${darkMode ? "bg-[#0a0a0a]" : "bg-slate-50"}`}>

                <Card className={`w-full border-none shadow-none transition-all duration-500 ${
                    darkMode ? "bg-[#121212] text-white" : "bg-white text-slate-900"
                }`}>
                    <CardContent className="grid gap-5 px-8 py-2">
                        <div className="flex items-center justify-center py-2">
                            <CardTitle className="text-2xl font-black tracking-tight whitespace-nowrap">
                                {isLoginView ? "Textra 로그인" : "Textra에 오신것을 환영합니다."}
                            </CardTitle>
                        </div>
                        {/* --- 로그인 뷰일 때 --- */}
                        {isLoginView ? (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">이메일</Label>
                                    <Input type="email" placeholder="m@example.com" className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">비밀번호</Label>
                                        <button className="text-[9px] font-bold opacity-40 hover:opacity-100 uppercase">비밀번호를 잊어버리셨나요?</button>
                                    </div>
                                    <Input type="password" placeholder="••••••••" className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} />
                                </div>
                                <Button className={`w-full font-semibold h-12 rounded-xl mt-2 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}>로그인</Button>
                            </div>
                        ) : (
                            /* --- 회원가입 뷰일 때 (이메일 폼 섹션) --- */
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showEmailForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">닉네임</Label>
                                        <Input placeholder="닉네임을 입력하세요" className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">이메일</Label>
                                        <Input type="email" placeholder="name@example.com" className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">비밀번호</Label>
                                        <Input type="password" placeholder="••••••••" className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} />
                                    </div>
                                    <Button className={`w-full font-semibold h-12 rounded-xl mt-2 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}>가입 완료</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-8 pb-10">
                        {/* SNS 구분선 (로그인 시 또는 회원가입 폼이 닫혀있을 때 표시) */}
                        {(!showEmailForm || isLoginView) && (
                            <div className="relative w-full my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className={`w-full border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`} />
                                </div>
                                <div className="relative flex justify-center text-xs font-black">
                                    <span className={`px-4 ${darkMode ? 'bg-[#121212] text-zinc-700' : 'bg-white text-slate-300'}`}>
                                        {isLoginView ? "다른방법으로 로그인" : "Textra 시작하기"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 회원가입 뷰에서 폼이 닫혀있을 때만 이메일 시작 버튼 노출 */}
                        {!isLoginView && !showEmailForm && (
                            <Button
                                onClick={() => setShowEmailForm(true)}
                                className={`w-full font-semibold h-12 rounded-md ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                            >
                                Textra로 시작하기
                            </Button>
                        )}

                        <KaKaoLoginButton />
                        <GoogleLoginButton />

                        <button
                            onClick={toggleView}
                            className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
                                darkMode ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                            }`}>
                            {isLoginView ? "회원이 아니신가요?" : "이미 회원이신가요?"}
                        </button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}