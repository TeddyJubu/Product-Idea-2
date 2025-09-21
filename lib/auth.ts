import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * Preflight checks for EmailProvider configuration (no secrets logged)
 */
const REQUIRED_EMAIL_ENV = [
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
];

const missingEmailEnv = REQUIRED_EMAIL_ENV.filter((k) => !process.env[k]);
if (missingEmailEnv.length) {
  console.warn("[Auth] Missing env vars:", missingEmailEnv.join(", "));
}

// Check for nodemailer presence (EmailProvider requires it)
(async () => {
  try {
    await import("nodemailer");
  } catch (e) {
    console.warn("[Auth] Nodemailer not installed. Install with: npm i nodemailer");
  }
})();

/**
 * SMTP configuration derived from environment
 * - If EMAIL_SERVER_SECURE is not set, default to secure when port === 465
 */
const smtpPort = Number(process.env.EMAIL_SERVER_PORT || 587);
const smtpSecure = process.env.EMAIL_SERVER_SECURE
  ? process.env.EMAIL_SERVER_SECURE === "true"
  : smtpPort === 465;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  debug: true,
  logger: {
    error(code, metadata) {
      console.error("[NextAuth error]", code, metadata);
    },
    warn(code, metadata) {
      console.warn("[NextAuth warn]", code, metadata);
    },
    debug(code, metadata) {
      console.debug("[NextAuth debug]", code, metadata);
    },
  },
  events: {
    async sendVerificationRequest({ identifier, url, provider }: any) {
      try {
        const safeUrl = typeof url === "string" ? url.split("?")[0] : "";
        console.info("[Auth] Sending verification email", {
          to: identifier,
          providerId: provider?.id,
          host: process.env.EMAIL_SERVER_HOST,
          from: process.env.EMAIL_FROM,
        });
        // Do not log the full URL with token
        console.info("[Auth] Magic link URL host", { safeUrl });
      } catch (err) {
        console.warn("[Auth] Failed to log sendVerificationRequest", err);
      }
    },
  },
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
                workspace: true,
              },
            },
          },
        });

        if (userWithWorkspaces) {
          (session.user as any).workspaces = userWithWorkspaces.memberships.map((membership) => ({
            id: membership.workspace.id,
            name: membership.workspace.name,
            role: membership.role,
          }));
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
};

export default NextAuth(authOptions);
