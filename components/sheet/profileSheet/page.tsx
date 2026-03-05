"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import { useSession, signOut } from "next-auth/react";
import AuthDialog from "@/components/dialog/AuthDialog/page";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { calculateLevel } from "@/lib/xp";
import { LuUser, LuArrowRight, LuChevronRight } from "react-icons/lu";
import { LogOut, Edit3, Check, X, CalendarCheck, Wallet } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProfileSheet() {
    const router = useRouter();
    const { darkMode } = useTheme();
    const { data: session, update } = useSession();

    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({ nickname: "", github: "", bio: "" });
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
    const [isTodayChecked, setIsTodayChecked] = useState(false);

    // [로직 통일] 사용자 데이터 및 출석 상태를 가져오는 함수
    const fetchFullUserData = useCallback(async (userId: string) => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // 1. 기본 유저 정보 가져오기
            const userRes = await fetch(`/api/user/${userId}`);
            // 2. 출석 전용 API에서 최신 상태 가져오기 (AttendancePage와 로직 통일)
            const attendanceRes = await fetch("/api/attendance");

            if (userRes.ok && attendanceRes.ok) {
                const data = await userRes.json();
                const attData = await attendanceRes.json();

                setUserData({
                    ...data,
                    consecutiveDays: attData.consecutiveDays // 출석 API의 최신 연속 일수 반영
                });

                setIsTodayChecked(attData.isTodayChecked); // 오늘 출석 여부 반영

                setFormData({
                    nickname: data.name || "",
                    github: data.github || "",
                    bio: data.bio || ""
                });
                setUserPosts((data.posts || []).slice(0, 3));
            }
        } catch (error) {
            console.error("데이터 동기화 실패:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            fetchFullUserData((session.user as any).id);
        }
    }, [session, fetchFullUserData]);

    const { level, currentLevelProgress, nextLevelRequiredXp } = useMemo(() => {
        if (!userData) return { level: 1, currentLevelProgress: 0, nextLevelRequiredXp: 100 };
        return calculateLevel(Number(userData.xp || 0));
    }, [userData?.xp]);

    if (!mounted) return null;

    const handleSave = async () => {
        if (!session?.user || !userData) return;
        const userId = (session.user as any).id;
        const response = await fetch(`/api/user/${userId}/edit`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setUserData({ ...userData, name: formData.nickname, github: formData.github, bio: formData.bio });
            await update({
                ...session,
                user: { ...session.user, ...formData }
            });
            setIsEditing(false);
            toast.success("프로필이 저장되었습니다.");
        }
    };

    // [로직 통일] 출석체크 핸들러
    const handleAttendance = async () => {
        if (isTodayChecked || isAttendanceLoading || !session?.user) return;
        setIsAttendanceLoading(true);
        try {
            const res = await fetch("/api/attendance", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message, { description: `+${data.xpGained} XP 적립` });

                // 출석 성공 후 즉시 최신 데이터 다시 로드 (숫자 즉시 반영)
                await fetchFullUserData((session.user as any).id);
            }
        } catch (error) {
            toast.error("출석 실패");
        } finally {
            setIsAttendanceLoading(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-transparent active:scale-95 transition-all">
                    <LuUser className="w-7 h-7 opacity-80" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className={`w-full sm:max-w-md p-0 border-none transition-all duration-500 flex flex-col
                ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}
            >
                {session?.user && userData ? (
                    <div className="flex flex-col h-full">
                        {/* HEADER */}
                        <div className="flex justify-between items-center p-8 pb-4">
                            <span className="text-[16px] font-black uppercase opacity-30 tracking-widest ml-1">프로필</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className="p-2 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    {isEditing ? <Check size={20} className="text-green-500" /> : <Edit3 size={18} />}
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                                >
                                    <LogOut size={18} />
                                </button>
                                <SheetClose className="p-2 opacity-40 hover:opacity-100 transition-transform hover:rotate-90">
                                    <X size={22} />
                                </SheetClose>
                            </div>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex-1 overflow-y-auto px-8 space-y-12 pb-10 custom-scrollbar">

                            {/* USER BASIC INFO & 상세보기 버튼 */}
                            <section className="flex items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-6 min-w-0">
                                    <div className="relative shrink-0">
                                        <Avatar className="w-20 h-20 rounded-3xl border-none shadow-2xl">
                                            <AvatarImage src={userData.image || ""} className="object-cover" />
                                            <AvatarFallback className="bg-indigo-600 text-white font-black text-xl">
                                                {formData.nickname.slice(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black shadow-lg">
                                            LV.{level}
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {isEditing ? (
                                            <Input
                                                value={formData.nickname}
                                                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                                className="text-2xl font-black p-0 h-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 mb-1"
                                            />
                                        ) : (
                                            <h2 className="text-3xl font-[1000] tracking-tighter truncate mb-1 leading-tight">
                                                {userData.name}
                                            </h2>
                                        )}
                                        <Badge variant="secondary" className="rounded-full px-2.5 py-0 text-[10px] font-black bg-indigo-500/10 text-indigo-500 border-none">
                                            {userData.role || "에디터"}
                                        </Badge>
                                    </div>
                                </div>

                                {!isEditing && (
                                    <SheetClose asChild>
                                        <button
                                            onClick={() => router.push(`/user/${userData.id}`)}
                                            className={`p-3 rounded-2xl border transition-all active:scale-95 group shadow-sm shrink-0
                                                ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            <LuChevronRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    </SheetClose>
                                )}
                            </section>

                            {/* GROWTH & WALLET */}
                            <section className="space-y-4">
                                <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black uppercase opacity-40">경험치</span>
                                        <span className="text-xs font-bold text-indigo-500">{currentLevelProgress} <span className="opacity-30">/ {nextLevelRequiredXp} XP</span></span>
                                    </div>
                                    <Progress value={(currentLevelProgress / nextLevelRequiredXp) * 100} className="h-2 bg-zinc-100 dark:bg-zinc-800/50" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* 출석 카드 - 실시간 반영 */}
                                    <div className={`p-5 rounded-3xl border flex flex-col justify-between h-32 ${darkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <CalendarCheck size={18} className="text-indigo-500" />
                                            <span className="text-[10px] font-black text-indigo-500/60 uppercase">출석</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black leading-none mb-2">{userData.consecutiveDays || 0}일</p>
                                            <button
                                                onClick={handleAttendance}
                                                disabled={isTodayChecked || isAttendanceLoading}
                                                className={`text-[10px] font-black uppercase tracking-tighter transition-all text-left ${isTodayChecked ? 'opacity-20 cursor-default' : 'text-indigo-500 hover:translate-x-1'}`}
                                            >
                                                {isTodayChecked ? "출석 완료" : "출석 체크하기 →"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* 지갑 카드 */}
                                    <div className={`p-5 rounded-3xl border flex flex-col justify-between h-32 ${darkMode ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50/50 border-amber-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <Wallet size={18} className="text-amber-500" />
                                            <span className="text-[10px] font-black text-amber-500/60 uppercase">포인트 지갑</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black leading-none mb-2">{userData.points?.toLocaleString() || 0}P</p>
                                            <SheetClose asChild>
                                                <button onClick={() => router.push('/main/settlement')} className="text-[10px] font-black uppercase tracking-tighter text-amber-600 dark:text-amber-500 hover:translate-x-1 transition-all text-left">
                                                    정산하기 →
                                                </button>
                                            </SheetClose>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* BIO & ACCOUNT INFO */}
                            <section className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase opacity-30 tracking-widest">소개글</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            className="bg-transparent border-white/10 text-sm p-0 h-8 rounded-none border-b focus-visible:ring-0"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold opacity-60 leading-relaxed">
                                            {userData.bio || "본인을 소개해주세요"}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase opacity-30 tracking-widest">이메일</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-black uppercase">Email</span>
                                        <p className="text-xs font-bold opacity-40 truncate">{userData.github || "연동 없음"}</p>
                                    </div>
                                </div>
                            </section>

                            {/* RECENT POSTS LIST */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-[10px] font-black uppercase opacity-30 tracking-widest">최근 활동</label>
                                    <SheetClose asChild>
                                        <button
                                            onClick={() => router.push(`/user/${userData.id}`)}
                                            className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
                                        >
                                            전체 보기
                                        </button>
                                    </SheetClose>
                                </div>
                                <div className="space-y-2">
                                    {userPosts.length > 0 ? (
                                        userPosts.map((post) => (
                                            <SheetClose asChild key={post.id}>
                                                <div
                                                    onClick={() => router.push(`/main/content/content_comunity/${post.id}`)}
                                                    className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-white hover:shadow-sm'}`}
                                                >
                                                    <span className="text-xs font-bold truncate pr-4">{post.title}</span>
                                                    <LuArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                </div>
                                            </SheetClose>
                                        ))
                                    ) : (
                                        <p className="text-[11px] opacity-20 py-4 italic text-center">활동 기록이 없습니다.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* FOOTER */}
                        {isEditing && (
                            <div className="p-8 border-t border-white/5 bg-inherit">
                                <Button
                                    onClick={handleSave}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                                >
                                    프로필 저장하기
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <>
                                <h3 className="text-3xl font-[1000] tracking-tighter mb-8 leading-tight">텍스트라와 함께<br/>창작을 시작하세요</h3>
                                <AuthDialog />
                            </>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}