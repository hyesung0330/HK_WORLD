"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    LuArrowLeft,
    LuGlobe,
    LuGithub,
    LuLayers,
    LuCpu,
} from "react-icons/lu";

export default function PromoteDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // 상세 데이터 (ID에 따라 백엔드에서 호출하는 로직이 들어갈 자리)
    const project = {
        title: "AI DESIGN SYSTEM",
        tag: "PROJECT",
        year: "2026",
        client: "Hwangking Labs",
        role: "Lead Developer",
        tech: ["Next.js", "Tailwind CSS", "OpenAI API", "Framer Motion"],
        description: `
            이 프로젝트는 차세대 디자인 시스템의 자동화를 위해 설계되었습니다. 
            AI가 브랜드 가이드를 분석하여 수천 개의 UI 컴포넌트를 즉시 생성하며, 
            접근성(Accessibility) 표준을 100% 준수하는 코드를 제공합니다.
        `,
        image: `https://picsum.photos/seed/${id}/1200/800`,
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-20">
                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-16">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 -ml-4 opacity-50 hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Showcase
                    </Button>
                    <div className="flex items-center gap-4 text-[10px] font-black opacity-30 tracking-widest uppercase italic">
                        Case Study / {id}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* --- 좌측: 상세 텍스트 정보 (5컬럼) --- */}
                    <div className="lg:col-span-5 space-y-12">
                        <header className="space-y-6">
                            <Badge className="bg-blue-600 text-white border-none font-black italic px-4 py-1 text-[11px] uppercase tracking-widest">
                                {project.tag}
                            </Badge>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase break-keep">
                                {project.title}.
                            </h1>
                        </header>

                        <section className="space-y-8">
                            <p className={`text-xl md:text-2xl font-medium leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                {project.description}
                            </p>

                            {/* 메타 인포 벤토 카드 */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Client", val: project.client, icon: <LuLayers size={14}/> },
                                    { label: "Role", val: project.role, icon: <LuCpu size={14}/> },
                                ].map((info) => (
                                    <div key={info.label} className={`p-6 rounded-[24px] border transition-all hover:border-blue-500/50
                                        ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-2 opacity-30 mb-2">
                                            {info.icon}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{info.label}</span>
                                        </div>
                                        <p className="font-black italic text-sm tracking-tight">{info.val}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 기술 스택 태그 */}
                        <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                                <span key={t} className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border
                                    ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'}`}>
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Button className="flex-1 rounded-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black italic tracking-widest gap-2">
                                <LuGlobe size={18} /> VISIT LIVE SITE
                            </Button>
                            <Button variant="outline" className={`flex-1 rounded-full h-16 font-black italic tracking-widest gap-2 border-2
                                ${darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-slate-200 hover:bg-black hover:text-white'}`}>
                                <LuGithub size={18} /> VIEW GITHUB
                            </Button>
                        </div>
                    </div>

                    {/* --- 우측: 고정된 대형 비주얼 (7컬럼) --- */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-32 space-y-8">
                            <div className={`group relative rounded-[48px] overflow-hidden border shadow-2xl transition-all duration-700
                                ${darkMode ? 'border-white/10 shadow-black' : 'border-slate-200 shadow-slate-200/50'}`}>
                                <img
                                    src={project.image}
                                    alt="Project Visual"
                                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent mix-blend-overlay" />
                            </div>

                            {/* 추가 서브 이미지/설명 카드 */}
                            <div className={`p-10 rounded-[40px] border flex items-center justify-between
                                ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black italic tracking-tighter uppercase">Next Vision.</h4>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">본 프로젝트의 후속 업데이트가 예정되어 있습니다.</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                                    <LuLayers />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}