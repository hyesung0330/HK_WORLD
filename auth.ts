import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordMatch = await bcryptjs.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordMatch) {
                    return null;
                }

                return user as any;
            }
        }),
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
                token.xp = (user as any).xp || 0;
                token.points = (user as any).points || 0;
                token.role = (user as any).role || "JUNIOR";
                token.github = (user as any).githubUrl || (user as any).github || null;
                token.bio = (user as any).bio || null;
            }
            if (trigger === "update" && session) {
                if (session.user?.name) token.name = session.user.name;
                if (session.user?.github) token.github = session.user.github;
                if (session.user?.bio) token.bio = session.user.bio;
                if (session.user?.xp !== undefined) token.xp = session.user.xp;
                if (session.user?.level !== undefined) token.level = session.user.level;
                if (session.user?.points !== undefined) token.points = session.user.points;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                (session.user as any).level = token.level as number;
                (session.user as any).xp = token.xp as number;
                (session.user as any).points = token.points as number;
                (session.user as any).role = token.role as string;
                (session.user as any).github = token.github as string;
                (session.user as any).bio = token.bio as string;
            }
            return session;
        },
    },
    secret: process.env.KAKAO_AUTH_SECRET,
})