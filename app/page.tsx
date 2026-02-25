"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useTheme } from "./context/darkmood";
import MainHeader from "@/components/header/main_header";

const communityPosts = [
    {
        id: 1,
        category: '홍보',
        author: '김코딩',
        title: '나만의 할일 관리 앱을 만들었습니다. 피드백 부탁드려요!',
        description: 'Next.js와 Prisma를 활용해 만든 미니멀한 투두리스트입니다. UI/UX 개선점에 대해 자유롭게 의견 주세요.',
        votes: 124,
        comments: 42,
        date: '2시간 전'
    },
    {
        id: 2,
        category: '정보',
        author: '이디자인',
        title: '2026년 웹 디자인 트렌드 정리 (Bento Grid 중심으로)',
        description: '최근 유행하는 벤토 그리드 레이아웃의 장단점과 실제 적용 사례들을 정리해 보았습니다.',
        votes: 89,
        comments: 15,
        date: '5시간 전'
    },
    {
        id: 3,
        category: '소통',
        author: '황킹',
        title: '개발자 여러분, 요즘 어떤 AI 툴을 가장 많이 쓰시나요?',
        description: '코파일럿 외에도 커서(Cursor)나 다른 유용한 툴이 있다면 추천해주세요!',
        votes: 215,
        comments: 88,
        date: '어제'
    }
];

export default function CommunityPage() {
    const router = useRouter();

    // 컨텍스트에서 상태와 함수를 가져옵니다.
    // 이름이 다를 수 있으니 context/darkmode.tsx의 리턴값을 확인하세요.
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            {/* --- 상단 네비게이션 --- */}
            <MainHeader/>

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                {/* --- 헤더 섹션 --- */}
                <header className="mb-16">
                    <h2 className="text-6xl md:text-8xl font-black tracking-[calc(-0.05em)] leading-none mb-6 italic">
                        EVERYONE'S<br/>THOUGHTS
                    </h2>
                    <p className={`max-w-md text-sm leading-relaxed font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        당신의 프로젝트를 알리고, 정보를 얻으며, <br/>
                        세상의 모든 사람들과 소통해보세요.
                    </p>
                </header>

                {/* --- 필터 및 통계 --- */}
                <div className={`flex justify-between items-end mb-8 border-b pb-4 transition-colors ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                        <span className="underline decoration-2 underline-offset-8">인기</span>
                        <span className="opacity-40 hover:opacity-100 cursor-pointer transition">최신</span>
                        <span className="opacity-40 hover:opacity-100 cursor-pointer transition">정보</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">320건의 새로운 글</span>
                </div>

                {/* --- 포스트 리스트 --- */}
                <section className="space-y-1">
                    {communityPosts.map((post) => (
                        <article
                            key={post.id}
                            className={`group flex items-start gap-8 py-12 px-6 border-b transition-all duration-300 cursor-pointer
                ${darkMode ? 'border-white/5 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-black/[0.02]'}`}
                        >
                            <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                <span className="text-xs font-black tracking-tighter italic text-blue-500">UP</span>
                                <span className="text-xl font-black">{post.votes}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${darkMode ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'}`}>
                    {post.category}
                  </span>
                                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    {post.author} • {post.date}
                  </span>
                                </div>
                                <h3 className="text-3xl font-black tracking-tight mb-4 group-hover:italic transition-all leading-snug break-keep">
                                    {post.title}
                                </h3>
                                <p className={`text-sm leading-relaxed line-clamp-2 mb-6 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                                    {post.description}
                                </p>
                                <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-40">
                                    <span className="flex items-center gap-1 underline decoration-1 underline-offset-4">댓글 {post.comments}</span>
                                    <span className="hover:opacity-100 transition">공유하기</span>
                                </div>
                            </div>
                            <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">↗</div>
                        </article>
                    ))}
                </section>

                {/* --- 푸터 --- */}
                <footer className={`mt-40 flex flex-col md:flex-row justify-between items-center gap-8 py-10 border-t text-[10px] font-black tracking-widest uppercase transition-colors ${darkMode ? 'border-white/5 text-gray-600' : 'border-slate-200 text-slate-400'}`}>
                    <div>© 2026 HWANGKING COMMUNITY</div>
                    <div className="flex gap-8">
                        <span className="hover:text-current cursor-pointer transition">github</span>
                        <span className="hover:text-current cursor-pointer transition">개인정보처리방침</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}