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
                console.log("Login attempt with:", credentials?.identifier);

                if (!credentials?.identifier || !credentials?.password) return null;

                var user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier as string },
                            { username: credentials.identifier as string },
                        ],
                    },
                });

                console.log("User found:", user ? user.email : "none");

                if (!user || !user.password) return null;

                var isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                console.log("Password valid:", isValid);

                if (!isValid) return null;

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