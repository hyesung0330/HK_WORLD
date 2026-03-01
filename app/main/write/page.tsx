"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "@/app/context/darkmood";
import WriteModeHeader from "@/components/header/write_header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LuMessageSquare, LuMegaphone, LuPlus, LuLink } from "react-icons/lu";

export default function TrendyWritePage() {
    const { darkMode } = useTheme();
    const [mode, setMode] = useState("community"); // community, promote, note

    // 공통 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // 홍보(Promote) 전용 상태
    const [link, setLink] = useState("");
    const [techStack, setTechStack] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans 
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <WriteModeHeader postData={{ title, content, mode, link, techStack, coverImage }} />

            <div className="flex pt-[65px] h-[calc(100vh-65px)]">

                {/* --- 좌측 다이나믹 사이드바 --- */}
                <aside className={`w-80 border-r p-10 hidden lg:block overflow-y-auto transition-colors
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>

                    <div className="space-y-12">
                        {/* 1. 모드 선택기 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">작성 모드</h4>
                            <Tabs value={mode} onValueChange={setMode} className="w-full">
                                <TabsList className={`grid grid-cols-3 h-12 rounded-2xl p-1 ${darkMode ? 'bg-white/5' : 'bg-slate-200/50'}`}>
                                    <TabsTrigger value="community" className="rounded-xl"><LuMessageSquare size={16}/></TabsTrigger>
                                    <TabsTrigger value="promote" className="rounded-xl"><LuMegaphone size={16}/></TabsTrigger>
                                    <TabsTrigger value="note" className="rounded-xl"><LuMegaphone size={16}/></TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </section>

                        {/* 2. 모드별 맞춤 설정 */}
                        {mode === "community" && (
                            <section className="animate-in fade-in slide-in-from-left-4">
                                <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">커뮤니티 설정</h4>
                                <div className="space-y-2">
                                    {['질문', '정보', '토론'].map(c => (
                                        <Badge key={c} variant="outline" className="mr-2 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">#{c}</Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {mode === "promote" && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div>
                                    <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-3">관련 링크</h4>
                                    <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
                                        <LuLink size={14} className="opacity-40"/>
                                        <input
                                            placeholder="https://..."
                                            className="bg-transparent text-xs outline-none w-full font-bold"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-3">사용 기술</h4>
                                    <input
                                        placeholder="React, Next.js..."
                                        className={`w-full px-4 py-3 rounded-2xl border text-xs outline-none font-bold ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white'}`}
                                        value={techStack}
                                        onChange={(e) => setTechStack(e.target.value)}
                                    />
                                </div>
                            </section>
                        )}

                        {/* 3. 공통 커버 업로드 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">대표 이미지</h4>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative aspect-[4/3] border border-dashed rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                                ${darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'}`}
                            >
                                {coverImage ? (
                                    <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <LuPlus className="opacity-20" size={24}/>
                                )}
                                <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if(file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setCoverImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                        </section>
                    </div>
                </aside>

                {/* --- 중앙 메인 에디터 (모드별 레이아웃 변경) --- */}
                <main className="flex-1 overflow-y-auto bg-transparent">
                    <div className="max-w-4xl mx-auto px-12 py-20">

                        {/* 에디터 상단 모드 인디케이터 */}
                        <div className="mb-12 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-lg font-black uppercase tracking-[0.3em] opacity-40">
                                {mode} 에디터
                            </span>
                        </div>

                        {/* 제목 영역 */}
                        <textarea
                            value={title}
                            onChange={handleTitleChange}
                            placeholder={mode === "promote" ? "프로젝트 명을 입력하세요" : "제목을 입력하세요"}
                            className={`w-full bg-transparent text-6xl font-black tracking-tighter focus:outline-none resize-none leading-none mb-10 italic uppercase
                                ${darkMode ? 'placeholder:text-white/5' : 'placeholder:text-slate-200'}`}
                            rows={1}
                        />

                        {/* 본문 영역 */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                mode === "community" ? "함께 나누고 싶은 이야기를 적어주세요." :
                                    mode === "promote" ? "프로젝트의 핵심 가치와 성과를 홍보해보세요." :
                                        "나만의 비밀스러운 기록을 남겨보세요."
                            }
                            className={`w-full min-h-[500px] bg-transparent text-xl leading-relaxed focus:outline-none resize-none font-medium
                                ${darkMode ? 'text-zinc-400 placeholder:text-white/5' : 'text-slate-600 placeholder:text-slate-200'}`}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}