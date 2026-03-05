"use client";

import React from 'react';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
    message?: string;
    className?: string;
    fullScreen?: boolean;
}

export function Loading({ 
    message = "화면을 가져오고있어요...",
    className,
    fullScreen = false 
}: LoadingProps) {
    const content = (
        <div className={cn(
            "flex flex-col items-center justify-center gap-4",
            className
        )}>
            <div className="relative flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 opacity-20" />
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 absolute inset-0 [animation-delay:-0.15s]" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40 animate-pulse">
                {message}
            </p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
