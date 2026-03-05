"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, User, Heart, MessageSquare, Trophy, Info, UserPlus } from "lucide-react";
import { useTheme } from "@/app/context/darkmood";
import { useSession } from "next-auth/react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";

export default function NotificationBell() {
    const { darkMode } = useTheme();
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const prevNotificationsRef = useRef<any[]>([]);

    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (!session) return;
        if (isInitial) setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                
                // 새 알림 감지 및 토스트 표시
                if (!isInitial && data.length > 0 && prevNotificationsRef.current.length > 0) {
                    const newNotifications = data.filter(
                        (n: any) => !prevNotificationsRef.current.some((prev: any) => prev.id === n.id)
                    );
                    
                    newNotifications.forEach((n: any) => {
                        if (!n.isRead) {
                            const message = getNotificationMessage(n);
                            toast(n.sender?.name || "알림", {
                                description: message,
                                icon: getNotificationIcon(n.type),
                            });
                        }
                    });
                }

                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
                prevNotificationsRef.current = data;
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchNotifications(true);
            // 실시간성을 위해 폴링 (30초마다)
            const interval = setInterval(() => fetchNotifications(false), 30000);
            return () => clearInterval(interval);
        }
    }, [session, fetchNotifications]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "FOLLOW": return <UserPlus size={16} className="text-blue-500" />;
            case "LIKE": return <Heart size={16} className="text-rose-500 fill-rose-500" />;
            case "COMMENT": return <MessageSquare size={16} className="text-emerald-500" />;
            case "AWARD": return <Trophy size={16} className="text-amber-500" />;
            default: return <Info size={16} className="text-indigo-500" />;
        }
    };

    const getNotificationMessage = (notif: any) => {
        switch (notif.type) {
            case "FOLLOW": return "님이 회원님을 팔로우하기 시작했습니다.";
            case "LIKE": return "님이 회원님의 게시글을 좋아합니다.";
            case "COMMENT": return "님이 회원님의 게시글에 댓글을 남겼습니다.";
            case "AWARD": return "님이 회원님에게 베스트 에디터 메달을 수여했습니다!";
            case "SYSTEM": return notif.content || "시스템 알림이 도착했습니다.";
            default: return " 알림이 도착했습니다.";
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (id) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }
        setIsOpen(false);

        if (notif.type === "FOLLOW" && notif.senderId) {
            router.push(`/user/${notif.senderId}`);
        } else if (notif.postId && notif.post) {
            const postType = notif.post.postType;
            let path = "";
            switch (postType) {
                case "TECHNICAL": path = `/main/content/content_comunity/${notif.postId}`; break;
                case "COLUMN": path = `/main/content/content_c/${notif.postId}`; break;
                case "PIECE": path = `/main/content/content_sell/${notif.postId}`; break;
                default: path = `/main/content/content_comunity/${notif.postId}`;
            }
            router.push(path);
        }
    };

    if (!session) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button 
                    className={`relative p-2 rounded-full transition-all active:scale-95 flex items-center justify-center
                        ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    onClick={() => {
                        setIsOpen(true);
                        fetchNotifications();
                    }}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#0a0a0a] rounded-full" />
                    )}
                </button>
            </SheetTrigger>
            <SheetContent 
                side="right" 
                className={`w-full sm:max-w-md p-0 border-none flex flex-col
                    ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}
            >
                <div className="pt-6 px-6">
                    <BackButton 
                        onClick={() => setIsOpen(false)} 
                        className="mb-0"
                    />
                </div>
                <SheetHeader className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <SheetTitle className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            알림
                        </SheetTitle>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => markAsRead()}
                                className="text-[10px] font-bold text-indigo-500 hover:underline"
                            >
                                모두 읽음으로 표시
                            </button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && notifications.length === 0 ? (
                        <div className="py-20 flex justify-center">
                            <Loading />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y border-white/5">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-5 flex items-start gap-4 cursor-pointer transition-colors border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}
                                        ${!notif.isRead ? (darkMode ? 'bg-indigo-500/5' : 'bg-indigo-50/50') : (darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50')}`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="w-10 h-10 border border-white/10 grayscale hover:grayscale-0 transition-all">
                                            <AvatarImage src={notif.sender?.image} />
                                            <AvatarFallback className="bg-indigo-600 text-white font-bold">
                                                {notif.sender?.name?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${darkMode ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'bg-white border-white'} shadow-sm`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm leading-snug">
                                            <span className="font-bold">{notif.sender?.name || "Textra"}</span>
                                            {getNotificationMessage(notif)}
                                        </p>
                                        <p className="text-[10px] opacity-40 font-medium">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center opacity-30">
                            <Bell size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">새로운 알림이 없습니다</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
