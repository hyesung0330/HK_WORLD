"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/darkmood";
import MainHeader from "@/components/header/main_header";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
    Zap, 
    Trophy, 
    Gamepad2,
    Sparkles,
    MousePointer2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { BackButton } from "@/components/ui/back-button";
import DinoGame from "@/components/game/DianoGame/page";

export default function GamePage() {
    const { darkMode } = useTheme();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setIsLoading(false);
    }, []);

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
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] md:text-[11px] font-black mb-6 uppercase tracking-widest">미니 게임
                        </div>
                        <h1 className="text-4xl md:text-6xl font-[950] tracking-tighter leading-tight mb-6">
                            달리면서 <span className="text-indigo-500"><br/>성장</span>하는 즐거움
                        </h1>
                        <p className="text-sm md:text-lg font-medium opacity-50 max-w-xl mx-auto leading-relaxed">
                            사이버 런 게임을 즐기고 점수에 따라 경험치를 획득하세요.<br className="hidden md:block"/>
                            1,000점당 100 XP가 적립됩니다.
                        </p>
                    </motion.div>
                </section>

                <div className="mb-20">
                    {isLoading ? (
                        <div className="h-[400px] flex justify-center items-center border rounded-[3rem] border-dashed border-white/10">
                            <Loading message="게임을 준비 중입니다" />
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <DinoGame />
                        </motion.div>
                    )}
                </div>

                {/* --- Game Rules --- */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8 md:mb-12 justify-center">
                        <Trophy size={20} className="text-amber-500" />
                        <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">게임 보너스 안내</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                            { label: "XP 적립 규칙", xp: "10", unit: "XP", desc: "100점 획득 시 마다 적립" },
                            { label: "일일 한도", xp: "1,000", unit: "XP", desc: "게임으로 획득 가능한 최대치" },
                        ].map((item, i) => (
                            <div key={i} className={`p-8 rounded-[2rem] border transition-all hover:scale-[1.02] 
                                ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'bg-white shadow-sm border-slate-100'}`}>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{item.label}</p>
                                <div className="text-3xl font-[1000] text-indigo-500 mb-2">
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
                            <Gamepad2 size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">간편한 조작</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Zap size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">즉시 적립</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <MousePointer2 size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">무한 루프</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
