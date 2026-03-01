"use server"

import { signIn, signOut } from "@/auth"

export async function loginWithKakao() {
    await signIn("kakao", { redirectTo: "/"})
}

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/"})
}

export async function logout() {
    await signOut()
}