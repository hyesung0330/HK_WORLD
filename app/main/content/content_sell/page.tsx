"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LuExternalLink, LuArrowRight, LuSparkles } from "react-icons/lu";

// 홍보 데이터 (본인의 프로젝트나 서비스로 채우세요)
const PROJECTS = [
    {
        id: "p1",
        title: "AI DESIGN SYSTEM",
        tag: "PROJECT",
        desc: "인공지능 기반의 자동 디자인 시스템 구축 솔루션",
        image: "https://picsum.photos/seed/p1/800/800",
        size: "large", // 큰 카드
    },
    {
        id: "p2",
        title: "2026 TREND REPORT",
        tag: "INSIGHT",
        desc: "디지털 트렌드 분석 리포트",
        image: "https://picsum.photos/seed/p2/600/600",
        size: "small", // 작은 카드
    },
    {
        id: "p3",
        title: "BENTO UI KIT",
        tag: "PRODUCT",
        desc: "가장 힙한 레이아웃을 위한 UI 키트",
        image: "https://picsum.photos/seed/p3/600/600",
        size: "small",
    },
    {
        id: "p4",
        title: "WORK WITH ME",
        tag: "CONTACT",
        desc: "새로운 프로젝트 협업을 기다립니다.",
        image: "https://picsum.photos/seed/p4/800/400",
        size: "wide", // 가로로 긴 카드
    }
];

export default function PromotePage() {
    const { darkMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <MainHeader />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* 상단 홍보 문구 */}
                <header className="mb-20 space-y-4">
                    <div className="flex items-center gap-2 text-blue-500 font-black  text-sm tracking-widest uppercase">
                        <LuSparkles /> <span>Available for new projects</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                        Showcase<br/>Your Vision
                    </h2>
                    <p className={`max-w-xl text-lg font-medium leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                        당신의 가치를 자랑하고 보여주세요<br/>
                        혁신적인 아이디어와 기술력을 세상에 알려보세요
                    </p>
                </header>

                {/* 벤토 그리드 홍보 섹션 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
                    {PROJECTS.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/main/content/content_sell/${item.id}`)}
                            className={`group relative rounded-[40px] overflow-hidden border cursor-pointer transition-all duration-700
                                ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                ${item.size === 'wide' ? 'md:col-span-2 md:row-span-1' : ''}
                                ${item.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
                                ${darkMode ? 'bg-[#121212] border-white/5 shadow-2xl shadow-black' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
                        >
                            {/* 배경 이미지 */}
                            <img
                                src={item.image}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0"
                            />

                            {/* 컨텐츠 오버레이 */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none font-black  text-[10px]">
                                        {item.tag}
                                    </Badge>
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <LuExternalLink className="text-white" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`font-black tracking-tighter leading-tight  uppercase group-hover:text-blue-500 transition-colors
                                        ${item.size === 'large' ? 'text-5xl mb-4' : 'text-2xl mb-2'}`}>
                                        {item.title}
                                    </h3>
                                    <p className={`font-bold opacity-0 group-hover:opacity-60 transition-all transform translate-y-4 group-hover:translate-y-0
                                        ${item.size === 'large' ? 'text-lg' : 'text-xs'}`}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>

                            {/* 하단 그라데이션 */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60`} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}