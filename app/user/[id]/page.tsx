"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainHeader from "@/components/header/main_header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/app/context/darkmood";
import { Loading } from "@/components/ui/loading";
import { Heart, Eye, MessageSquare, Settings, Check, X, UserPlus, UserCheck } from "lucide-react";
import {calculateLevel} from "@/lib/xp";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "sonner";

export default function UserProfilePage() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recent" | "popular">("recent");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  useEffect(() => {
    setMounted(true);
    if (id) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/user/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsFollowing(data.isFollowing);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const isOwnPage = useMemo(() => String(session?.user?.id) === String(id), [session, id]);

  const handleEditClick = () => {
    setEditForm({ name: user.name || "", bio: user.bio || "" });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`/api/user/${id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: editForm.name,
          bio: editForm.bio
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, name: data.user.name, bio: data.user.bio });
        if (update) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: data.user.name,
              bio: data.user.bio
            }
          });
        }
        setIsEditing(false);
      } else {
        const error = await res.json();
        alert(error.message || "프로필 수정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const handleToggleFollow = async () => {
    if (!session) {
      toast.error("로그인이 필요한 기능입니다.");
      return;
    }
    if (isOwnPage) return;

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/user/${id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setUser((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: data.isFollowing ? prev._count.followers + 1 : prev._count.followers - 1
          }
        }));
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("팔로우 처리 중 오류가 발생했습니다.");
    } finally {
      setFollowLoading(false);
    }
  };

  const { level, currentLevelProgress, nextLevelRequiredXp } = useMemo(() => {
    if (!user) return { level: 1, currentLevelProgress: 0, nextLevelRequiredXp: 100 };

    // API 응답 데이터(user.xp)를 숫자로 확실히 변환
    const userXp = Number(user.xp || 0);
    return calculateLevel(userXp);
  }, [user?.xp]);

  if (!mounted) return null;

  if (loading) return <Loading fullScreen />;

  const posts = (user?.posts || []).slice().sort((a: any, b: any) => {
    if (tab === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b._count?.likes || 0) - (a._count?.likes || 0);
  });

  return (
      <div className={`min-h-screen transition-all ${darkMode ? 'bg-[#0f0f0f] text-zinc-100' : 'bg-[#f8f9fa] text-zinc-800'}`}>
        <MainHeader />

        {/* 커버 영역 */}
        <div className={`h-48 md:h-64 w-full ${darkMode ? 'bg-gradient-to-r from-zinc-800 to-zinc-900' : 'bg-gradient-to-r from-indigo-50 to-indigo-50'}`} />

        <main className="max-w-4xl mx-auto px-5 pb-20 relative">
          <div className="pt-6 md:pt-10 mb-4">
            <BackButton />
          </div>
          
          {/* 프로필 카드 */}
          <div className={`p-8 rounded-[2.5rem] shadow-sm border -mt-16 md:-mt-24 relative z-10 ${darkMode ? 'bg-[#1a1a1a] border-zinc-800' : 'bg-white border-white'}`}>
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <Avatar className="w-32 h-32 rounded-[2rem] shadow-xl -mt-16 md:-mt-24 border-4 border-white dark:border-[#1a1a1a]">
                <AvatarImage src={user.image} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-zinc-200 dark:bg-zinc-700">
                  {user.name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {isEditing ? (
                      <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className={`text-2xl font-bold tracking-tight h-auto p-0 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 ${darkMode ? 'border-white/10' : 'border-zinc-200'}`}
                          placeholder="닉네임"
                      />
                  ) : (
                      <>
                        <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                        <Badge variant="secondary" className="rounded-full px-3 py-0 text-[11px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {/* 레벨 정보를 뱃지 텍스트에도 포함 가능 (예: LV.{level}) */}
                          {
                            user.role === "JUNIOR" ? "주니어 에디터" :
                                user.role === "SENIOR" ? "시니어 에디터" :
                                    user.role === "PRO" ? "프로 에디터" :
                                        user.role === "PROFESSIONAL" ? "전문 에디터" : "에디터"
                          }
                        </Badge>
                        <div className="flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                            <span className="text-[10px] font-black tracking-tighter">{user.points?.toLocaleString() || 0}P</span>
                        </div>
                      </>
                  )}
                </div>
                {isEditing ? (
                    <Input
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className={`text-sm leading-relaxed h-auto p-0 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 mt-2 ${darkMode ? 'border-white/10' : 'border-zinc-200'}`}
                        placeholder="자기소개를 입력해주세요"
                    />
                ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                      {user.bio || "아직 소개가 없지만, 멋진 분일 거예요."}
                    </p>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnPage ? (
                    isEditing ? (
                        <div className="flex gap-2">
                          <Button onClick={handleSave} className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-6">
                            <Check size={18} className="mr-2" /> 저장
                          </Button>
                          <Button onClick={handleCancel} variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-700">
                            <X size={18} />
                          </Button>
                        </div>
                    ) : (
                        <Button onClick={handleEditClick} variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <Settings size={18} className="mr-2" /> 프로필 수정
                        </Button>
                    )
                ) : (
                    <Button 
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                        className={`rounded-full px-8 font-black transition-all ${isFollowing ? 'bg-zinc-200 text-zinc-600 dark:bg-white/10 dark:text-zinc-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isFollowing ? (
                            <><UserCheck size={18} className="mr-2" /> 팔로잉</>
                        ) : (
                            <><UserPlus size={18} className="mr-2" /> 팔로우</>
                        )}
                    </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-baseline justify-center gap-2 border-r border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">팔로워</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{user._count?.followers || 0}</span>
              </div>

              <div className="flex items-baseline justify-center gap-2 border-r border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">게시물</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{user._count?.posts || 0}</span>
              </div>

              {/* 하단 레벨 텍스트 동기화 */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">레벨</span>
                <span className="text-xl font-bold text-indigo-500">{level}</span>
              </div>
            </div>

            {/* XP 프로그래스바 동기화 */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black opacity-80">경험치</span>
                </div>
                <span className="text-xs font-bold text-indigo-500/80">
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-indigo-500/20 text-indigo-500 font-bold mr-2">
                    다음 레벨까지
                  </Badge>
                  {currentLevelProgress}<span className="text-[10px] opacity-40 ml-0.5">/ {nextLevelRequiredXp} XP</span>
                </span>
              </div>
              <Progress value={(currentLevelProgress / nextLevelRequiredXp) * 100} className="h-2 bg-zinc-100 dark:bg-zinc-800/50" />
            </div>

            {/* 포인트 및 정산 섹션 (본인 페이지인 경우에만 표시) */}
            {isOwnPage && (
              <div className="mt-6 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest opacity-60 mb-1">나의 정산 포인트</span>
                  <span className="text-3xl font-black">{user.points?.toLocaleString() || 0} P</span>
                </div>
                <Button 
                    onClick={() => router.push('/main/settlement')}
                    className="w-full md:w-auto px-8 h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  정산 신청하기
                </Button>
              </div>
            )}
          </div>

          {/* 탭 메뉴 */}
          <div className="flex justify-center mt-12 mb-8">
            <div className={`inline-flex p-1 rounded-full ${darkMode ? 'bg-zinc-900' : 'bg-zinc-200/50'}`}>
              <button
                  onClick={() => setTab('recent')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'recent' ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-zinc-500'}`}
              >
                최신순
              </button>
              <button
                  onClick={() => setTab('popular')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'popular' ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-zinc-500'}`}
              >
                인기순
              </button>
            </div>
          </div>

          {/* 게시물 리스트 */}
          <div className="grid gap-4">
            {posts.map((post: any) => (
                <article
                    key={post.id}
                    onClick={() => router.push(`/main/content/content_comunity/${post.id}`)}
                    className={`group p-5 md:p-6 rounded-[1.5rem] transition-all cursor-pointer border hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-[#1a1a1a] border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-100'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                          {post.postType === 'TECHNICAL' ? '일반 컬럼' : post.postType === 'COLUMN' ? '전문 칼럼' : '단편/에세이'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold leading-snug group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                    </div>

                    <div className="flex gap-4 shrink-0 mt-1">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Heart size={16} className={post._count?.likes > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                        <span className="text-sm font-medium">{post._count?.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Eye size={16} />
                        <span className="text-sm font-medium">{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </article>
            ))}

            {posts.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <MessageSquare className="mx-auto mb-3 opacity-20" size={40} />
                  <p className="text-sm font-medium">아직 작성된 글이 없습니다.</p>
                </div>
            )}
          </div>
        </main>
      </div>
  );
}