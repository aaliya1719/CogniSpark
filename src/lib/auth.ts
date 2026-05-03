import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DefaultSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as DefaultSession["user"] & { id?: string };
        user.id = token.sub ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
