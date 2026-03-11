"use server"

import { signIn, signOut } from "@/auth"

export async function loginWithKakao(redirectTo?: string) {
    await signIn("kakao", { redirectTo: redirectTo || "/"})
}

export async function loginWithGoogle(redirectTo?: string) {
    await signIn("google", { redirectTo: redirectTo || "/"})
}

export async function loginWithNaver(redirectTo?: string) {
    await signIn("naver", { redirectTo: redirectTo || "/"})
}

export async function logout() {
    await signOut()
}