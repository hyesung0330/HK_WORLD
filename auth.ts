import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

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
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    reputation: 0,
                    level: 1,
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.level = (user as any).level || 1;
                token.github = (user as any).githubUrl || (user as any).github || null;
            }
            if (trigger === "update" && session) {
                if (session.user?.name) token.name = session.user.name;
                if (session.user?.github) token.github = session.user.github;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                (session.user as any).level = token.level as number;
                (session.user as any).github = token.github as string;
            }
            return session;
        },
    },
    secret: process.env.KAKAO_AUTH_SECRET,
})