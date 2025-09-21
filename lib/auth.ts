import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD }
      },
      from: process.env.EMAIL_FROM
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.userId && session.user) {
        (session.user as any).id = token.userId as string;

        // Get user's workspaces
        const userWithWorkspaces = await prisma.user.findUnique({
          where: { id: token.userId as string },
          include: {
            memberships: {
              include: {
                workspace: true
              }
            }
          }
        });

        if (userWithWorkspaces) {
          (session.user as any).workspaces = userWithWorkspaces.memberships.map(membership => ({
            id: membership.workspace.id,
            name: membership.workspace.name,
            role: membership.role
          }));
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  }
};

export default NextAuth(authOptions);
