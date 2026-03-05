"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, ArrowRight, CheckCircle2, AlertCircle, History, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function SettlementPage() {
    const { darkMode } = useTheme();
    const { data: session, update } = useSession();
    const [points, setPoints] = useState(0);
    const [amount, setAmount] = useState("");
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetchUserData();
            fetchRequests();
        }
    }, [session]);

    const fetchUserData = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/user/${(session.user as any).id}`);
            if (res.ok) {
                const data = await res.json();
                setPoints(data.points || 0);
            }
        } catch (error) {
            console.error("Fetch user data error:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/settlement");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Fetch requests error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        const applyAmount = parseInt(amount);
        if (isNaN(applyAmount) || applyAmount < 5000) {
            toast.error("최소 5,000P 이상부터 신청 가능합니다.");
            return;
        }
        if (applyAmount > points) {
            toast.error("보유 포인트가 부족합니다.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/settlement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: applyAmount }),
            });

            if (res.ok) {
                const result = await res.json();
                toast.success(result.message);
                setPoints(result.newPoints);
                setAmount("");
                fetchRequests();
                // 세션 포인트 업데이트
                if (update) {
                    await update({
                        ...session,
                        user: { ...session.user, points: result.newPoints }
                    });
                }
            } else {
                const data = await res.json();
                toast.error(data.message || "정산 신청에 실패했습니다.");
            }
        } catch (error) {
            console.error("Apply settlement error:", error);
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading fullScreen />;

    return (
        <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}>
            <MainHeader />

            <main className="pt-24 md:pt-40 pb-20 max-w-4xl mx-auto px-5 md:px-6">
                <BackButton />
                <header className="mb-12 md:mb-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet className="text-amber-500" size={24} />
                            <h1 className="text-3xl md:text-5xl font-[950] tracking-tighter uppercase">정산 신청</h1>
                        </div>
                        <p className="text-sm md:text-base font-medium opacity-40 leading-relaxed max-w-xl">
                            에디터 활동을 통해 쌓은 포인트를 네이버페이 포인트 쿠폰으로 전환하세요.
                            <br />최소 5,000P부터 신청이 가능합니다.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* --- Left: Application Form --- */}
                    <section className="space-y-8">
                        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                            <div className="mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">보유 포인트</p>
                                <div className="text-4xl font-black text-amber-500">
                                    {points.toLocaleString()} <span className="text-sm font-bold opacity-30 ml-1 text-white">P</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block mb-3">신청 금액</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="5,000"
                                            className={`text-2xl font-black h-16 rounded-2xl border-2 px-6 focus-visible:ring-indigo-500 transition-all ${darkMode ? 'bg-white/5 border-white/5 focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500'}`}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black opacity-30">P</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {[5000, 10000, 50000].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => setAmount(v.toString())}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                                        >
                                            +{v.toLocaleString()}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setAmount(points.toString())}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${darkMode ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                    >
                                        전액
                                    </button>
                                </div>
                            </div>

                            <Button 
                                onClick={handleApply}
                                disabled={isSubmitting || !amount || parseInt(amount) < 5000 || parseInt(amount) > points}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-[1000] rounded-2xl text-lg shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-20"
                            >
                                {isSubmitting ? "신청 중..." : "정산 신청하기"}
                            </Button>
                        </div>

                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                <div className="text-xs font-medium opacity-60 leading-relaxed">
                                    <strong className="text-indigo-500">필독 사항:</strong> 정산 신청된 포인트는 취소가 불가능하며, 영업일 기준 1-3일 내에 회원가입 시 기재된 연락처로 네이버페이 포인트 쿠폰이 발송됩니다.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Right: History --- */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <History size={16} className="opacity-40" />
                                최근 신청 내역
                            </h3>
                            <span className="text-[10px] font-bold opacity-30">최근 10건</span>
                        </div>

                        <div className="space-y-3">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <div 
                                        key={req.id} 
                                        className={`p-5 rounded-[1.5rem] border flex items-center justify-between transition-all ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-sm'}`}
                                    >
                                        <div>
                                            <div className="text-sm font-black mb-1">{req.amount.toLocaleString()} P</div>
                                            <div className="text-[10px] font-bold opacity-30">{new Date(req.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {req.status === "PENDING" && (
                                                <Badge variant="outline" className="rounded-full px-2 py-0 text-[9px] border-amber-500/30 text-amber-500 font-bold bg-amber-500/5">대기 중</Badge>
                                            )}
                                            {req.status === "COMPLETED" && (
                                                <Badge variant="outline" className="rounded-full px-2 py-0 text-[9px] border-emerald-500/30 text-emerald-500 font-bold bg-emerald-500/5">지급 완료</Badge>
                                            )}
                                            {req.status === "REJECTED" && (
                                                <Badge variant="outline" className="rounded-full px-2 py-0 text-[9px] border-red-500/30 text-red-500 font-bold bg-red-500/5">거절됨</Badge>
                                            )}
                                            <ChevronRight size={14} className="opacity-10" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-20 italic text-sm">
                                    신청 내역이 없습니다.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
