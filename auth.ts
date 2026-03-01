import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        KakaoProvider({
            clientId: process.env.KAKAO_REST_API_KEY,
            clientSecret: process.env.KAKAO_CLIENT_SECRET_KEY,
            profile(profile) {
                return {
                    id: String(profile.id),
                    name: profile.kakao_account?.profile?.nickname || `작가_${profile.id}`, // nickname -> name
                    email: profile.kakao_account?.email || null,
                    image: profile.kakao_account?.profile?.profile_image_url || null, // avatarUrl -> image
                    reputation: 0,
                    level: 1,
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    secret: process.env.KAKAO_AUTH_SECRET,
})