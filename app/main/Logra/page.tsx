"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    MessageSquare,
    Layout,
    ArrowRight,
    CheckCircle2,
    Check,
    FileText,
    Image as ImageIcon,
    Heart,
    Send,
    Star,
    Sparkle,
    Zap,
    Crown,
    Cpu,
    Layers,
    Settings2,
    Workflow
} from "lucide-react";

export default function LograExclusivePage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const { data: session, update } = useSession();
    const [mounted, setMounted] = useState(false);
    const [activeProcessStep, setActiveProcessStep] = useState(0);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (planName: string) => {
        if (!session) {
            alert("먼저 로그인이 필요합니다.");
            router.push("/auth/signin");
            return;
        }

        setIsSubscribing(true);
        try {
            console.log(`Subscribing to ${planName}...`);
            const res = await fetch("/api/user/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planName.toUpperCase() }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                console.log("Subscription success:", data);
                // 세션 업데이트 - auth.ts의 jwt 콜백 구조에 맞춰 user 객체로 전달
                await update({
                    user: {
                        lograSubscription: planName.toUpperCase(),
                        lograUsageCount: 0,
                        lograNextReset: new Date(new Date().setMonth(new Date().getMonth() + 1))
                    }
                });
                alert(`${planName} 구독이 시작되었습니다!`);
                router.push("/main/write/logra/logra_free");
            } else {
                console.error("Subscription failed:", data);
                const errorMessage = data.error || data.message || res.statusText;
                alert(`구독 중 오류가 발생했습니다 (${res.status}): ${errorMessage}`);
            }
        } catch (error: any) {
            console.error("Subscription error:", error);
            alert(`구독 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
        } finally {
            setIsSubscribing(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setActiveProcessStep((prev) => (prev + 1) % 3);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    // Logra 보라색 테마 데이터
    const lograData = {
        name: "LOGRA",
        desc: "Life Log Stylist",
        slogan: "사소한 일상이 특별한 기록이 되는 순간",
        accent: "text-violet-500",
        bg: "bg-violet-600",
        lightBg: "bg-violet-500/10",
        chat: "지난주 성수동 팝업스토어 투어 다녀온 후기 써줘. 사진은 10장 정도 있어!",
        interview: [
            "가장 인상 깊었던 팝업스토어 한 곳을 꼽는다면요?",
            "웨이팅 꿀팁이나 예약 방법을 독자들에게 공유할까요?",
            "투어 동선을 지도 형태로 시각화해 드릴까요?"
        ],
        assetTitle: "목표 주제 확인 및 포스트 작성 구조 맵핑",
        resultTitle: "성수동 200% 즐기기: 이번 주 놓치면 안 될 팝업 정복기",
        resultTag: "#성수동 #주말데이트 #팝업스토어",
        resultText: "단순히 다녀온 기록을 넘어, 독자들이 바로 활용할 수 있는 실질적인 가이드와 감성적인 무드를 담아냈습니다."
    };

    // 구독 플랜 데이터
    const pricingPlans = [
        {
            name: "Free",
            price: "0",
            desc: "Logra의 감성을 가볍게 경험해보세요",
            features: [
                "월 포스트 10개 생성",
                "기본 고정 AI 모델 적용",
                "표준 레이아웃 제공",
                "기본 인터뷰 프로세스"
            ],
            icon: <Zap size={24} className="text-slate-400" />,
            buttonText: "무료로 시작하기",
            recommended: false
        },
        {
            name: "Standard",
            price: "4,900",
            desc: "매일의 기록을 소중히 여기는 로거를 위해",
            features: [
                "월 포스트 30개 생성",
                "단일 AI 모델 (자유로운 모델 변경)",
                "고급 스타일 필터 및 테마",
                "우선 순위 대기열 적용"
            ],
            icon: <Settings2 size={24} className="text-violet-500" />,
            buttonText: "스탠다드 구독하기",
            recommended: true
        },
        {
            name: "Pro",
            price: "9,900",
            desc: "멀티모달 AI가 선사하는 최상의 퀄리티",
            features: [
                "월 포스트 무제한 생성",
                "멀티모달 하이브리드 AI 엔진",
                "작성 구조 자동 최적화 맵핑",
                "전용 커스텀 디자인 레이아웃"
            ],
            icon: <Crown size={24} className="text-amber-500" />,
            buttonText: "프로 무제한 시작",
            recommended: false
        }
    ];

    return (
        <div className={`min-h-screen transition-all duration-700 selection:bg-violet-500 selection:text-white
        ${darkMode ? 'bg-[#08070b] text-white' : 'bg-[#f8f7ff] text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-32">
                <div className="mb-16">
                    <BackButton />
                </div>

                {/* --- Hero Section --- */}
                <section className="text-center mb-24 md:mb-44 relative">
                    <motion.div
                        animate={{
                            backgroundColor: "rgba(139, 92, 246, 0.15)"
                        }}
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[300px] md:w-[700px] h-[300px] md:h-[700px] rounded-full blur-[100px] md:blur-[180px] pointer-events-none transition-colors duration-1000"
                    />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Badge className="mb-6 md:mb-8 px-4 md:px-5 py-1 md:py-1.5 rounded-full bg-violet-500/10 text-violet-500 border-none font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase">
                            AI Life Stylist
                        </Badge>

                        <h1 className="text-5xl md:text-[11rem] font-[1000] tracking-tighter leading-[0.8] mb-8 md:mb-12 uppercase">
                            LOG<span className="text-violet-500">RA</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-base md:text-2xl font-bold leading-relaxed opacity-60 mb-12 md:mb-16 break-keep tracking-tight px-4">
                            {lograData.slogan} <br className="hidden md:block"/>
                            당신의 경험은 기록될 때 비로소 가치가 됩니다.
                        </p>

                        <Button
                            onClick={() => {
                                if (session?.user && (session.user as any).lograSubscription && (session.user as any).lograSubscription !== 'NONE') {
                                    router.push("/main/write/logra/logra_free");
                                } else {
                                    const pricingSection = document.getElementById('pricing');
                                    pricingSection?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className={`h-14 md:h-18 px-8 md:px-14 rounded-2xl md:rounded-3xl text-white font-[1000] text-lg tracking-widest gap-4 shadow-2xl shadow-violet-500/30 transition-all hover:-translate-y-2 hover:shadow-violet-500/50 bg-violet-600`}
                        >
                            <Sparkles size={20} className="md:w-6 md:h-6" /> 구독하기
                        </Button>
                    </motion.div>
                </section>

                {/* --- How It Works --- */}
                <section className="mb-24 md:mb-48 relative z-10">
                    <div className="text-center mb-12 md:mb-16 space-y-2 md:space-y-4 px-4">
                        <h2 className="text-2xl md:text-5xl font-[1000] tracking-tighter uppercase">포스트 생성과정</h2>
                        <p className="opacity-40 font-bold text-sm md:text-lg">AI 작가가 당신의 기억을 문장으로 빚어내는 방식</p>
                    </div>

                    <div className={`rounded-[2rem] md:rounded-[4rem] border overflow-hidden shadow-[0_32px_64px_-16px_rgba(139,92,246,0.1)] transition-all duration-500 ${darkMode ? 'bg-[#0f0e14] border-white/5' : 'bg-white border-violet-100'}`}>
                        {/* Step Tabs */}
                        <div className="grid grid-cols-3 border-b border-violet-500/10">
                            {[
                                { step: 1, title: "기억의 공유", icon: <MessageSquare size={16} /> },
                                { step: 2, title: "감각의 시각화", icon: <Layout size={16} /> },
                                { step: 3, title: "작품의 완성", icon: <Send size={16} /> }
                            ].map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveProcessStep(idx)}
                                    className={`flex flex-col items-center justify-center p-4 md:p-8 gap-2 md:gap-3 transition-all ${activeProcessStep === idx ? `bg-violet-500/5 border-b-4 border-violet-500 text-violet-500` : 'opacity-20 hover:opacity-40'}`}
                                >
                                    <div className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em] flex items-center gap-1.5 md:gap-2">
                                        {tab.icon} <span className="hidden xs:inline">Step 0{tab.step}</span>
                                    </div>
                                    <span className="text-[11px] md:text-sm font-black hidden sm:block">{tab.title}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 md:p-20 min-h-[400px] md:min-h-[550px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {/* STEP 1: INTERVIEW */}
                                {activeProcessStep === 0 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6 md:space-y-10 w-full max-w-3xl">
                                        <div className="flex justify-end">
                                            <div className={`max-w-[85%] p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] rounded-tr-none text-sm md:text-base font-bold shadow-sm ${darkMode ? 'bg-violet-500/20 text-violet-100' : 'bg-violet-50 text-violet-900'}`}>
                                                "{lograData.chat}"
                                            </div>
                                        </div>
                                        <div className="flex gap-4 md:gap-6">
                                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl bg-violet-600`}>
                                                <Heart size={20} className="md:w-7 md:h-7" />
                                            </div>
                                            <div className={`p-5 md:p-8 rounded-2xl md:rounded-[3rem] rounded-tl-none border shadow-sm space-y-4 md:space-y-6 flex-1 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-violet-100'}`}>
                                                <p className="text-sm md:text-md font-bold leading-relaxed">
                                                    멋진 외출이셨겠네요! 그날의 분위기를 독자들에게 생생하게 전달하기 위해 몇 가지만 더 여쭤볼게요.
                                                </p>
                                                <div className="space-y-3 md:space-y-4">
                                                    {lograData.interview.map((q, i) => (
                                                        <div key={i} className="flex gap-3 md:gap-4 text-[12px] md:text-sm font-bold opacity-70 group cursor-default">
                                                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform`}>
                                                                <Check size={12} strokeWidth={4} />
                                                            </div>
                                                            {q}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: ASSETS */}
                                {activeProcessStep === 1 && (
                                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6 md:space-y-10 w-full">
                                        <div className="text-center space-y-2 md:space-y-3">
                                            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                                <Sparkle size={10} className="md:w-3 md:h-3" /> Lifestyle Post
                                            </div>
                                            <h3 className="text-xl md:text-3xl font-[1000] tracking-tighter px-4">{lograData.assetTitle}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                            <div className="p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-violet-500/5 bg-violet-500/[0.02] flex flex-col justify-center gap-4 md:gap-8 group hover:border-violet-500/20 transition-colors">
                                                <div className="flex items-center gap-2 opacity-30 font-black text-[10px] md:text-[11px] uppercase tracking-widest">
                                                    <ImageIcon size={14} className="md:w-4 md:h-4" /> Moodboard & Map
                                                </div>
                                                <div className="w-full h-40 md:h-48 bg-violet-500/5 rounded-2xl md:rounded-3xl border border-dashed border-violet-500/20 flex items-center justify-center text-[10px] md:text-xs font-black opacity-30 text-center p-6 md:p-10 uppercase leading-relaxed">
                                                    [ 성수동 팝업 핫플레이스 <br/> 감성 매핑 & 타임라인 인포그래픽 ]
                                                </div>
                                            </div>
                                            <div className="p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-violet-500/5 bg-violet-500/[0.02] flex flex-col justify-center gap-4 md:gap-8 group hover:border-violet-500/20 transition-colors">
                                                <div className="flex items-center gap-2 opacity-30 font-black text-[10px] md:text-[11px] uppercase tracking-widest">
                                                    <FileText size={14} className="md:w-4 md:h-4" /> Structured Info
                                                </div>
                                                <div className={`w-full p-6 md:p-8 rounded-2xl md:rounded-3xl font-medium text-[12px] md:text-sm leading-relaxed ${darkMode ? 'bg-black/40 text-violet-200/50' : 'bg-white text-violet-900/50'} border border-violet-500/5`}>
                                                    <div className="space-y-2 md:space-y-3 italic">
                                                        <p>• 팝업 리스트: 아더에러, 탬버린즈 외 3곳</p>
                                                        <p>• 평균 대기시간: 45분 (오전 방문 추천)</p>
                                                        <p>• 추천 동선: 성수역 4번 출구 → 연무장길</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: FINAL */}
                                {activeProcessStep === 2 && (
                                    <motion.div key="step3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-3xl">
                                        <div className={`p-8 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] border shadow-2xl relative ${darkMode ? 'bg-[#121118] border-white/5' : 'bg-white border-violet-100'}`}>
                                            <div className="flex justify-between items-start mb-8 md:mb-12">
                                                <div className="space-y-3 md:space-y-4 min-w-0">
                                                    <span className="text-[10px] md:text-[11px] font-[1000] text-violet-500">Logra Engine Style</span>
                                                    <h1 className="text-2xl md:text-5xl font-[1000] tracking-tighter leading-tight truncate md:whitespace-normal">{lograData.resultTitle}</h1>
                                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                                        {lograData.resultTag.split(' ').map((tag, idx) => (
                                                            <span key={idx} className="text-[10px] md:text-[11px] font-black opacity-40 hover:opacity-100 transition-opacity cursor-default">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/20 bg-violet-600`}>
                                                    <CheckCircle2 size={20} className="md:w-7 md:h-7" />
                                                </div>
                                            </div>

                                            <p className="text-sm md:text-lg opacity-70 leading-relaxed font-medium mb-8 md:mb-12 break-keep">
                                                {lograData.resultText}
                                            </p>

                                            <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-l-8 bg-violet-500/5 border-violet-500`}>
                                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                                    <Star size={12} className="text-violet-500 fill-violet-500" />
                                                    <span className="text-[10px] md:text-[11px] font-[1000] uppercase tracking-widest text-violet-500">Logra's Magic Touch</span>
                                                </div>
                                                <p className="text-[13px] md:text-base font-bold italic opacity-80 leading-relaxed">
                                                    "단순한 나열이 아닌, 독자의 호기심을 자극하는 문체와 시각적 배치를 적용하여 체류 시간을 극대화했습니다."
                                                </p>
                                            </div>

                                            <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-violet-500/10 flex justify-center">
                                                <Button className={`h-14 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-sm gap-4 bg-violet-600 text-white hover:scale-105 transition-transform`}>
                                                    포스트 결과 확인하기 <ArrowRight size={16} className="md:w-5 md:h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Pricing Section --- */}
                <section id="pricing" className="mb-24 md:mb-48 relative z-10">
                    <div className="text-center mb-12 md:mb-20 space-y-2 md:space-y-4 px-4">
                        <h2 className="text-3xl md:text-6xl font-[1000] tracking-tighter uppercase italic">Logra Pricing</h2>
                        <p className="opacity-40 font-bold text-sm md:text-lg">당신의 기록 주기에 맞는 플랜을 선택하세요</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {pricingPlans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className={`relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border transition-all duration-500 flex flex-col h-full
                                    ${plan.recommended ? 'border-violet-500 shadow-[0_32px_64px_-16px_rgba(139,92,246,0.2)] bg-violet-500/5' :
                                    (darkMode ? 'bg-[#0f0e14] border-white/5' : 'bg-white border-slate-100')}`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] md:text-[10px] font-black px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-[1000] tracking-tighter">{plan.name} 구독</h3>
                                    <p className="text-[13px] md:text-sm font-bold opacity-40 leading-snug">{plan.desc}</p>
                                </div>

                                <div className="mb-8 md:mb-10 flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-[1000] tracking-tighter">₩{plan.price}</span>
                                    <span className="text-[12px] md:text-sm font-black opacity-30 tracking-widest uppercase">/ 월</span>
                                </div>

                                <div className="space-y-3 md:space-y-4 mb-10 md:mb-12 flex-1">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3 text-[12px] md:text-sm font-bold opacity-70">
                                            <div className="w-4.5 h-4.5 md:w-5 md:h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                            <span className="break-keep">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(plan.name)}
                                    disabled={isSubscribing}
                                    className={`h-14 md:h-16 w-full rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all
                                        ${plan.recommended ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' :
                                        (darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-900 text-white hover:bg-slate-800')}`}
                                >
                                    {isSubscribing ? "처리 중..." : plan.buttonText}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pro Plan Multi-modal Detail Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`mt-8 md:mt-12 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-dashed flex flex-col md:flex-row items-center gap-6 md:gap-10 justify-between
                        ${darkMode ? 'border-white/10 bg-violet-500/5' : 'border-violet-200 bg-violet-50/50'}`}
                    >
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-center md:text-left">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shrink-0 shadow-2xl">
                                <Workflow size={28} className="md:w-9 md:h-9" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h4 className="text-lg md:text-2xl font-[1000] tracking-tight">Pro Multi-modal Engine</h4>
                                    <Badge className="bg-amber-500 text-white border-none font-black text-[8px] md:text-[9px] uppercase">Enterprise</Badge>
                                </div>
                                <p className="text-[12px] md:text-sm font-bold opacity-50 break-keep leading-relaxed max-w-xl">
                                    로그라 프로는 단일 모델의 한계를 넘습니다. 여러 AI 모델이 각자의 강점(문맥 이해, 정보 최적화, 감성 묘사)을 발휘하여 포스트의 구조를 먼저 맵핑한 후 최종 결과물을 빚어냅니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {["GPT-5.4", "Claude 3.5", "Gemini 3.0 flash"].map((model) => (
                                <div key={model} className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] tracking-widest opacity-60 uppercase font-black">{model}</div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* --- Footer CTA --- */}
                <section className="px-2">
                    <div className={`p-16 md:p-44 rounded-[3rem] md:rounded-[7rem] text-center space-y-8 md:space-y-12 relative overflow-hidden transition-all bg-violet-950 text-violet-100`}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[900px] h-[400px] md:h-[900px] border border-violet-500/20 rounded-full pointer-events-none"
                        />
                        <div className="relative z-10 space-y-6 md:space-y-8">
                            <h2 className="text-4xl md:text-[7rem] font-[1000] tracking-tighter uppercase leading-none break-keep">
                                Your Life <br className="md:hidden"/> Is A Story
                            </h2>
                            <p className="text-base md:text-2xl font-bold opacity-60 tracking-tight px-4 break-keep">당신의 일상을 가장 우아한 기록으로 만들어 드릴게요.</p>
                            {/*<Button className={`h-16 md:h-22 px-10 md:px-16 rounded-2xl md:rounded-[2.5rem] bg-white text-violet-950 text-xl md:text-2xl font-black tracking-widest hover:scale-110 transition-all shadow-2xl w-full sm:w-auto`}>*/}
                            {/*    구독하기*/}
                            {/*</Button>*/}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 md:py-24 text-center border-t border-violet-500/10">
                <p className="text-[10px] md:text-[11px] opacity-30 tracking-widest">
                    Logra Lifestyle Engine v1.1.0 • Powered by Textra Studio 2026
                </p>
            </footer>
        </div>
    );
}