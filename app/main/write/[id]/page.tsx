"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "@/app/context/darkmood";
import WriteModeHeader from "@/components/header/write_header";
import { LuPlus, LuSettings, LuX } from "react-icons/lu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Editor from "@/components/editor/Editor";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

export default function EditPostPage() {
    const { id } = useParams();
    const router = useRouter();
    const { darkMode } = useTheme();
    const { data: session } = useSession();

    // 공통 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    const [loading, setLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id && session !== undefined) {
            fetchPost();
        }
    }, [id, session]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${id}`);
            if (res.ok) {
                const data = await res.json();
                
                // 권한 확인
                if (session === null) {
                    toast.error("로그인이 필요합니다.");
                    router.push(`/main/content/content_comunity/${id}`);
                    return;
                }

                if (session && session.user?.id && data.authorId && session.user.id !== String(data.authorId)) {
                    toast.error("수정 권한이 없습니다.");
                    router.push(`/main/content/content_comunity/${id}`);
                    return;
                }

                setTitle(data.title);
                setContent(data.content);
                setCoverImage(data.coverImage);
                if (data.tags) {
                    setTags(data.tags.map((t: any) => t.tag.name));
                }
            } else {
                toast.error("게시글을 불러오는데 실패했습니다.");
            }
        } catch (error) {
            console.error("Fetch post error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans 
            ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>

            <WriteModeHeader
                isEdit={true}
                postId={parseInt(id as string)}
                postData={{ title, content, mode: "community", coverImage, tags }}
                onPreview={() => setIsPreview(true)}
            />

            {/* 모바일 설정 트리거 (Floating Action Button style) */}
            <div className="lg:hidden fixed bottom-8 right-8 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                            <LuSettings size={24} />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className={`rounded-t-[32px] border-none p-8 ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-white text-slate-900'}`}>
                        <div className="space-y-10 pb-10">
                            {/* 태그 입력 */}
                            <div>
                                <p className="text-lg font-black opacity-100  mb-4">태그</p>
                                <div className={`flex flex-wrap gap-2 p-3 border rounded-2xl transition-all ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                                    {tags.map((tag, index) => (
                                        <Badge key={index} className="bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white border-none gap-1 py-1">
                                            #{tag}
                                            <LuX size={12} className="cursor-pointer" onClick={() => removeTag(index)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* 이미지 업로드 */}
                            <div>
                                <p className="text-lg font-black opacity-100  mb-4">대표 이미지</p>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative aspect-[16/9] border border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                                    ${darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'}`}
                                >
                                    {coverImage ? (
                                        <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col gap-2 items-center justify-center text-center">
                                            <LuPlus className="opacity-20" size={24}/>
                                            <span className="opacity-20 text-sm font-medium">대표 이미지 추가하기</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex pt-[60px] md:pt-[65px] h-[calc(100vh-60px)] md:h-[calc(100vh-65px)]">

                {/* --- 숨겨진 파일 입력 (모바일/데스크톱 공용) --- */}
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if(file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                });
                                const data = await response.json();
                                if (data.url) {
                                    setCoverImage(data.url);
                                }
                            } catch (error) {
                                console.error('Cover image upload failed', error);
                            }
                        }
                    }} 
                />

                {/* --- 좌측 다이나믹 사이드바 --- */}
                <aside className={`w-80 border-r p-10 hidden lg:block overflow-y-auto transition-colors
                    ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>

                    <div className="space-y-12">
                        {/* 태그 입력 */}
                        <section>
                            <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">태그</h4>
                            <div className={`flex flex-wrap gap-2 p-4 border rounded-[24px] transition-all ${darkMode ? 'border-white/10 bg-white/5 focus-within:border-white/30' : 'border-slate-200 bg-white focus-within:border-slate-400'}`}>
                                {tags.map((tag, index) => (
                                    <Badge key={index} className="bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white border-none gap-1 py-1.5 px-3">
                                        #{tag}
                                        <LuX size={12} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => removeTag(index)} />
                                    </Badge>
                                ))}
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={tags.length === 0 ? "태그를 입력하세요" : ""}
                                    className="flex-1 bg-transparent border-none outline-none text-xs min-w-[100px] font-bold"
                                />
                            </div>
                            <p className="text-[9px] opacity-30 mt-3 font-medium">쉼표(,) 또는 엔터로 태그를 구분합니다.</p>
                        </section>

                        {/* 이미지 업로드 */}
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
                            </div>
                        </section>
                    </div>
                </aside>

                {/* --- 중앙 메인 에디터 (모드별 레이아웃 변경) --- */}
                <main className="flex-1 overflow-y-auto bg-transparent">
                    <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20">


                        {/* 제목 영역 */}
                        <textarea
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="제목을 입력하세요"
                            className={`w-full bg-transparent text-4xl md:text-6xl font-black tracking-tighter focus:outline-none resize-none leading-tight mb-8 md:mb-10 uppercase
                                ${darkMode ? 'placeholder:text-white/5 text-white' : 'placeholder:text-slate-300 text-slate-900'}`}
                        />

                        {/* 본문 영역 */}
                        <Editor
                            content={content}
                            onChange={setContent}
                            darkMode={darkMode}
                        />
                    </div>
                </main>
            </div>

            {/* --- 미리보기 오버레이 --- */}
            {isPreview && (
                <div className={`fixed inset-0 z-[100] overflow-y-auto transition-colors duration-500
        ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>

                    {/* 상단 닫기 바 */}
                    <div className={`fixed top-0 w-full flex items-center justify-between px-6 py-4 border-b z-[110] backdrop-blur-xl
            ${darkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200'}`}>
                        <div className="text-base font-black uppercase tracking-[0.3em] opacity-80">미리보기 모드</div>
                        <button
                            onClick={() => setIsPreview(false)}
                            className={`p-2 rounded-full hover:rotate-90 transition-all duration-300
                    ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
                        >
                            <LuX size={24} />
                        </button>
                    </div>

                    <main className="max-w-3xl mx-auto px-4 md:px-6 pt-32 pb-20">
                        <header className="space-y-6 md:space-y-8 mb-10 md:mb-16">

                            {/* [수정 부분] 첫 번째 태그를 강조 배지로 표시 */}
                            {tags.length > 0 ? (
                                <Badge className="bg-zinc-900 dark:bg-white text-white dark:text-black font-base rounded-lg px-4 py-1 border-none text-[10px]">
                                    #{tags[0]}
                                </Badge>
                            ) : (
                                <div className="h-6" />
                            )}

                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] break-keep uppercase">
                                {title || "제목을 입력해주세요"}
                            </h1>

                            <div className={`flex items-center justify-between pt-6 border-t ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-10 h-10 border border-white/10 grayscale">
                                        <AvatarImage src={session?.user?.image || ""} />
                                        <AvatarFallback className="font-black text-xs">
                                            {session?.user?.name?.slice(0, 2).toUpperCase() || "ME"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tight leading-none mb-1">
                                {session?.user?.name || "ANONYMOUS"}
                            </span>
                                        <span className="text-[10px] font-bold opacity-30 tracking-[0.1em]"></span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
                                    조회수 0
                                </div>
                            </div>

                            {/* 나머지 태그들 나열 (첫 번째 태그 제외 또는 전체 나열) */}
                            {tags.length > 1 && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {tags.slice(1).map((tag, index) => (
                                        <span key={index} className={`text-[11px] font-bold px-3 py-1 rounded-full ${darkMode ? 'text-zinc-500 bg-white/5' : 'text-slate-400 bg-slate-100'}`}>
                                #{tag}
                            </span>
                                    ))}
                                </div>
                            )}
                        </header>

                        {/* 대표 이미지 미리보기 */}
                        {coverImage && (
                            <div className={`mb-16 rounded-[24px] overflow-hidden border ${darkMode ? 'border-white/5' : 'border-slate-200'}`}>
                                <img src={coverImage} className="w-full h-auto object-cover max-h-[550px]" alt="Preview" />
                            </div>
                        )}

                        {/* 본문 기사 */}
                        <div
                            className={`text-xl md:text-2xl leading-relaxed font-medium mb-24 prose prose-xl max-w-none
                                ${darkMode ? 'prose-invert text-zinc-400' : 'text-slate-600'}`}
                            dangerouslySetInnerHTML={{ __html: content || "내용을 입력해 주세요." }}
                        />
                    </main>
                </div>
            )}
        </div>
    );
}
