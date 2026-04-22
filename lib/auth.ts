import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Your Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        if (credentials.loginType === "phone") {
          const { phone, otp } = credentials;
          if (!phone || !otp) throw new Error("Phone and OTP are required");

          const otpRecord = await prisma.otpCode.findUnique({ where: { phone } });
          if (!otpRecord) throw new Error("Invalid OTP");

          if (otpRecord.expiresAt < new Date()) {
            throw new Error("OTP Expired");
          }

          if (otpRecord.attempts >= 3) {
            throw new Error("Maximum OTP attempts reached. Please request a new one.");
          }

          if (otpRecord.code !== otp) {
            await prisma.otpCode.update({
              where: { phone },
              data: { attempts: { increment: 1 } }
            });
            throw new Error("Invalid OTP");
          }

          // OTP is valid
          await prisma.otpCode.delete({ where: { id: otpRecord.id } });

          let user = await prisma.user.findUnique({
            where: { phone },
            include: { role: true }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                phone,
                name: "User " + phone,
              },
              include: { role: true }
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role?.name || "customer"
          };
        } else {
          // Existing Email Login
          if (!credentials.email || !credentials.password) return null;

          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
            include: { role: true }
          });

          if (!user || !user.password) return null;
          
          const isMatch = await verifyPassword(credentials.password, user.password);
          if (!isMatch) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role?.name || "customer"
          };
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-for-dev",
};
