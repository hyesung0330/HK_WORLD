"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/darkmood";
import WriteModeHeader from "@/components/header/write_header";
import { CiImageOn } from "react-icons/ci";
import { IoImageOutline } from "react-icons/io5";

export default function TrendyWritePage() {
    const router = useRouter();
    const { darkMode } = useTheme();

    // --- 상태 관리 ---
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("개발");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 통계 계산 ---
    const charCount = content.length;
    const readingTime = Math.ceil(charCount / 500) || 0;

    // --- 글 등록 함수 (Submit) ---
    const handleSubmit = async () => {
        // 1. 유효성 검사
        if (!title.trim()) return alert("제목을 입력해주세요.");
        if (!content.trim()) return alert("내용을 입력해주세요.");

        setIsLoading(true);

        try {
            // 2. 서버 API 호출 (예시 경로: /api/posts)
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    category,
                    coverImage,
                    author: "Hwangking",
                    createdAt: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                alert("글이 성공적으로 등록되었습니다!");
                router.push("/community"); // 등록 후 커뮤니티 목록으로 이동
            } else {
                throw new Error("등록 실패");
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 핸들러 ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCoverImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-blue-500 
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            {/* 헤더의 저장 버튼 클릭 시 handleSubmit이 실행되도록 연결 (Props로 전달) */}
            <WriteModeHeader
                postData={{ title, content, category, coverImage }}
                onSave={handleSubmit}
                isSubmitting={isLoading}
            />

            <div className="flex pt-[65px]">
                {/* --- 좌측 설정 사이드바 --- */}
                <aside className={`w-80 border-r h-[calc(100vh-65px)] p-10 hidden lg:block overflow-y-auto transition-colors sticky top-[65px]
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="space-y-12">
                        {/* 카테고리 설정 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-6">카테고리</h4>
                            <div className="space-y-2">
                                {['개발', '디자인', '인공지능', '일상'].map((cat) => (
                                    <div
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className="flex items-center justify-between group cursor-pointer"
                                    >
                                        <span className={`text-sm font-medium transition ${
                                            category === cat
                                                ? 'text-blue-500'
                                                : darkMode ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
                                        }`}>{cat}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full bg-blue-500 transition-opacity ${category === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
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
                                    <span className="font-mono">{charCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="opacity-40 font-bold">예상 읽기 시간</span>
                                    <span className="font-mono">{readingTime}분</span>
                                </div>
                            </div>
                        </section>

                        {/* 커버 업로드 영역 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">커버 이미지</h4>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative aspect-square border border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer overflow-hidden
                                ${darkMode ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                            >
                                {coverImage ? (
                                    <>
                                        <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">이미지 교체</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl group-hover:scale-110 transition-transform"><CiImageOn/></span>
                                        <span className="text-[10px] font-bold opacity-40 tracking-widest text-center uppercase">이미지 업로드</span>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </aside>

                {/* --- 중앙 메인 에디터 --- */}
                <main className="flex-1 flex justify-center h-[calc(100vh-65px)] overflow-y-auto">
                    <div className="max-w-3xl w-full px-12 py-20">
                        {/* 플로팅 툴바 */}
                        <div className="sticky top-6 mb-20 flex justify-center z-20">
                            <div className={`flex items-center gap-3 px-6 py-3 border rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-300 backdrop-blur-xl
                                ${darkMode ? 'bg-[#1a1a1a]/80 border-white/10 shadow-black' : 'bg-white/90 border-slate-200 shadow-slate-200'}`}>
                                <div className="flex items-center gap-1">
                                    <button className={`w-11 h-11 flex items-center justify-center rounded-full text-base font-black transition-all ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>B</button>
                                    <button className={`w-11 h-11 flex items-center justify-center rounded-full text-base italic font-serif transition-all ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>I</button>
                                    <button className={`w-11 h-11 flex items-center justify-center rounded-full text-sm underline decoration-2 underline-offset-4 font-bold transition-all ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>U</button>
                                </div>
                                <div className={`w-[1px] h-5 mx-1 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => fileInputRef.current?.click()} className={`w-11 h-11 flex items-center justify-center rounded-full text-xl transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                                        <IoImageOutline strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 입력 영역 */}
                        <div className="space-y-8">
                            <textarea
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="제목을 입력하세요."
                                className={`w-full bg-transparent text-5xl md:text-6xl font-black tracking-tighter focus:outline-none resize-none leading-[1.1] break-keep transition-colors ${darkMode ? 'placeholder:text-white/10 text-white' : 'placeholder:text-slate-200 text-slate-900'}`}
                                rows={1}
                            />
                            <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest text-blue-500">
                                <span className="uppercase">작성자: Hwangking</span>
                                <span className="opacity-20">/</span>
                                <span className="opacity-40 uppercase">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="당신의 생각을 자유롭게 기록해 보세요"
                                className={`w-full min-h-[600px] bg-transparent text-lg md:text-xl leading-relaxed focus:outline-none resize-none font-medium transition-colors ${darkMode ? 'text-gray-400 placeholder:text-white/5' : 'text-slate-500 placeholder:text-slate-200'}`}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}