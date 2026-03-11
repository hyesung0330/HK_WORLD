"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/context/darkmood";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import KaKaoJoinButton from "@/components/button/kakao_join_button/page";
import GoogleJoinButton from "@/components/button/google_join_button/page";
import NaverJoinButton from "@/components/button/Naver_join_button/page";
import KaKaoLoginButton from "@/components/button/kakao_login_button/page";
import GoogleLoginButton from "@/components/button/google_login_button/page";
import NaverLoginButton from "@/components/button/Naver_login_button/page";

export default function AuthDialog() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [isLoginView, setIsLoginView] = useState(true); // 로그인/회원가입 전환 상태
    const [isForgotPasswordView, setIsForgotPasswordView] = useState(false); // 비밀번호 찾기 전환 상태
    const [showEmailForm, setShowEmailForm] = useState(false); // 이메일 가입 폼 표시 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 폼 데이터 상태
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    // 상태 전환 시 폼 노출 여부 초기화
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setIsForgotPasswordView(false);
        setShowEmailForm(false);
        setError("");
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            const message = data.debug ? `${data.message}\n${data.debug}` : data.message;

            if (res.ok) {
                setError(message);
                // 성공 시 약간의 딜레이 후 로그인 화면으로 돌아가게 할 수도 있음
            } else {
                setError(message || "오류가 발생했습니다.");
            }
        } catch (err) {
            setError("서버와의 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else {
                router.refresh();
                // 다이얼로그를 닫기 위해 window.location.reload()를 쓸 수도 있지만 
                // 보통은 다이얼로그 상태를 제어하는 것이 좋습니다. 
                // 여기서는 간단히 새로고침으로 세션 반영.
                window.location.reload();
            }
        } catch (err) {
            setError("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (res.ok) {
                // 회원가입 성공 시 로그인 뷰로 전환
                setIsLoginView(true);
                setShowEmailForm(false);
                setError("회원가입이 완료되었습니다. 로그인을 진행해주세요.");
            } else {
                setError(data.message || "회원가입 중 오류가 발생했습니다.");
            }
        } catch (err) {
            setError("서버와의 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => {
            if (!open) {
                setShowEmailForm(false);
                setIsForgotPasswordView(false);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
            }
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="rounded-none border-b-1 border-black hover:bg-zinc-100 transition-all"
                >
                    시작하기
                </Button>
            </DialogTrigger>
            <DialogContent className={`w-[95vw] sm:max-w-[420px] p-0 border-none overflow-hidden rounded-3xl ${darkMode ? "bg-[#0a0a0a]" : "bg-slate-50"}`}>

                <Card className={`w-full border-none shadow-none transition-all duration-500 ${
                    darkMode ? "bg-[#121212] text-white" : "bg-white text-slate-900"
                }`}>
                    <CardContent className="grid gap-5 px-6 md:px-8 py-2">
                        <div className="flex items-center justify-center py-2 text-center">
                            <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight break-keep">
                                {isForgotPasswordView ? "비밀번호 찾기" : isLoginView ? "Textra 로그인" : "Textra에 오신것을 환영합니다."}
                            </CardTitle>
                        </div>
                        {/* --- 비밀번호 찾기 뷰일 때 --- */}
                        {isForgotPasswordView ? (
                            <form onSubmit={handleForgotPassword} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">이메일</Label>
                                    <Input 
                                        type="email" 
                                        placeholder="m@example.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                    />
                                </div>
                                {error && (
                                    <p className={`text-[11px] font-bold whitespace-pre-line leading-relaxed ${
                                        (error.includes("이메일로") || error.includes("개발모드")) 
                                            ? "text-green-500" 
                                            : "text-red-500"
                                    }`}>
                                        {error}
                                    </p>
                                )}
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`w-full font-semibold h-12 rounded-xl mt-2 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                                >
                                    {isLoading ? "처리 중..." : "임시 비밀번호 발송"}
                                </Button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsForgotPasswordView(false);
                                        setError("");
                                    }}
                                    className="text-[10px] font-bold opacity-40 hover:opacity-100 uppercase mt-2"
                                >
                                    로그인 화면으로 돌아가기
                                </button>
                            </form>
                        ) : isLoginView ? (
                            /* --- 로그인 뷰일 때 --- */
                            <form onSubmit={handleLogin} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">이메일</Label>
                                    <Input 
                                        type="email" 
                                        placeholder="m@example.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">비밀번호</Label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsForgotPasswordView(true);
                                                setError("");
                                            }}
                                            className="text-[9px] font-bold opacity-40 hover:opacity-100 uppercase"
                                        >
                                            비밀번호를 잊어버리셨나요?
                                        </button>
                                    </div>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                    />
                                </div>
                                {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`w-full font-semibold h-12 rounded-xl mt-2 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                                >
                                    {isLoading ? "처리 중..." : "로그인"}
                                </Button>
                            </form>
                        ) : (
                            /* --- 회원가입 뷰일 때 (이메일 폼 섹션) --- */
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showEmailForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                <form onSubmit={handleRegister} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">닉네임</Label>
                                        <Input 
                                            placeholder="닉네임을 입력하세요" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={showEmailForm}
                                            className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">이메일</Label>
                                        <Input 
                                            type="email" 
                                            placeholder="name@example.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required={showEmailForm}
                                            className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">비밀번호</Label>
                                        <Input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required={showEmailForm}
                                            className={darkMode ? "bg-[#1c1c1c] border-none" : "bg-slate-100 border-none"} 
                                        />
                                    </div>
                                    {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`w-full font-semibold h-12 rounded-xl mt-2 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                                    >
                                        {isLoading ? "처리 중..." : "가입 완료"}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-6 md:px-8 pb-10">
                        {/* SNS 구분선 (로그인 시 또는 회원가입 폼이 닫혀있을 때 표시) */}
                        {(!showEmailForm || isLoginView) && !isForgotPasswordView && (
                            <div className="relative w-full my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className={`w-full border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`} />
                                </div>
                                <div className="relative flex justify-center text-xs font-semibold">
                                    <span className={`px-4 ${darkMode ? 'bg-[#121212] text-zinc-700' : 'bg-white text-slate-300'}`}>
                                        {isLoginView ? "다른방법으로 로그인" : "시작하기"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 회원가입 뷰에서 폼이 닫혀있을 때만 이메일 시작 버튼 노출 */}
                        {!isLoginView && !showEmailForm && !isForgotPasswordView && (
                            <Button
                                onClick={() => setShowEmailForm(true)}
                                className={`w-full font-semibold h-12 rounded-md ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                            >
                                이메일로 시작하기
                            </Button>
                        )}

                        {!isForgotPasswordView && (
                            isLoginView ? (
                                <>
                                    <KaKaoLoginButton />
                                    <GoogleLoginButton />
                                    <NaverLoginButton />
                                </>
                            ) : (
                                <>
                                    <KaKaoJoinButton />
                                    <GoogleJoinButton />
                                    <NaverJoinButton />
                                </>
                            )
                        )}

                        {!isForgotPasswordView && (
                            <button
                                onClick={toggleView}
                                className={`text-[10px] font-semibold tracking-widest uppercase transition-colors ${
                                    darkMode ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                                }`}>
                                {isLoginView ? "회원이 아니신가요?" : "이미 회원이신가요?"}
                            </button>
                        )}
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}