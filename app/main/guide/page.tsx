"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Zap,
    Trophy,
    Rocket,
    CheckCircle2,
    ArrowRight,
    Star,
    Crown,
    Sparkles,
    MousePointer2,
    Users,
    Wallet,
    Bell,
    CreditCard,
    CalendarCheck,
    Gamepad2
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function GuidePage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
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
                {/* --- 00. Hero --- */}
                <section className="mb-20 md:mb-36 text-center">
                    <motion.div {...fadeInUp}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] md:text-[11px] font-black mb-6">
                            Textra 이용 가이드
                        </div>
                        <h1 className="text-4xl md:text-7xl font-[950] tracking-tighter leading-[1.1] md:leading-[1.05] mb-6 md:mb-8">
                            글쓰기가 <span className="text-indigo-500">가치</span>가 되는<br/>
                            가장 완벽한 방법
                        </h1>
                        <p className="text-base md:text-lg font-medium opacity-50 max-w-2xl mx-auto leading-relaxed px-2">
                            단순한 포스팅을 넘어 에디터로서의 커리어를 쌓으세요.<br className="hidden md:block"/>
                            활동량에 따른 투명한 보상과 등급별 혜택이 기다립니다.
                        </p>
                    </motion.div>
                </section>

                {/* --- 01. XP Rules --- */}
                <section className="mb-24 md:mb-32">
                    <div className="flex items-center gap-3 mb-8 md:mb-10">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">경험치 획득 방법</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { icon: Sparkles, label: "새 글 작성", xp: "+20", unit: "XP" },
                            { icon: Star, label: "좋아요 수령", xp: "+50", unit: "XP" },
                            { icon: MousePointer2, label: "조회수 5회", xp: "+1", unit: "XP" },
                            { icon: Trophy, label: "메달 수령", xp: "MAX", unit: "BONUS" },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white shadow-sm border-slate-100'}`}>
                                <item.icon size={18} className="text-indigo-500 mb-3 md:mb-4" />
                                <p className="text-[10px] md:text-xs font-bold opacity-40 mb-1">{item.label}</p>
                                <div className="text-xl md:text-2xl font-black">{item.xp}<span className="text-[10px] ml-1 opacity-40">{item.unit}</span></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 01-1. Attendance Rules --- */}
                <section className="mb-24 md:mb-32">
                    <div 
                        className="flex items-center gap-3 mb-8 md:mb-10 cursor-pointer group/att w-fit"
                        onClick={() => router.push('/main/attendance')}
                    >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover/att:scale-110 transition-transform">
                            <CalendarCheck size={18} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase group-hover/att:text-emerald-500 transition-colors">출석체크 보상</h2>
                            <span className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover/att:opacity-100 transition-all flex items-center gap-1">
                                출석체크 페이지로 이동 <ArrowRight size={10} />
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                        {[
                            { label: "1일 출석", xp: "100", unit: "XP" },
                            { label: "3일 연속", xp: "200", unit: "XP" },
                            { label: "5일 연속", xp: "300", unit: "XP" },
                            { label: "7일 연속", xp: "500", unit: "XP" },
                            { label: "14일 연속", xp: "700", unit: "XP" },
                            { label: "30일 연속", xp: "1,000", unit: "XP" },
                        ].map((item, i) => (
                            <div key={i} className={`p-5 rounded-2xl border ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white shadow-sm border-slate-100'}`}>
                                <p className="text-[10px] font-bold opacity-40 mb-1">{item.label}</p>
                                <div className="text-lg font-black text-emerald-500">{item.xp}<span className="text-[8px] ml-0.5 opacity-40 text-current">{item.unit}</span></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 01-2. Game Rules --- */}
                <section className="mb-24 md:mb-32">
                    <div 
                        className="flex items-center gap-3 mb-8 md:mb-10 cursor-pointer group/game w-fit"
                        onClick={() => router.push('/main/game')}
                    >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover/game:scale-110 transition-transform">
                            <Gamepad2 size={18} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase group-hover/game:text-indigo-500 transition-colors">미니 게임 보너스</h2>
                            <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover/game:opacity-100 transition-all flex items-center gap-1">
                                게임 페이지로 이동 <ArrowRight size={10} />
                            </span>
                        </div>
                    </div>

                    <div className={`p-8 md:p-10 rounded-[2.5rem] border ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-sm'} flex flex-col md:flex-row items-center justify-between gap-8`}>
                        <div className="space-y-4 max-w-md">
                            <h3 className="text-2xl font-black tracking-tighter">사이버 런</h3>
                            <p className="text-sm opacity-50 leading-relaxed">
                                장애물을 피해 최대한 멀리 달리세요! 획득한 점수는 즉시 경험치로 환산되어 여러분의 레벨업을 돕습니다.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black opacity-30 uppercase">적립 규칙</span>
                                    <span className="text-lg font-bold text-indigo-500">100점당 10 XP</span>
                                </div>
                                <div className="w-px h-8 bg-current opacity-10" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black opacity-30 uppercase">일일 한도</span>
                                    <span className="text-lg font-bold text-indigo-500">10판 / 1,000 XP</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push('/main/game')}
                            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            게임 시작하기
                        </button>
                    </div>
                </section>

                {/* --- 02. Medals --- */}
                <section className="mb-24 md:mb-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy size={20} className="text-amber-500" />
                                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">베스트 에디터</h2>
                            </div>
                            <p className="text-sm font-medium opacity-40 leading-relaxed text-balance">독자에게 받는 최고의 찬사, 높은 경험치와 수익을 동시에 얻으세요.</p>
                        </div>
                        <span className="text-[10px] opacity-30 ">* 한 게시물당 단 1명만 수여 가능</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { color: "from-amber-300 via-yellow-500 to-amber-600", title: "GOLD MEDAL", price: "4,900", receive: "4,000", xp: "100,000", shadow: "shadow-amber-500/20", desc: "단숨에 레벨 50 전문 에디터로 도약할 수 있는 최고의 보상" },
                            { color: "from-slate-200 via-slate-400 to-slate-500", title: "SILVER MEDAL", price: "1,900", receive: "1,400", xp: "20,000", shadow: "shadow-slate-400/20", desc: "프로 에디터로 향하는 성장의 가속도를 붙여주는 메달" },
                            { color: "from-orange-400 via-orange-600 to-orange-800", title: "BRONZE MEDAL", price: "900", receive: "700", xp: "10,000", shadow: "shadow-orange-600/20", desc: "시니어 에디터 승급을 위한 창작 활동의 첫 번째 결실" },
                        ].map((medal, i) => (
                            <div key={i} className={`group relative p-[1px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] ${medal.shadow}`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${medal.color}`} />
                                <div className={`relative h-full p-7 md:p-8 rounded-[2rem] md:rounded-[2.5rem] ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${medal.color} mb-5 md:mb-6 flex items-center justify-center text-white`}>
                                        <Trophy size={20} />
                                    </div>
                                    <h3 className="text-[11px] font-black tracking-widest opacity-50 mb-1">{medal.title}</h3>
                                    <div className="text-3xl md:text-4xl font-[1000] tracking-tighter mb-2">
                                        {medal.xp}<span className="text-sm font-bold opacity-30 ml-1">XP</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-5 md:mb-6">
                                        <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-black">작가 정산 포인트 {medal.receive}P</div>
                                    </div>
                                    <p className="text-sm font-medium opacity-60 leading-relaxed mb-6 md:mb-8 min-h-[40px]">{medal.desc}</p>
                                    <div className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${medal.color} text-white font-black text-center text-sm shadow-lg`}>
                                        ￦ {medal.price} 수여하기
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 03. Settlement Process (신규 추가 섹션) --- */}
                <section className="mb-24 md:mb-32">
                    <div className="flex items-center gap-3 mb-8 md:mb-10">
                        <Wallet size={20} className="text-emerald-500" />
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">투명한 정산 프로세스</h2>
                    </div>

                    <div className={`p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
                            {/* Step 1 */}
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black mb-6">01</div>
                                <h4 className="text-lg font-bold mb-3">수익 적립</h4>
                                <p className="text-sm opacity-50 leading-relaxed">받은 메달과 활동 등급에 따른 광고 기여 수익이 <span className="text-indigo-500 font-bold">내 포인트</span>로 실시간 적립됩니다.</p>
                            </div>
                            {/* Step 2 */}
                            <div className="relative z-10 cursor-pointer group" onClick={() => router.push('/main/settlement')}>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black mb-6 transition-all group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white">02</div>
                                <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    전환 신청
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </h4>
                                <p className="text-sm opacity-50 leading-relaxed">5,000P 이상 달성 시 <span className="font-bold underline text-indigo-500">정산 페이지</span>에서 네이버페이 포인트 쿠폰으로 전환을 신청하세요.</p>
                            </div>
                            {/* Step 3 */}
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black mb-6">03</div>
                                <h4 className="text-lg font-bold mb-3">쿠폰 발송</h4>
                                <p className="text-sm opacity-50 leading-relaxed text-balance">신청 후 1~3일 내에 <span className="text-amber-500 font-bold">이메일, 문자, 인앱 알림</span>을 통해 핀번호가 즉시 발송됩니다.</p>
                            </div>
                        </div>

                        <div className={`mt-12 p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-slate-50'} flex items-start gap-4`}>
                            <Bell size={20} className="text-indigo-500 mt-1 shrink-0" />
                            <div className="text-xs md:text-sm font-medium opacity-60 leading-relaxed">
                                <strong className="text-indigo-500">알림 확인 필수:</strong> 쿠폰 발송 시 가입된 연락처로 알림이 전송됩니다. 인앱 알림 시스템은 추후 모바일 앱 업데이트를 통해 더욱 편리하게 제공될 예정입니다.
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 04. Grade Roadmap --- */}
                <section className="mb-24 md:mb-32">
                    <div className="flex items-center gap-3 mb-8 md:mb-10">
                        <Rocket size={20} className="text-indigo-500" />
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">에디터 등급 로드맵</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {[
                            {
                                title: "Junior Editor",
                                lv: "Lv.01 - 10",
                                cond: "신규 에디터 기본 등급",
                                info: "Textra의 모든 커뮤니티 기능을 이용할 수 있습니다.",
                                benefit: ["일반 컬럼 작성 권한"],
                                color: "emerald",
                                isLocked: false
                            },
                            {
                                title: "Senior Editor",
                                lv: "Lv.11 - 30",
                                cond: "동메달 1개 수령 OR 경험치 누적 시 OR 좋아요 30개",
                                info: "본격적인 영향력을 발휘하기 시작하는 단계입니다.",
                                benefit: ["시니어 전용 배지"],
                                color: "blue",
                                isLocked: true
                            },
                            {
                                title: "Pro Editor",
                                lv: "Lv.31 - 49",
                                cond: "좋아요 50개 + 조회수 2,000 + 은메달 5개 + 금메달 1개 + 팔로워 10명",
                                info: "전문적인 지식을 공유하고 수익 창출이 가능합니다.",
                                benefit: ["전문 컬럼 작성 권한", "광고 수익 70% 포인트 보상"],
                                color: "purple",
                                isLocked: true,
                                highlight: true
                            },
                            {
                                title: "Professional",
                                lv: "MAX LEVEL",
                                cond: "좋아요 1,000개 + 조회수 10,000 + 금메달 10개 + 은메달 10개 + 팔로워 100명",
                                info: "최고의 창작자에게 주어지는 텍스트라 최고의 명예입니다.",
                                benefit: ["광고 수익 95% 포인트 보상", "메인 노출 우선권", "공식 엠버서더"],
                                color: "premium",
                                isLocked: true
                            }
                        ].map((grade, i) => {
                            const styles = {
                                emerald: {
                                    border: darkMode ? "border-emerald-500/20" : "border-emerald-100",
                                    bg: darkMode ? "bg-emerald-500/5" : "bg-emerald-50/50",
                                    text: "text-emerald-500",
                                    badge: "bg-emerald-500",
                                    icon: "text-emerald-500"
                                },
                                blue: {
                                    border: darkMode ? "border-blue-500/20" : "border-blue-100",
                                    bg: darkMode ? "bg-blue-500/5" : "bg-blue-50/50",
                                    text: "text-blue-500",
                                    badge: "bg-blue-500",
                                    icon: "text-blue-500"
                                },
                                purple: {
                                    border: darkMode ? "border-purple-500/30" : "border-purple-200",
                                    bg: darkMode ? "bg-purple-500/5" : "bg-purple-50/50",
                                    text: "text-purple-500",
                                    badge: "bg-purple-500",
                                    icon: "text-purple-500"
                                },
                                premium: {
                                    border: darkMode
                                        ? "border-amber-500/30 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]"
                                        : "border-amber-200 shadow-[0_10px_40px_-15px_rgba(245,158,11,0.2)]",
                                    bg: darkMode
                                        ? "bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#000000]"
                                        : "bg-gradient-to-br from-slate-900 via-[#1a1a1a] to-black",
                                    text: "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200",
                                    badge: "bg-gradient-to-r from-amber-400 to-amber-600",
                                    icon: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
                                    isPremium: true
                                }
                            }[grade.color || "emerald"];

                            return (
                                <div
                                    key={i}
                                    className={`relative p-7 md:p-12 rounded-[2rem] md:rounded-[3rem] border transition-all hover:scale-[1.01] ${styles.border} ${styles.bg} ${styles.isPremium && !darkMode ? 'text-white' : ''}`}
                                >
                                    {grade.highlight && (
                                        <div className={`absolute -top-2.5 left-8 md:left-12 px-3 py-1 ${styles.badge} text-white text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg`}>
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                                        <div className="md:w-1/3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`text-xl md:text-2xl font-[1000] ${styles.text}`}>{grade.title}</h3>
                                                {grade.isLocked && <Crown size={14} className={styles.icon} />}
                                            </div>
                                            <span className={`text-xs font-black tracking-tighter ${styles.isPremium ? 'text-amber-500/70' : 'opacity-60'}`}>{grade.lv}</span>
                                            <p className={`mt-3 text-sm font-medium leading-relaxed ${styles.isPremium ? 'text-slate-400' : 'opacity-40'}`}>{grade.info}</p>
                                        </div>

                                        <div className="flex-1 space-y-6 md:space-y-8">
                                            <div>
                                                <h4 className={`text-[11px] md:text-sm mb-2 md:mb-3 font-bold uppercase tracking-wider ${styles.isPremium ? 'text-amber-500/50' : 'opacity-30'}`}>레벨 달성 조건</h4>
                                                <p className={`text-sm font-bold leading-snug whitespace-pre-line ${styles.isPremium ? 'text-slate-200' : ''}`}>{grade.cond}</p>
                                            </div>
                                            <div>
                                                <h4 className={`text-[11px] md:text-sm mb-3 md:mb-4 font-bold uppercase tracking-wider ${styles.isPremium ? 'text-amber-500/50' : 'opacity-30'}`}>이용 가능 혜택</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {grade.benefit.map((b, j) => (
                                                        <div key={j} className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[11px] md:text-xs font-bold ${styles.isPremium ? 'bg-white/10 border border-white/10' : (darkMode ? 'bg-white/5' : 'bg-white border border-slate-100 shadow-sm')}`}>
                                                            <CheckCircle2 size={12} className={styles.icon} />
                                                            <span className={styles.isPremium ? 'text-slate-200' : ''}>{b}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- 05. Social & Tag --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-24 md:mb-32">
                    <div className={`p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <h3 className="text-lg md:text-xl font-black mb-5 md:mb-6 text-indigo-500">소셜 기능</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                                <span className="text-sm font-bold">팔로우 시스템</span>
                                <Users size={14} className="opacity-20" />
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                                <span className="text-sm font-bold">에디터 상세 프로필</span>
                                <ArrowRight size={14} className="opacity-20" />
                            </div>
                        </div>
                    </div>
                    <div className={`p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50/50'}`}>
                        <h3 className="text-lg md:text-xl font-black mb-5 md:mb-6 text-indigo-500">인기 태그</h3>
                        <p className="text-sm font-medium opacity-60 mb-5 md:mb-6 leading-relaxed">상위 5개의 핵심 태그를 통해<br/>가장 트렌디한 지식을 탐험하세요.</p>
                        <div className="flex flex-wrap gap-2">
                            {['IT', '생활', '연애', '꿀팁', '경제'].map(t => (
                                <span key={t} className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-bold">#{t}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- CTA --- */}
                <section className="text-center py-16 md:py-20 border-t border-white/5">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        <button
                            onClick={() => router.push('/main/write')}
                            className="group px-8 py-5 md:px-12 md:py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-[1000] rounded-2xl md:rounded-[2rem] text-lg md:text-xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center gap-3 md:gap-4 mx-auto"
                        >
                            지금 시작하기
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}