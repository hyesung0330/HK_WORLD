"use client"

import {loginWithNaver} from "@/lib/actions/auth";
import { usePathname } from "next/navigation";

export default function NaverjoinButton() {
    const pathname = usePathname();
    return (
        <button
            onClick={() => loginWithNaver(pathname)}
            className="relative flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-[#03C75A] text-white font-medium hover:bg-[#02b351] transition-all shadow-sm active:scale-[0.98]"
        >
            {/* 로고 영역: 네이버 공식 'N' 로고 비율 적용 */}
            <div className="absolute left-5 flex items-center">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M16.273 12.845L7.376 0H0V24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
                        fill="white"
                    />
                </svg>
            </div>

            {/* 텍스트 영역: 구글 버튼과 동일한 여백과 폰트 적용 */}
            <span className="ml-4 font-semibold">NAVER로 시작하기</span>
        </button>
    )
}