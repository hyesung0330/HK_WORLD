"use client"

import { loginWithKakao } from "@/lib/actions/auth"

export default function KaKaoJoinButton() {
    return (
        <button
            onClick={() => loginWithKakao()}
            // 카카오 공식 배경색: #FEE500, 텍스트색: #000000
            className="relative flex items-center justify-center w-full px-4 py-3 rounded-lg bg-[#FEE500] text-[#000000] font-medium hover:bg-[#FADA00] transition-all shadow-sm active:scale-[0.98]"
        >
            {/* 카카오 로고 (말풍선 심볼) 좌측 고정 */}
            <div className="absolute left-4 flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.315 6.055-.18.65-.653 2.35-.748 2.72-.117.457.162.45.342.33.138-.092 2.21-1.503 3.102-2.112.63.09 1.28.14 1.98.14 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                </svg>
            </div>

            {/* 텍스트 영역: 중앙 정렬 */}
            <span className={"ml-4 font-semibold"}>Kakao로 시작하기</span>
        </button>
    )
}