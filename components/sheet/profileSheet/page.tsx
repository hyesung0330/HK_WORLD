"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";
import { useSession, signOut } from "next-auth/react";
import AuthDialog from "@/components/dialog/AuthDialog/page";
// SheetClose 추가
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
// LuX 아이콘 추가
import { LuLogOut, LuUser, LuCheck, LuArrowRight, LuX } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";

export default function ProfileSheet() {
    const { darkMode } = useTheme();
    const { data: session, update } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nickname: "", github: "" });
    const [userPosts, setUserPosts] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            setFormData({
                nickname: session.user.name || "",
                github: (session.user as any).github || ""
            });
            fetchUserPosts((session.user as any).id);
        }
    }, [session]);

    const fetchUserPosts = async (userId: string) => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/user/${userId}/posts`);
            if (res.ok) {
                const data = await res.json();
                setUserPosts(data.slice(0, 3));
            }
        } catch (error) { console.error(error); }
    };

    if (!mounted) return null;

    const handleSave = async () => {
        if (!session?.user) return;
        const userId = (session.user as any).id;
        const response = await fetch(`/api/user/${userId}/edit`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: formData.nickname, github: formData.github }),
        });

        if (response.ok) {
            await update({ ...session, user: { ...session.user, name: formData.nickname, github: formData.github } });
            setIsEditing(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-transparent transition-transform active:scale-95">
                    <LuUser className="w-7 h-7 opacity-80" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className={`w-full sm:max-w-md p-0 border-none transition-all duration-500 
                ${darkMode ? 'bg-[#080808] text-white' : 'bg-white text-slate-900'}`}
            >
                {session?.user ? (
                    <div className="flex flex-col h-full p-8 md:p-12">
                        {/* 1. 상단 컨트롤: 닫기 아이콘 추가 */}
                        <div className="flex justify-between items-center mb-16">
                            {/* 왼쪽 그룹: 타이틀 + 수정/저장 + 로그아웃 */}
                            <div className="flex items-center gap-6">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">
            프로필 설정
        </span>

                                <div className="flex items-center gap-4 border-l pl-6 border-white/10">
                                    {/* 수정/저장 아이콘 */}
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        className="hover:text-indigo-500 transition-colors opacity-60 hover:opacity-100"
                                    >
                                        {isEditing ? <LuCheck size={20} className="text-green-500" /> : <FaRegEdit size={18} />}
                                    </button>

                                    {/* 로그아웃 아이콘 */}
                                    <button
                                        onClick={() => signOut()}
                                        className="hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
                                    >
                                        <LuLogOut size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* 오른쪽 그룹: 오직 닫기 버튼만 */}
                            <div className="flex items-center">
                                {isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="hover:rotate-90 transition-transform duration-300 opacity-40 hover:opacity-100"
                                    >
                                        <LuX size={22} />
                                    </button>
                                ) : (
                                    <SheetClose asChild>
                                        <button className="hover:rotate-90 transition-transform duration-300 opacity-40 hover:opacity-100">
                                            <LuX size={22} />
                                        </button>
                                    </SheetClose>
                                )}
                            </div>
                        </div>

                        {/* 2. 프로필 정보 */}
                        {/* 2. 프로필 정보 영역 */}
                        <div className="space-y-10 mb-16">
                            {/* 상단: 이미지 + 기본 텍스트 정보 (가로 배치) */}
                            <div className="flex items-center gap-8">
                                <Avatar className="w-24 h-24 rounded-full border-none overflow-hidden shadow-2xl shrink-0">
                                    <AvatarImage src={session.user.image || ""} className="object-cover" />
                                    <AvatarFallback className="bg-indigo-600 text-white font-black  text-2xl">
                                        {formData.nickname.slice(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex flex-col min-w-0">
                                    {isEditing ? (
                                        <Input
                                            value={formData.nickname}
                                            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                            className={`text-3xl font-black h-12 p-0 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}
                                            placeholder="닉네임"
                                        />
                                    ) : (
                                        <h2 className="text-4xl font-[900] tracking-tighter leading-none truncate">
                                            {session.user.name}
                                        </h2>
                                    )}
                                    <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-2">
                                        LV.{ (session.user as any).level || 1} 컬렉터
                                    </p>
                                </div>
                            </div>

                            {/* 하단: 추가 정보 (깃허브 등) */}
                            <div className={`pt-6 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block mb-2">연동 계정</span>
                                {isEditing ? (
                                    <Input
                                        value={formData.github}
                                        onChange={(e) => setFormData({...formData, github: e.target.value})}
                                        className={`text-sm font-medium p-0 h-8 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 opacity-50 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}
                                        placeholder="깃허브 주소 (github.com/id)"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                                        <span className="shrink-0 text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-black">GH</span>
                                        <span className="truncate">{(session.user as any).github || "연동된 계정 없음"}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. 최근 활동 리스트 */}
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">최근 기록</h4>
                            <div className="space-y-px">
                                {userPosts.length > 0 ? (
                                    userPosts.map((post) => (
                                        <div key={post.id} className={`group flex items-center justify-between py-5 border-b transition-colors cursor-pointer ${darkMode ? 'border-white/5 hover:border-white/20' : 'border-slate-100 hover:border-slate-300'}`}>
                                            <span className="text-sm font-bold tracking-tight line-clamp-1">{post.title}</span>
                                            <LuArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs opacity-20">작성된 기록이 없습니다.</p>
                                )}
                            </div>
                        </div>

                        {/* 4. 저장 버튼 */}
                        {isEditing && (
                            <Button onClick={handleSave} className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-none transition-all shadow-2xl">
                                프로필 저장하기
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-4xl font-black tracking-tighter mb-8 leading-tight">함께 시작해봐요</h3>
                        <AuthDialog />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}