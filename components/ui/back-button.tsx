"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
    className?: string;
    text?: string;
    onClick?: () => void;
}

export function BackButton({ className = "mb-10 md:mb-16", text = "뒤로", onClick }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.back();
        }
    };

    return (
        <div className={`flex items-center justify-between ${className}`}>
            <button
                onClick={handleClick}
                className="group flex items-center gap-3 opacity-40 hover:opacity-100 transition-all"
            >
                <div className={"flex flex-row gap-2 justify-items-center"}>
                    <ChevronLeft className="w-7 h-7" />
                    <span className="text-lg font-black group-hover:-translate-x-1">{text}</span>
                </div>
            </button>
        </div>
    );
}
