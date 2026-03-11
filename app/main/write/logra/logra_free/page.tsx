"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "@/app/context/darkmood";
import WriteModeHeader from "@/components/header/write_header";
import { LuPlus, LuSettings, LuX, LuSparkles, LuSend, LuBot } from "react-icons/lu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import Editor from "@/components/editor/Editor";

// --- Types ---
type AgentStep = 'ideation' | 'structuring' | 'tagging' | 'drafting' | 'review';

type Message = {
    id: string;
    role: 'user' | 'agent';
    content: string;
    suggestions?: string[];
};

export default function TrendyWritePage() {
    const { darkMode } = useTheme();
    const { data: session } = useSession();

    // Hydration 방지 상태
    const [isMounted, setIsMounted] = useState(false);

    // 1. 공통 에디터 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPreview, setIsPreview] = useState(false);

    // 2. AI 에이전트 상태
    const [chatInput, setChatInput] = useState("");
    const [agentStep, setAgentStep] = useState<AgentStep>('ideation');
    const [isTyping, setIsTyping] = useState(false);
    const [topic, setTopic] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: '안녕하세요! LOGRA 글쓰기 에이전트입니다. 어떤 주제로 글을 써볼까요?✨',
            suggestions: ['최신 기술 트렌드', '자기계발 노하우', '여행지 추천']
        }
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // 마운트 체크
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 채팅 자동 스크롤
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // --- 핸들러 영역 ---
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
            setTagInput("");
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove: number) => setTags(tags.filter((_, index) => index !== indexToRemove));

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
        e?.preventDefault();
        const targetInput = overrideInput || chatInput;
        if (!targetInput.trim() || isTyping) return;

        const userMsg = targetInput;
        const currentMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: userMsg }];

        setMessages(currentMessages);
        setChatInput("");
        setIsTyping(true);

        let currentTopic = topic;
        if (agentStep === 'ideation' && !topic) {
            currentTopic = userMsg;
            setTopic(userMsg);
        }

        try {
            const response = await fetch('/api/ai/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: currentMessages,
                    step: agentStep,
                    topic: currentTopic || userMsg,
                    currentContent: content
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (data.title) setTitle(data.title);
            if (data.tags && Array.isArray(data.tags)) {
                setTags(data.tags.map((t: string) => t.replace('#', '')));
            }
            if (typeof data.content === 'string' && (agentStep === 'drafting' || agentStep === 'review')) {
                setContent(data.content);
            }

            // 메시지 패널에 들어갈 내용은 항상 문자열로 강제 변환
            const rawDisplayContent =
                typeof data.message !== 'undefined'
                    ? data.message
                    : agentStep === 'drafting'
                        ? "✨ <b>에디터에 본문 작성을 완료했습니다!</b>"
                        : data.content;

            const displayContent =
                typeof rawDisplayContent === 'string'
                    ? rawDisplayContent
                    : JSON.stringify(rawDisplayContent ?? '', null, 2);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: displayContent,
                suggestions: data.suggestions
            };

            setMessages(prev => [...prev, aiMsg]);

            const stepOrder: Record<AgentStep, AgentStep> = {
                ideation: 'structuring',
                structuring: 'tagging',
                tagging: 'drafting',
                drafting: 'review',
                review: 'review'
            };
            setAgentStep(stepOrder[agentStep]);

        } catch (error: any) {
            console.error("AI 에이전트 오류:", error);
            setMessages(prev => [...prev, { id: 'err', role: 'agent', content: "오류가 발생했습니다: " + error.message }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Hydration 이슈 해결: 마운트 전에는 빈 화면 혹은 스켈레톤 노출
    if (!isMounted) return null;

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans overflow-hidden
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <WriteModeHeader postData={{ title, content, mode: "community", coverImage, tags }} onPreview={() => setIsPreview(true)} />

            <div className="flex pt-[60px] md:pt-[65px] h-[calc(100vh-60px)] md:h-[calc(100vh-65px)]">

                {/* --- [1] 좌측: AI 에이전트 패널 --- */}
                <aside className={`w-[350px] lg:w-[400px] border-r flex flex-col transition-colors z-20
                    ${darkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-zinc-50 border-slate-200'}`}>

                    <div className="p-6 flex items-center gap-3 border-b border-inherit">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <LuBot size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm tracking-tight">LOGRA AI</h3>
                                <span className="bg-indigo-500/10 text-indigo-500 text-[9px] px-1.5 py-0.5 rounded-md font-black tracking-tighter border border-indigo-500/20">
                                    ASSISTANT
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                {agentStep} 모드
                            </div>
                        </div>
                    </div>

                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-3">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed
                                        ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                                        : darkMode ? 'bg-white/10 text-zinc-300 rounded-tl-none' : 'bg-white text-slate-700 shadow-sm rounded-tl-none'
                                    }`}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: (typeof msg.content === 'string'
                                                    ? msg.content
                                                    : String(msg.content)
                                                ).replace(/\n/g, '<br/>')
                                            }}
                                        />
                                    </div>
                                </div>

                                {msg.role === 'agent' && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-start pl-2">
                                        {msg.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(undefined, suggestion)}
                                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95
                                                    ${darkMode
                                                    ? 'border-white/10 bg-white/5 hover:bg-white/20 text-zinc-400'
                                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'
                                                }`}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className={`px-4 py-3 rounded-2xl rounded-tl-none text-[13px] ${darkMode ? 'bg-white/10 text-zinc-300' : 'bg-white text-slate-700 shadow-sm'}`}>
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-2">
                        <form onSubmit={handleSendMessage} className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all
                            ${darkMode ? 'border-white/10 bg-white/5 focus-within:border-indigo-500/50' : 'border-slate-200 bg-white focus-within:border-indigo-400'}
                            ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isTyping}
                                placeholder="에이전트에게 메시지를 보내세요..."
                                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm font-medium"
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !chatInput.trim()}
                                className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                <LuSend size={16} />
                            </button>
                        </form>
                    </div>
                </aside>

                {/* --- [2] 중앙: 메인 에디터 --- */}
                <main className="flex-1 overflow-y-auto bg-transparent relative">
                    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                        <textarea
                            value={title}
                            onChange={handleTitleChange}
                            rows={1}
                            placeholder="제목을 입력하세요"
                            className={`w-full bg-transparent text-4xl md:text-5xl font-black tracking-tighter focus:outline-none resize-none leading-tight mb-8
                                ${darkMode ? 'placeholder:text-white/5 text-white' : 'placeholder:text-slate-300 text-slate-900'}`}
                        />
                        <Editor content={content} onChange={setContent} darkMode={darkMode} />
                    </div>
                </main>

                {/* --- [3] 우측: 메타 설정 --- */}
                <aside className={`w-80 border-l p-8 hidden xl:block overflow-y-auto transition-all
                    ${darkMode ? 'border-white/10 bg-[#0a0a0a]' : 'border-slate-200 bg-white'}`}>
                    <div className="space-y-10">
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">SEO 태그</h4>
                            <div className={`flex flex-wrap gap-2 p-4 border rounded-2xl ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                {tags.map((tag, index) => (
                                    <Badge key={index} className="bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white border-none gap-1 py-1 px-3">
                                        #{tag}
                                        <LuX size={12} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => removeTag(index)} />
                                    </Badge>
                                ))}
                                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="추가..." className="flex-1 bg-transparent border-none outline-none text-xs min-w-[50px] font-bold" />
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">대표 이미지</h4>
                            <input type="file" className="hidden" ref={fileInputRef} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if(file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                    const data = await res.json();
                                    if (data.url) setCoverImage(data.url);
                                }
                            }} />
                            <div onClick={() => fileInputRef.current?.click()} className={`relative aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
                                ${darkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                {coverImage ? (
                                    <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="text-center opacity-30">
                                        <LuPlus size={24} className="mx-auto mb-2" />
                                        <span className="text-[10px] font-bold">이미지 업로드</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </aside>
            </div>

            {/* 미리보기 오버레이 */}
            {isPreview && (
                <div className={`fixed inset-0 z-[100] overflow-y-auto ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
                    <div className={`fixed top-0 w-full flex items-center justify-between px-6 py-4 border-b z-[110] backdrop-blur-xl ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'}`}>
                        <div className="text-base font-black uppercase tracking-[0.3em] opacity-80">Preview Mode</div>
                        <button onClick={() => setIsPreview(false)} className="p-2 hover:rotate-90 transition-all duration-300"><LuX size={24} /></button>
                    </div>
                    <main className="max-w-2xl mx-auto px-6 pt-32 pb-20">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-10 uppercase">{title || "Your Title"}</h1>
                        {coverImage && <img src={coverImage} className="w-full rounded-[32px] mb-12 shadow-2xl" />}
                        <div className={`prose prose-xl max-w-none ${darkMode ? 'prose-invert text-zinc-400' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: content || "내용이 없습니다." }} />
                    </main>
                </div>
            )}
        </div>
    );
}