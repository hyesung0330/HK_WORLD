"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    MessageSquare,
    Zap,
    Layout,
    GitBranch,
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Terminal,
    Cpu,
    Check,
    FileText,
    Image as ImageIcon,
    PenTool
} from "lucide-react";

export default function CoderaPage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeExample, setActiveExample] = useState(0);
    const [activeProcessStep, setActiveProcessStep] = useState(0);

    useEffect(() => {
        setMounted(true);

        // 프로세스 섹션 자동 순환 타이머 (옵션)
        const timer = setInterval(() => {
            setActiveProcessStep((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    // 상세한 AI 생성 예시 데이터 (결과물 프리뷰용)
    const examples = [
        {
            tag: "DevOps / Infrastructure",
            title: "Docker 이미지 최적화 전략",
            chat: "도커 이미지 용량 줄이는 과정에 관한 글을 작성해줘. 멀티 스테이지 빌드를 중심으로!",
            result: {
                title: "Next.js 애플리케이션 Docker 이미지 90% 감량 가이드",
                content: "프로덕션 환경에서 이미지 용량은 배포 속도와 직결됩니다. 불필요한 캐시와 빌드 도구를 제거하는 멀티 스테이지 빌드 기법을 적용해 보겠습니다.",
                code: `# 1단계: 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: 실행 스테이지 (최종 이미지)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]`,
                table: [
                    { label: "Standard Build (node:18)", value: "1.22 GB", color: "text-red-500" },
                    { label: "Alpine Base Build", value: "485 MB", color: "text-yellow-500" },
                    { label: "Multi-stage + Alpine (Final)", value: "118 MB", color: "text-emerald-500" }
                ],
                insight: "멀티 스테이지 빌드를 통해 빌드 환경(devDependencies)을 최종 이미지에서 분리함으로써, 보안 성능과 배포 효율을 동시에 잡았습니다."
            }
        },
        {
            tag: "Backend / Database",
            title: "Prisma N+1 성능 해결",
            chat: "Prisma에서 대량 데이터를 조회할 때 발생하는 N+1 문제를 해결하고 성능을 비교하는 글을 써줘.",
            result: {
                title: "Prisma $transaction과 Fluent API로 쿼리 최적화하기",
                content: "루프 안에서 쿼리를 호출하는 실수는 서비스 성능 저하의 주범입니다. Prisma의 include 전략과 배치 처리를 통해 이를 어떻게 해결하는지 알아봅니다.",
                code: `// 기존의 비효율적인 방식 (N+1 발생)
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// Codera 추천: include를 사용한 최적화 (1개 쿼리)
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true }
});`,
                table: [
                    { label: "Loop Query (100 items)", value: "101 Queries", color: "text-red-500" },
                    { label: "Include / Batch Strategy", value: "1 Query", color: "text-emerald-500" },
                    { label: "Execution Time", value: "-98.2%", color: "text-emerald-500" }
                ],
                insight: "데이터베이스 왕복 횟수(Round-trip)를 단 1회로 줄여, 네트워크 레이턴시가 획기적으로 개선되었습니다."
            }
        }
    ];

    const features = [
        {
            icon: <MessageSquare className="text-indigo-500" size={24} />,
            title: "컨텍스트 기반 질문",
            description: "AI가 당신의 답변을 분석해 '성능 최적화는 고려하셨나요?' 같은 날카로운 질문을 던져 글의 깊이를 더합니다."
        },
        {
            icon: <Cpu className="text-purple-500" size={24} />,
            title: "멀티모달 데이터 생성",
            description: "단순 텍스트를 넘어 기술 블로그에 필수적인 벤치마크 표와 아키텍처 다이어그램 이미지를 자동으로 렌더링합니다."
        },
        {
            icon: <GitBranch className="text-emerald-500" size={24} />,
            title: "VCS 오토 파이프라인",
            description: "Git Push 발생 시 변경된 Diff를 분석하여, 해당 기능에 대한 기술적 설명과 구현 의도를 담은 초안을 즉시 생성합니다."
        }
    ];

    return (
        <div className={`min-h-screen transition-all duration-700 selection:bg-indigo-500 selection:text-white
        ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 md:pb-32">
                <div className="mb-16">
                    <BackButton />
                </div>

                {/* --- Hero Section --- */}
                <section className="text-center mb-24 md:mb-40 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[160px] pointer-events-none"
                    />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex justify-center mb-6 md:mb-8">
                            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest opacity-60">Multimodal Intelligence</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-9xl font-[1000] tracking-tighter leading-[0.85] mb-8 md:mb-10 uppercase">
                            CODE<span className="text-indigo-500">RA</span>
                        </h1>
                        <p className={`max-w-2xl mx-auto text-lg md:text-xl font-bold leading-relaxed opacity-50 mb-10 md:mb-14 break-keep tracking-tight px-4 md:px-0`}>
                            개발자를 위한 지능형 라이팅 파트너. <br className="hidden md:block"/>
                            대화 한 번으로 코드, 표, 이미지가 포함된 전문 기술 글을 완성하세요.
                        </p>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6">
                            <Button
                                onClick={() => router.push('/main/write?mode=codera')}
                                className="w-full md:w-auto h-16 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-[1000] text-lg tracking-widest gap-3 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1"
                            >
                                <Sparkles size={20} /> 무료로 시작하기
                            </Button>
                            <div className="w-full md:w-auto flex justify-center items-center gap-4 px-6 py-3 rounded-2xl border border-current/10 bg-current/[0.02]">
                                <span className="text-xs font-black tracking-widest opacity-60">무료로 10번 이용 가능</span>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* --- How Codera Works (집필 프로세스 시뮬레이션) --- */}
                <section className="mb-24 md:mb-48 relative z-10">
                    <div className="text-center mb-12 md:mb-16 px-4">
                        <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-500 px-6 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">포스트 생성과정</Badge>
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter uppercase break-keep">어떻게 글을 작성하나요?</h2>
                        <p className="opacity-40 font-bold text-sm md:text-base break-keep">단순히 글을 지어내는 것이 아닙니다. 전문 작가처럼 설계하고 검증합니다.</p>
                    </div>

                    <div className={`rounded-[2rem] md:rounded-[3rem] border overflow-hidden shadow-2xl ${darkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}>
                        {/* 프로세스 네비게이션 탭 */}
                        <div className="grid grid-cols-3 border-b border-current/5">
                            {[
                                { step: 1, title: "인터뷰 & 컨텍스트 파악", icon: <MessageSquare size={16} /> },
                                { step: 2, title: "멀티모달 에셋 렌더링", icon: <Layout size={16} /> },
                                { step: 3, title: "마크다운 & SEO 최적화", icon: <PenTool size={16} /> }
                            ].map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveProcessStep(idx)}
                                    className={`flex flex-col items-center justify-center p-4 md:p-6 gap-2 md:gap-3 transition-all ${activeProcessStep === idx ? 'bg-indigo-500/5 border-b-2 border-indigo-500 text-indigo-500' : 'opacity-40 hover:opacity-100 hover:bg-current/5'}`}
                                >
                                    <div className="flex items-center gap-2 font-black text-[10px] md:text-sm tracking-tight">
                                        {tab.icon} <span className="whitespace-nowrap">Step 0{tab.step}</span>
                                    </div>
                                    <span className="text-[10px] font-bold hidden md:block">{tab.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* 프로세스 시뮬레이션 화면 */}
                        <div className="p-6 md:p-12 min-h-[400px] md:min-h-[450px] relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
                            <AnimatePresence mode="wait">
                                {/* STEP 1: 인터뷰 */}
                                {activeProcessStep === 0 && (
                                    <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-3xl mx-auto">
                                        <div className="flex justify-end">
                                            <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl rounded-tr-none text-xs md:text-sm font-bold shadow-sm ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                                                도커 이미지 용량 줄이는 법에 대해 블로그 글 좀 써줘.
                                            </div>
                                        </div>
                                        <div className="flex gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                                <Sparkles size={16} className="md:w-5 md:h-5" />
                                            </div>
                                            <div className={`p-5 rounded-[1.5rem] md:rounded-[2rem] rounded-tl-none border shadow-sm space-y-4 ${darkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'}`}>
                                                <p className="text-xs md:text-sm font-bold leading-relaxed">
                                                    좋은 주제입니다! 기술 블로그의 깊이를 더하기 위해 몇 가지 방향성을 여쭤볼게요.
                                                </p>
                                                <ul className="space-y-2 text-xs md:text-sm opacity-80 font-medium">
                                                    <li className="flex items-start gap-2"><Check size={14} className="text-indigo-500 shrink-0 mt-0.5" /> <span><strong>대상 독자:</strong> 주니어 개발자</span></li>
                                                    <li className="flex items-start gap-2"><Check size={14} className="text-indigo-500 shrink-0 mt-0.5" /> <span><strong>핵심 기술:</strong> 멀티 스테이지 빌드</span></li>
                                                </ul>
                                                <div className="mt-4 pt-4 border-t border-current/5">
                                                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">Codera Insight</span>
                                                    <p className="text-[10px] md:text-xs opacity-60 mt-1 font-bold">당신의 의도를 먼저 파악하고 글의 뼈대를 설계합니다.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: 멀티모달 에셋 */}
                                {activeProcessStep === 1 && (
                                    <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-4xl mx-auto">
                                        <div className="text-center space-y-2 mb-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                                                <Zap size={12} className="animate-pulse" /> Generating Assets
                                            </div>
                                            <h3 className="text-xl font-black">글에 들어갈 시각 자료와 코드를 준비합니다</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* 시각 자료 및 표 렌더링 영역 */}
                                            <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                <div className="flex items-center gap-2 mb-4 opacity-50">
                                                    <ImageIcon size={16} /> <span className="text-xs font-black uppercase tracking-widest">Architecture Diagram</span>
                                                </div>
                                                <div className="w-full h-32 bg-current/5 rounded-xl border border-current/10 flex items-center justify-center mb-6 overflow-hidden">
                                                    <div className="text-xs font-bold opacity-40"></div>
                                                </div>
                                                <table className="w-full text-left text-xs">
                                                    <thead className="border-b border-current/10 opacity-50">
                                                    <tr><th className="pb-2">빌드 방식</th><th className="pb-2 text-right">용량</th></tr>
                                                    </thead>
                                                    <tbody>
                                                    <tr><td className="py-2 font-bold">기본 빌드</td><td className="py-2 text-right text-red-500 font-bold">1.2GB</td></tr>
                                                    <tr className="border-t border-current/5"><td className="py-2 font-bold">멀티 스테이지</td><td className="py-2 text-right text-emerald-500 font-black">120MB</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* 코드 스니펫 렌더링 영역 */}
                                            <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                <div className="flex items-center gap-2 mb-4 opacity-50">
                                                    <Terminal size={16} /> <span className="text-xs font-black uppercase tracking-widest">Optimized Dockerfile</span>
                                                </div>
                                                <pre className="p-4 rounded-xl bg-[#0d1117] text-indigo-300 text-[10px] font-mono leading-relaxed border border-white/5 shadow-inner overflow-x-auto h-[170px]">
                                                    <code>{`# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]`}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: 마크다운 문서 */}
                                {activeProcessStep === 2 && (
                                    <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                                        <div className={`p-8 md:p-10 rounded-[2rem] border shadow-lg ${darkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center justify-between mb-8 border-b border-current/10 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={18} className="text-indigo-500" />
                                                    <span className="text-sm font-black opacity-60 uppercase tracking-widest">Final Markdown Draft</span>
                                                </div>
                                                <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-full h-8 px-4 font-bold">
                                                    Velog로 내보내기
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                <h1 className="text-3xl font-black tracking-tight">Next.js Docker 이미지 90% 줄이기 (멀티 스테이지 빌드)</h1>
                                                <div className="flex gap-2">
                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">#Docker</span>
                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">#Next.js</span>
                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">#DevOps</span>
                                                </div>
                                                <p className="text-sm opacity-70 leading-relaxed font-medium mt-6">
                                                    프로덕션 환경에서 무거운 Docker 이미지는 배포 속도 저하와 리소스 낭비의 주범입니다. 이번 포스팅에서는 Node.js의 불필요한 빌드 도구와 캐시를 제거하여 이미지를 경량화하는 <strong>멀티 스테이지 빌드(Multi-stage build)</strong> 기법을 알아보겠습니다.
                                                </p>
                                                <h3 className="text-lg font-black mt-6 border-l-4 border-indigo-500 pl-3">1. 왜 멀티 스테이지인가?</h3>
                                                <p className="text-sm opacity-70 leading-relaxed font-medium">
                                                    기존 방식대로 빌드하면 1.2GB에 달하던 이미지가, 빌드용 컨테이너와 실행용 컨테이너를 분리함으로써 120MB 수준으로 대폭 감소합니다.
                                                </p>
                                                {/* Fade out effect at bottom to show it's a snippet */}
                                                <div className="h-20 bg-gradient-to-t from-white dark:from-[#111] to-transparent absolute bottom-8 left-8 right-8 pointer-events-none" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Interactive Example Section (최종 결과물 전시) --- */}
                <section className="mb-24 md:mb-48">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter uppercase break-keep">실제 생성 예시</h2>
                        <p className="opacity-40 font-bold text-sm md:text-base break-keep px-4">코데라가 만드는 글의 퀄리티를 직접 확인해 보세요.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                        {/* 왼쪽 선택 리스트 */}
                        <div className="lg:col-span-5 space-y-3 md:space-y-4">
                            {examples.map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveExample(i)}
                                    className={`w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-left transition-all border group ${
                                        activeExample === i
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-600/20 lg:translate-x-4'
                                            : 'bg-transparent border-current/10 opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest mb-2 md:mb-3 block ${activeExample === i ? 'text-white/60' : 'text-indigo-500'}`}>
                                        {ex.tag}
                                    </span>
                                    <p className="font-black text-lg md:text-xl mb-1 tracking-tight">{ex.title}</p>
                                    <p className={`text-[10px] md:text-xs ${activeExample === i ? 'text-white/70' : 'opacity-50'}`}>클릭하여 생성 결과 보기</p>
                                </button>
                            ))}
                        </div>

                        {/* 오른쪽 프리뷰 창 */}
                        <div className="lg:col-span-7 mt-4 lg:mt-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeExample}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`rounded-[2rem] md:rounded-[3rem] border overflow-hidden p-0.5 md:p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'}`}
                                >
                                    {/* 창 헤더 */}
                                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-current/5">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/30" />
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/30" />
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/30" />
                                            <span className="ml-2 md:ml-4 text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Codera AI Output</span>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-10 space-y-8 md:space-y-10 min-h-[400px] md:min-h-[600px]">
                                        <div className="space-y-6 md:space-y-8">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                                                    <Sparkles size={20} />
                                                </div>
                                                <div className="space-y-6 w-full">
                                                    <div>
                                                        <h4 className="text-xl md:text-2xl font-black tracking-tighter mb-3 md:mb-4 leading-tight break-keep">{examples[activeExample].result.title}</h4>
                                                        <p className="text-xs md:text-sm opacity-60 leading-relaxed font-medium break-keep">{examples[activeExample].result.content}</p>
                                                    </div>

                                                    {/* 비교 표 (Table) */}
                                                    <div className={`rounded-3xl border border-current/5 overflow-hidden ${darkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                                                        <table className="w-full text-left text-xs">
                                                            <thead className={`border-b border-current/5 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                                            <tr>
                                                                <th className="p-4 font-black uppercase tracking-widest opacity-50">Metric / Stage</th>
                                                                <th className="p-4 font-black uppercase tracking-widest opacity-50 text-right">Results</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {examples[activeExample].result.table.map((row, idx) => (
                                                                <tr key={idx} className="border-b border-current/5 last:border-0">
                                                                    <td className="p-4 font-bold opacity-80">{row.label}</td>
                                                                    <td className={`p-4 font-[1000] text-right ${row.color}`}>{row.value}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* 코드 스니펫 (Code) */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 opacity-30">
                                                                <Terminal size={14} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Optimized Source Code</span>
                                                            </div>
                                                        </div>
                                                        <pre className="p-6 rounded-3xl bg-[#0d1117] text-indigo-300 text-[11px] font-mono leading-relaxed border border-white/5 shadow-inner overflow-x-auto">
                                                            <code>{examples[activeExample].result.code}</code>
                                                        </pre>
                                                    </div>

                                                    {/* AI 인사이트 (Insight) */}
                                                    <div className={`p-6 rounded-[2rem] border-l-8 border-indigo-500 transition-all ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap size={16} className="text-indigo-500" fill="currentColor" />
                                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Codera's Core Insight</span>
                                                        </div>
                                                        <p className="text-sm font-bold opacity-80 leading-relaxed italic">
                                                            "{examples[activeExample].result.insight}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Features Grid --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24 md:mb-48">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border transition-all hover:bg-indigo-500/5 group
                            ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
                        >
                            <div className="mb-6 md:mb-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-indigo-500/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl md:text-2xl font-[1000] tracking-tighter mb-4 break-keep leading-tight">{feature.title}</h3>
                            <p className="text-xs md:text-sm opacity-50 font-medium leading-relaxed break-keep">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </section>

                {/* --- Pricing Section --- */}
                <section className="mb-24 md:mb-48">
                    <div className="text-center mb-12 md:mb-20 px-4">
                        <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-500 px-6 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">Pricing Plan</Badge>
                        <h2 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase mb-4 break-keep">수익화를 위한 합리적인 선택</h2>
                        <p className="opacity-40 font-bold tracking-tight text-sm md:text-base break-keep">지속 가능한 개발 생태계를 위해 함께합니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
                        <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border transition-all flex flex-col ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                            <div className="mb-8 md:mb-12">
                                <h3 className="text-xl md:text-2xl font-black mb-2 uppercase opacity-40 tracking-tighter">Trial Pass</h3>
                                <div className="text-5xl md:text-6xl font-[1000] tracking-tighter mb-4">0 <span className="text-sm opacity-30 font-black tracking-normal uppercase">KRW</span></div>
                                <p className="text-xs md:text-sm opacity-40 font-bold">누구나 Codera의 강력함을 경험할 수 있도록.</p>
                            </div>
                            <div className="space-y-4 md:space-y-5 mb-8 md:mb-12 flex-1">
                                {["신규 가입 시 10회 무료", "모든 AI 이미지 생성 포함", "모든 코드 최적화 적용", "커뮤니티 즉시 공유 가능"].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-bold opacity-70">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-14 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-current/5 hover:bg-current/10 text-current font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all">무료 체험 시작</Button>
                        </div>

                        <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-4 border-indigo-500 relative transition-all shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)]
                        ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                            <div className="absolute top-6 md:top-10 right-6 md:right-10 bg-indigo-500 text-white text-[9px] md:text-[10px] font-black px-4 md:px-5 py-1.5 md:py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">Recommended</div>
                            <div className="mb-8 md:mb-12">
                                <h3 className="text-xl md:text-2xl font-black mb-2 uppercase text-indigo-500 tracking-tighter">Pro Access</h3>
                                <div className="text-5xl md:text-6xl font-[1000] tracking-tighter mb-4 flex items-baseline gap-2">
                                    <span className="text-indigo-500">1,000</span>
                                    <span className="text-sm opacity-40 font-black tracking-normal uppercase">P / 10회</span>
                                </div>
                                <p className="text-xs md:text-sm opacity-50 font-bold text-indigo-900/60 dark:text-indigo-100/60">전문 개발자의 워크플로우를 완성하는 선택.</p>
                            </div>
                            <div className="space-y-4 md:space-y-5 mb-8 md:mb-12 flex-1">
                                {["고성능 멀티모달 엔진 탑재", "무제한 시각 자료 생성", "Git Push 자동화 연동 (Beta)", "복잡한 데이터 표 렌더링", "전용 프리미엄 템플릿 제공"].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-[1000] text-indigo-600 dark:text-indigo-400">
                                        <Zap size={14} fill="currentColor" className="shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-14 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-[1000] text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02]">포인트로 간편 구매</Button>
                        </div>
                    </div>
                </section>

                {/* --- Bottom CTA Section --- */}
                <section className="relative">
                    <div className={`p-12 md:p-36 rounded-[3rem] md:rounded-[6rem] border flex flex-col items-center text-center gap-8 md:gap-12 relative overflow-hidden
                    ${darkMode ? 'bg-white/[0.02] border-white/5 shadow-2xl' : 'bg-slate-900 text-white shadow-3xl'}`}>
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[900px] h-[400px] md:h-[900px] border border-white/5 rounded-full pointer-events-none"
                        />
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] bg-indigo-500 shadow-[0_0_60px_rgba(99,102,241,0.5)] flex items-center justify-center text-white relative z-10">
                            <Sparkles size={40} className="md:w-12 md:h-12 animate-pulse" />
                        </div>
                        <h2 className="text-4xl md:text-8xl font-[1000] tracking-tighter leading-tight uppercase relative z-10 break-keep">
                            Create Smarter, <br className="md:hidden"/> Post Faster
                        </h2>
                        <p className="max-w-xl opacity-50 font-bold text-base md:text-lg leading-relaxed relative z-10 break-keep px-4">
                            더 이상 빈 화면 앞에서 고민하지 마세요. 코데라가 당신의 지식에 날개를 달아드립니다.
                        </p>
                        <Button
                            onClick={() => router.push('/main/write?mode=codera')}
                            className="w-full md:w-auto h-16 md:h-20 px-12 md:px-16 rounded-[1.5rem] md:rounded-[2.5rem] bg-white text-black hover:bg-indigo-500 hover:text-white font-[1000] text-lg md:text-xl tracking-widest gap-4 transition-all hover:scale-110 relative z-10 shadow-2xl shadow-white/10"
                        >
                            글쓰기 시작
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="py-24 text-center border-t border-current/5 mt-20">
                <p className="text-[10px] font-[1000] opacity-20 ">
                    Codera Engine v3.0 • Developed by Textra Intelligence 2026
                </p>
            </footer>
        </div>
    );
}