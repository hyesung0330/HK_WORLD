"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    Trophy, 
    Medal, 
    Star, 
    ArrowUpRight, 
    Users, 
    FileText, 
    Zap,
    TrendingUp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { BackButton } from "@/components/ui/back-button";
import { calculateLevel } from "@/lib/xp";

export default function RankingPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            const res = await fetch("/api/ranking");
            if (res.ok) {
                const data = await res.json();
                setTopUsers(data);
            }
        } catch (error) {
            console.error("Fetch ranking error:", error);
        } finally {
            setLoading(false);
        }
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

            <main className="pt-24 md:pt-40 pb-20 max-w-5xl mx-auto px-5 md:px-6">
                <BackButton />
                
                {/* --- Hero Section --- */}
                <section className="mb-16 md:mb-24 text-center">
                    <motion.div {...fadeInUp}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] md:text-[11px] font-black mb-6 uppercase tracking-widest">
                           Textra 베스트 에디터
                        </div>
                        <h1 className="text-4xl md:text-6xl font-[950] tracking-tighter leading-tight mb-6">
                            최고의 <span className="text-indigo-500">에디터</span>를<br/>
                            만나보세요
                        </h1>
                        <p className="text-sm md:text-lg font-medium opacity-50 max-w-xl mx-auto leading-relaxed">
                            활발한 활동으로 영향력을 발휘하고 있는 상위 에디터들입니다.<br className="hidden md:block"/>
                            더 나은 글쓰기로 여러분도 주인공이 될 수 있습니다.
                        </p>
                    </motion.div>
                </section>

                {loading ? (
                    <div className="py-40 flex justify-center items-center">
                        <Loading message="랭킹 데이터를 동기화 중입니다" />
                    </div>
                ) : (
                    <>
                        {/* --- Podium (Top 3) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                            {/* 2nd Place */}
                            {topUsers[1] && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`order-2 md:order-1 p-8 rounded-[2.5rem] border text-center relative overflow-hidden h-fit md:mb-4
                                        ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-xl'}`}
                                >
                                    <div className="absolute top-4 right-4 text-slate-400 opacity-20"><Medal size={40} /></div>
                                    <div className="relative mb-6 flex justify-center">
                                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-200 shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => router.push(`/user/${topUsers[1].id}`)}>
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage src={topUsers[1].image} />
                                                <AvatarFallback className="bg-slate-200 text-slate-600 font-black text-2xl">{topUsers[1].name?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="absolute -bottom-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-white dark:border-[#1a1a1a]">2</div>
                                    </div>
                                    <h3 className="text-xl font-black mb-1 truncate cursor-pointer hover:text-indigo-500" onClick={() => router.push(`/user/${topUsers[1].id}`)}>{topUsers[1].name}</h3>
                                    <p className="text-xs font-bold opacity-40 mb-4 uppercase tracking-tighter">LV.{calculateLevel(topUsers[1].xp).level} {topUsers[1].role}</p>
                                    <div className="flex justify-center gap-4 text-[10px] font-black uppercase opacity-60">
                                        <div className="flex items-center gap-1"><FileText size={12} /> {topUsers[1]._count.posts}</div>
                                        <div className="flex items-center gap-1"><Users size={12} /> {topUsers[1]._count.followers}</div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {topUsers[0] && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`order-1 md:order-2 p-10 rounded-[3rem] border-2 text-center relative overflow-hidden scale-105 z-10
                                        ${darkMode ? 'border-indigo-500/30 bg-indigo-500/5' : 'bg-white border-indigo-500 shadow-2xl'}`}
                                >
                                    <div className="absolute top-6 right-6 text-amber-500 opacity-30 animate-pulse"><Trophy size={60} /></div>
                                    <div className="relative mb-8 flex justify-center">
                                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-amber-400 shadow-2xl cursor-pointer transition-transform hover:scale-105" onClick={() => router.push(`/user/${topUsers[0].id}`)}>
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage src={topUsers[0].image} />
                                                <AvatarFallback className="bg-amber-400 text-white font-black text-3xl">{topUsers[0].name?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="absolute -bottom-3 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-4 border-white dark:border-[#1a1a1a]">1</div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black mb-1 truncate cursor-pointer hover:text-indigo-500" onClick={() => router.push(`/user/${topUsers[0].id}`)}>{topUsers[0].name}</h3>
                                    <p className="text-sm font-black text-indigo-500 mb-6 uppercase tracking-widest">LV.{calculateLevel(topUsers[0].xp).level} {topUsers[0].role}</p>
                                    <div className="flex justify-center gap-6 text-xs font-black uppercase opacity-80">
                                        <div className="flex flex-col items-center">
                                            <span className="opacity-40 text-[9px] mb-1">컬럼 작성</span>
                                            <span className="flex items-center gap-1 text-lg"><FileText size={14} className="text-indigo-500" /> {topUsers[0]._count.posts}</span>
                                        </div>
                                        <div className="w-px h-8 bg-current opacity-10 self-center" />
                                        <div className="flex flex-col items-center">
                                            <span className="opacity-40 text-[9px] mb-1">팔로워</span>
                                            <span className="flex items-center gap-1 text-lg"><Users size={14} className="text-indigo-500" /> {topUsers[0]._count.followers}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {topUsers[2] && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`order-3 p-8 rounded-[2.5rem] border text-center relative overflow-hidden h-fit md:mb-4
                                        ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-xl'}`}
                                >
                                    <div className="absolute top-4 right-4 text-orange-400 opacity-20"><Medal size={40} /></div>
                                    <div className="relative mb-6 flex justify-center">
                                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-orange-300 shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => router.push(`/user/${topUsers[2].id}`)}>
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage src={topUsers[2].image} />
                                                <AvatarFallback className="bg-orange-300 text-orange-800 font-black text-2xl">{topUsers[2].name?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="absolute -bottom-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-white dark:border-[#1a1a1a]">3</div>
                                    </div>
                                    <h3 className="text-xl font-black mb-1 truncate cursor-pointer hover:text-indigo-500" onClick={() => router.push(`/user/${topUsers[2].id}`)}>{topUsers[2].name}</h3>
                                    <p className="text-xs font-bold opacity-40 mb-4 uppercase tracking-tighter">LV.{calculateLevel(topUsers[2].xp).level} {topUsers[2].role}</p>
                                    <div className="flex justify-center gap-4 text-[10px] font-black uppercase opacity-60">
                                        <div className="flex items-center gap-1"><FileText size={12} /> {topUsers[2]._count.posts}</div>
                                        <div className="flex items-center gap-1"><Users size={12} /> {topUsers[2]._count.followers}</div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* --- Ranking List (4th - 20th) --- */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-6 mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={16} className="opacity-40 text-indigo-500" />
                                    랭킹 리스트
                                </h3>
                                <span className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">경험치 기반 랭킹이에요</span>
                            </div>

                            {topUsers.slice(3).map((user, i) => (
                                <motion.div 
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => router.push(`/user/${user.id}`)}
                                    className={`group flex items-center gap-4 md:gap-8 p-5 md:p-6 rounded-3xl border transition-all cursor-pointer
                                        ${darkMode ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                                >
                                    <div className="w-8 md:w-10 text-center font-[1000] text-lg md:text-xl opacity-20 group-hover:opacity-100 transition-opacity">
                                        {i + 4}
                                    </div>
                                    
                                    <Avatar className="w-12 h-12 md:w-14 md:h-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all border border-white/10 shadow-lg">
                                        <AvatarImage src={user.image} className="object-cover" />
                                        <AvatarFallback className="bg-indigo-600 text-white font-black">{user.name?.[0]}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-base md:text-lg tracking-tight truncate group-hover:text-indigo-500 transition-colors">{user.name}</h4>
                                            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[8px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                LV.{calculateLevel(user.xp).level}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] md:text-xs font-medium opacity-40 line-clamp-1">{user.bio || "텍스트라의 멋진 에디터입니다."}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className="text-sm font-black text-indigo-500">
                                            {user.xp.toLocaleString()} <span className="text-[9px] opacity-40">XP</span>
                                        </div>
                                        <div className="flex gap-3 text-[9px] font-black uppercase opacity-30 group-hover:opacity-60 transition-opacity">
                                            <span className="flex items-center gap-1"><FileText size={10} /> {user._count.posts}</span>
                                            <span className="flex items-center gap-1"><Users size={10} /> {user._count.followers}</span>
                                        </div>
                                    </div>

                                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                                        <ArrowUpRight size={18} className="text-indigo-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
