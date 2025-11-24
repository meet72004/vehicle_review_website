// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "../../../lib/prisma"; // adjust path if needed

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = user.password
          ? await compare(credentials.password, user.password)
          : false;

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
  async session({ session, token }) {
    if (token && session.user) {
      // safely handle optional typing
      session.user.id = token.sub ?? "";
    }
    return session;
  },

  async jwt({ token, user }) {
    if (user) {
      token.id = user.id; // ✅ store id in token
    }
    return token;
  },
},

  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
