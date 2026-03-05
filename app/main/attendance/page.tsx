"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
    CalendarCheck, 
    Zap, 
    Trophy, 
    CheckCircle2, 
    Calendar,
    ArrowRight,
    Star,
    Sparkles,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";

export default function AttendancePage() {
    const { darkMode } = useTheme();
    const { data: session, update } = useSession();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [attendances, setAttendances] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
    const [isTodayChecked, setIsTodayChecked] = useState(false);
    
    // 달력 상태
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            fetchAttendanceData();
        } else {
            setIsLoading(false);
        }
    }, [session]);

    const fetchAttendanceData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/attendance");
            if (res.ok) {
                const data = await res.json();
                setUserData({ consecutiveDays: data.consecutiveDays });
                setIsTodayChecked(data.isTodayChecked);
                setAttendances(data.attendances || []);
            }
        } catch (error) {
            console.error("Fetch attendance error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttendance = async () => {
        if (isTodayChecked || isAttendanceLoading || !session) return;
        setIsAttendanceLoading(true);
        try {
            const res = await fetch("/api/attendance", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message, {
                    description: `+${data.xpGained} XP가 적립되었습니다.`
                });
                // 데이터 새로고침
                fetchAttendanceData();
            } else {
                const err = await res.json();
                toast.error(err.message || "출석체크에 실패했습니다.");
            }
        } catch (error) {
            console.error("Attendance error:", error);
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsAttendanceLoading(false);
        }
    };

    // 달력 헬퍼 함수들
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (일) ~ 6 (토)
        
        const calendar = [];
        
        // 이전 달의 마지막 일들로 채우기
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            calendar.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year: year,
                isCurrentMonth: false
            });
        }
        
        // 이번 달 일들
        for (let i = 1; i <= daysInMonth; i++) {
            calendar.push({
                day: i,
                month: month,
                year: year,
                isCurrentMonth: true
            });
        }
        
        // 다음 달 시작 일들로 채우기 (42칸 맞추기)
        const remainingSlots = 42 - calendar.length;
        for (let i = 1; i <= remainingSlots; i++) {
            calendar.push({
                day: i,
                month: month + 1,
                year: year,
                isCurrentMonth: false
            });
        }
        
        return calendar;
    }, [viewDate]);

    const isAttended = (year: number, month: number, day: number) => {
        return attendances.some(dateStr => {
            const date = new Date(dateStr);
            return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
        });
    };

    const isToday = (year: number, month: number, day: number) => {
        const now = new Date();
        return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
    };

    if (!mounted) return null;

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}>
            <MainHeader />

            <main className="pt-24 md:pt-40 pb-20 max-w-4xl mx-auto px-5 md:px-6">
                <BackButton />
                {/* --- Hero Section --- */}
                <section className="mb-12 md:mb-16 text-center">
                    <motion.div {...fadeInUp}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] md:text-[11px] font-black mb-6 uppercase tracking-widest">
                           Textra 출석체크
                        </div>
                        <h1 className="text-4xl md:text-6xl font-[950] tracking-tighter leading-tight mb-6">
                            매일 쌓이는 <span className="text-emerald-500"><br/>성장</span>의 습관
                        </h1>
                        <p className="text-sm md:text-lg font-medium opacity-50 max-w-xl mx-auto leading-relaxed">
                            매일 출석하고 보너스 경험치를 받으세요.<br className="hidden md:block"/>
                            연속 출석이 길어질수록 더 큰 혜택이 기다립니다.
                        </p>
                    </motion.div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                    {/* --- Attendance Card (왼쪽/상단) --- */}
                    <section className="lg:col-span-5">
                        {isLoading ? (
                            <div className="h-full flex justify-center items-center py-20 border rounded-[3rem] border-dashed border-white/10">
                                <Loading message="출석 정보를 가져오고 있습니다" />
                            </div>
                        ) : session ? (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`h-full p-10 rounded-[3rem] border text-center relative overflow-hidden transition-all flex flex-col justify-center
                                    ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'}`}
                            >
                                <div className="relative z-10">
                                    <div className="flex flex-col items-center mb-10">
                                        <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 opacity-60">현재 연속 출석</span>
                                        <div className="text-6xl md:text-7xl font-[1000] tracking-tighter mb-2 flex items-baseline gap-2">
                                            {userData?.consecutiveDays || 0}
                                            <span className="text-2xl md:text-3xl font-bold opacity-20">일째</span>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleAttendance}
                                        disabled={isAttendanceLoading || isTodayChecked}
                                        className={`w-full h-20 md:h-24 rounded-[2rem] text-xl font-[1000] transition-all shadow-2xl active:scale-95
                                            ${isTodayChecked 
                                                ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600 shadow-none pointer-events-none' 
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}
                                    >
                                        {isAttendanceLoading ? (
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        ) : isTodayChecked ? (
                                            <div className="flex items-center gap-4">
                                                <CheckCircle2 size={32} />
                                                오늘 출석 완료
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <CalendarCheck size={32} />
                                                출석체크 하기
                                            </div>
                                        )}
                                    </Button>

                                    {isTodayChecked && (
                                        <p className="mt-8 text-sm font-bold text-emerald-500 opacity-60 animate-pulse">
                                            내일도 잊지 말고 방문해 주세요!
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className={`h-full p-16 rounded-[3rem] border text-center flex flex-col justify-center items-center ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <p className="text-lg font-medium opacity-50 mb-8">로그인 후 출석체크에 참여할 수 있습니다.</p>
                                <Button onClick={() => router.push('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 h-14 rounded-2xl">
                                    로그인 하러 가기
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* --- Calendar Section (오른쪽/하단) --- */}
                    <section className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-8 md:p-10 rounded-[3rem] border transition-all h-full
                                ${darkMode ? 'border-white/5 bg-white/[0.01]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}
                        >
                            <div className="flex items-center justify-between mb-10 px-2">
                                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                    <Calendar className="text-emerald-500" />
                                    {viewDate.getFullYear()}. {viewDate.getMonth() + 1}
                                </h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                        className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                        className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                    <div key={day} className="text-[10px] font-black opacity-20 text-center py-2">{day}</div>
                                ))}
                                {calendarDays.map((date, i) => {
                                    const attended = isAttended(date.year, date.month, date.day);
                                    const today = isToday(date.year, date.month, date.day);
                                    
                                    return (
                                        <div 
                                            key={i} 
                                            className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all
                                                ${!date.isCurrentMonth ? 'opacity-10 pointer-events-none' : ''}
                                                ${attended ? (darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : (darkMode ? 'bg-white/[0.02]' : 'bg-slate-50')}
                                            `}
                                        >
                                            <span className={`text-xs md:text-sm font-bold ${attended ? 'text-emerald-500' : (today ? 'text-indigo-500 underline underline-offset-4' : 'opacity-40')}`}>
                                                {date.day}
                                            </span>
                                            {attended && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white scale-75 md:scale-90">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-8 flex items-center gap-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold opacity-40">출석 완료</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`} />
                                    <span className="text-[10px] font-bold opacity-40">미출석</span>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </div>

                {/* --- Reward Rules --- */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8 md:mb-12 justify-center">
                        <Trophy size={20} className="text-amber-500" />
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">출석 보너스 안내</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { label: "1일 출석", xp: "100", unit: "XP", desc: "매일 기본 보상" },
                            { label: "3일 연속", xp: "200", unit: "XP", desc: "습관의 시작" },
                            { label: "5일 연속", xp: "300", unit: "XP", desc: "꾸준함의 가치" },
                            { label: "7일 연속", xp: "500", unit: "XP", desc: "한 주 완성" },
                            { label: "14일 연속", xp: "700", unit: "XP", desc: "창작의 원동력" },
                            { label: "30일 연속", xp: "1,000", unit: "XP", desc: "명예로운 완주" },
                        ].map((item, i) => (
                            <div key={i} className={`p-8 rounded-[2rem] border transition-all hover:scale-[1.02] 
                                ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white shadow-sm border-slate-100'}`}>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{item.label}</p>
                                <div className="text-3xl font-[1000] text-emerald-500 mb-2">
                                    {item.xp}<span className="text-xs font-bold ml-1 opacity-40 text-current">{item.unit}</span>
                                </div>
                                <p className="text-xs font-bold opacity-30">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Info Section --- */}
                <section className="text-center pt-16 border-t border-white/5">
                    <div className="flex items-center justify-center gap-8 md:gap-16 opacity-30">
                        <div className="flex flex-col items-center gap-2">
                            <Sparkles size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">실시간 반영</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Zap size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">성장 가속화</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Calendar size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">자동 초기화</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
