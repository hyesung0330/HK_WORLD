"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";
import { useSession, signOut } from "next-auth/react";
import AuthDialog from "@/components/dialog/AuthDialog/page";

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
import { Input } from "@/components/ui/input";
import { LuTrophy, LuExternalLink, LuLogOut, LuUser, LuCheck } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";

export default function ProfileSheet() {
    const { darkMode } = useTheme();
    const { data: session, update } = useSession();
    const [mounted, setMounted] = useState(false);

    // 편집 모드 상태 관리
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nickname: "",
        github: ""
    });
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // 랜덤 닉네임 생성 함수
    const generateRandomNickname = () => {
        const adjectives = ["말랑말랑한", "바삭바삭한", "쫀득쫀득한", "달콤한", "짭짤한", "촉촉한", "고소한", "탱글탱글한", "폭신폭신한"];
        const foods = ["초콜릿", "마시멜로", "마카롱", "푸딩", "젤리", "탕후루", "치즈케이크", "쿠키", "도넛", "휘낭시에"];

        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomFood = foods[Math.floor(Math.random() * foods.length)];

        return `${randomAdj} ${randomFood}`;
    };

    useEffect(() => {
        setMounted(true);
        if (session?.user && !isEditing) {
            // 이름이 없는 경우 랜덤 닉네임 생성, 있는 경우 기존 이름 사용
            const initialNickname = session.user.name || generateRandomNickname();

            setFormData({
                nickname: initialNickname,
                github: (session.user as any).github || ""
            });

            // 이름이 아예 없던 신규 유저라면 즉시 편집 모드 활성화
            if (!session.user.name) {
                setIsEditing(true);
            }

            // 사용자 포스트 가져오기
            fetchUserPosts((session.user as any).id);
        }
    }, [session]); // isEditing 의존성을 제거하여 수정 중 세션 체크로 인한 초기화 방지

    const fetchUserPosts = async (userId: string) => {
        if (!userId) return;
        setLoadingPosts(true);
        try {
            const res = await fetch(`/api/user/${userId}/posts`);
            if (res.ok) {
                const data = await res.json();
                setUserPosts(data);
            }
        } catch (error) {
            console.error("Fetch posts error:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    if (!mounted) return null;

    const handleSave = async () => {
        if (!session?.user) return;

        try {
            const userId = (session.user as any).id;
            const response = await fetch(`/api/user/${userId}/edit`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname: formData.nickname,
                    github: formData.github,
                }),
            });

            if (response.ok) {
                // 세션 데이터 클라이언트 동기화
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        name: formData.nickname,
                        github: formData.github
                    }
                });

                setIsEditing(false);
            } else {
                const error = await response.json();
                alert(error.message || "업데이트 실패");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    const user = session?.user ? {
        nickname: session.user.name || formData.nickname || "닉네임을 설정해주세요",
        email: session.user.email || "No email",
        level: (session.user as any).level || 1,
        levelTitle: (session.user as any).level >= 99 ? "MASTER" : "MEMBER",
        github: (session.user as any).github || "github.com/your-id",
        avatar: session.user.image || ""
    } : null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <LuUser className="w-8 h-8" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className={`w-full sm:max-w-md p-0 border-l transition-colors duration-500 overflow-y-auto
                ${darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
                {user ? (
                    <div className="p-8 space-y-10">
                        <SheetHeader className="text-left">
                            <div className="flex items-center justify-between mb-6">
                                <Badge className="bg-blue-600 font-black uppercase text-[10px]">Active Now</Badge>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => {
                                            if (isEditing) {
                                                handleSave();
                                            } else {
                                                setIsEditing(true);
                                            }
                                        }}
                                    >
                                        {isEditing ? <LuCheck className="w-4 h-4 text-green-500" /> :
                                            <FaRegEdit className="w-4 h-4 hover:opacity-100" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500" onClick={() => signOut()}>
                                        <LuLogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <Avatar className="w-20 h-20 border-2 border-gray-400 mb-4">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-blue-500 text-white font-black italic">
                                    {(formData.nickname || "TX").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {isEditing ? (
                                <div className="space-y-2">
                                    <Input
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                        placeholder="닉네임을 적어주세요"
                                        className={`text-2xl font-black uppercase h-12 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
                                    />
                                </div>
                            ) : (
                                <SheetTitle className={`text-4xl font-black tracking-tighter uppercase leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {user.nickname}
                                </SheetTitle>
                            )}
                            <SheetDescription className="text-xs font-medium opacity-50">
                                {isEditing ? "닉네임을 수정해보세요" : "TEXTRA 멤버"}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="grid grid-cols-1 gap-3">
                            <Card className="bg-blue-600 border-none shadow-lg text-white overflow-hidden relative">
                                <div className="absolute -right-2 -bottom-2 opacity-10">
                                    <LuTrophy size={80} />
                                </div>
                                <CardContent className="p-3 flex items-end justify-between">
                                    <div>
                                        <p className="text-[11px] font-black tracking-[0.2em] opacity-70 mb-1">Textra Level</p>
                                        <div className="text-2xl font-black leading-none">LV.{user.level}</div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">
                                        {user.levelTitle}
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className={`border-none shadow-sm ${darkMode ? 'bg-white/5 text-white' : 'bg-white'}`}>
                                <CardHeader className=" pb-0">
                                    <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 flex justify-between">
                                        Github {isEditing && <span className="text-blue-500">수정 모드</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 pt-1">
                                    {isEditing ? (
                                        <Input
                                            value={formData.github}
                                            onChange={(e) => setFormData({...formData, github: e.target.value})}
                                            placeholder="github.com/your-id"
                                            className={`text-sm font-bold h-8 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white'}`}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold truncate">{user.github}</div>
                                            {/*<LuExternalLink className="w-3 h-3 opacity-30" />*/}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {isEditing && (
                                <Button onClick={handleSave} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase shadow-xl transition-all">
                                    프로필 저장
                                </Button>
                            )}

                            {!isEditing && (
                                <div className="pt-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 px-2">최근 활동</h4>
                                    <div className="space-y-2 text-left">
                                        {loadingPosts ? (
                                            <div className="p-4 text-xs opacity-40">로딩 중...</div>
                                        ) : userPosts.length > 0 ? (
                                            userPosts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    className={`flex items-start gap-3 p-4 rounded-2xl transition-all cursor-pointer ${darkMode ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white shadow-sm hover:shadow-md'}`}
                                                    onClick={() => {
                                                        const targetPath = `/main/content/content_comunity/${post.id}`;
                                                        router.push(targetPath);
                                                    }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-[11px] font-bold leading-tight line-clamp-1">{post.title}</p>
                                                        <p className="text-[9px] opacity-40 font-medium">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-white/[0.03]' : 'bg-white shadow-sm'}`}>
                                                최근 활동이 없어요
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 h-full flex flex-col items-center justify-center space-y-6 text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <LuUser className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black uppercase">로그인이 필요합니다</h3>
                        <div onClick={(e) => e.stopPropagation()}>
                            <AuthDialog />
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}