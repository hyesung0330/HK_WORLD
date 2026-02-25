"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/darkmood";
import WriteModeHeader from "@/app/components/header/write_header";

export default function TrendyWritePage() {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme(); // 전역 테마 상태와 토글 함수 가져오기
    const [title, setTitle] = useState("");

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-blue-500 
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <WriteModeHeader/>
            <div className="flex pt-[65px]">
                {/* --- 좌측 설정 사이드바 --- */}
                <aside className={`w-80 border-r h-[calc(100vh-65px)] p-10 hidden lg:block overflow-y-auto transition-colors
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="space-y-12">
                        {/* 카테고리 설정 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-6">카테고리</h4>
                            <div className="space-y-2">
                                {['개발', '디자인', '인공지능', '일상'].map((cat) => (
                                    <div key={cat} className="flex items-center justify-between group cursor-pointer">
                                        <span className={`text-sm font-medium transition ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>{cat}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100"></div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 포스트 정보 벤토 카드 */}
                        <section className={`rounded-3xl p-6 space-y-4 transition-colors
                            ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">글 정보</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px]">
                                    <span className="opacity-40 font-bold">공백 포함 글자 수</span>
                                    <span className="font-mono">1,242</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="opacity-40 font-bold">예상 읽기 시간</span>
                                    <span className="font-mono">4분</span>
                                </div>
                            </div>
                        </section>

                        {/* 커버 업로드 영역 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">커버 이미지</h4>
                            <div className={`aspect-square border border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer
                                ${darkMode ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                                <span className="text-2xl group-hover:scale-110 transition-transform">🖼️</span>
                                <span className="text-[10px] font-bold opacity-40 tracking-widest text-center uppercase">이미지 업로드</span>
                            </div>
                        </section>
                    </div>
                </aside>

                {/* --- 중앙 메인 에디터 --- */}
                <main className="flex-1 flex justify-center h-[calc(100vh-65px)] overflow-y-auto">
                    <div className="max-w-3xl w-full px-12 py-24">
                        {/* 플로팅 툴바 */}
                        <div className="sticky top-0 mb-16 flex justify-center z-10">
                            <div className={`flex items-center gap-2 px-4 py-2 border rounded-full shadow-2xl transition-colors backdrop-blur-md
                                ${darkMode ? 'bg-white/5 border-white/10 shadow-black' : 'bg-white/80 border-slate-200 shadow-slate-200'}`}>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-current/10 rounded-full text-xs font-bold transition">가</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-current/10 rounded-full text-xs italic transition">I</button>
                                <div className="w-[1px] h-3 bg-current opacity-10 mx-1"></div>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-current/10 rounded-full text-sm">🔗</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-current/10 rounded-full text-sm">📷</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-current/10 rounded-full text-sm font-mono">{"<>"}</button>
                            </div>
                        </div>

                        {/* 입력 영역 */}
                        <div className="space-y-8">
                            <textarea
                                placeholder="제목을 입력하세요."
                                className={`w-full bg-transparent text-5xl md:text-6xl font-black tracking-tighter focus:outline-none resize-none leading-[1.1] break-keep transition-colors
                                    ${darkMode ? 'placeholder:text-white/10' : 'placeholder:text-slate-200'}`}
                                rows={2}
                            />

                            <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest text-blue-500">
                                <span>작성자: 황킹</span>
                                <span className="opacity-20">/</span>
                                <span className="opacity-40">2026년 2월</span>
                            </div>

                            <textarea
                                placeholder="당신의 생각을 자유롭게 기록해 보세요..."
                                className={`w-full h-[600px] bg-transparent text-lg md:text-xl leading-relaxed focus:outline-none resize-none font-medium transition-colors
                                    ${darkMode ? 'text-gray-400 placeholder:text-white/5' : 'text-slate-500 placeholder:text-slate-200'}`}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}