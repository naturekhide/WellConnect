import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

var prisma = new PrismaClient();

export var { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    console.log("AUTH DEBUG: Missing identifier or password");
                    return null;
                }

                var user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier as string },
                            { username: credentials.identifier as string },
                        ],
                    },
                });

                if (!user || !user.password) {
                    console.log("AUTH DEBUG: User not found for", credentials.identifier);
                    return null;
                }

                var isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    console.log("AUTH DEBUG: Invalid password for", credentials.identifier);
                    return null;
                }

                // 🚨 EMAIL VERIFICATION CHECK WITH AUTO-VERIFY
                if (!user.emailVerified) {
                    var accountAge = Date.now() - new Date(user.createdAt).getTime();
                    var threeDays = 3 * 24 * 60 * 60 * 1000;

                    if (accountAge > threeDays) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { emailVerified: true }
                        });
                        console.log("AUTH DEBUG: Auto-verified old account", user.email);
                    } else {
                        console.log("AUTH DEBUG: Unverified new account", user.email);
                        throw new Error("Please verify your email address first.");
                    }
                }

                console.log("AUTH DEBUG: Login successful for", user.email);
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
                (session.user as any).username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
});