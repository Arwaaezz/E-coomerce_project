// src/lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { FailedLoginResponse, SuccessLoginResponse } from "@/interfaces";

function decodeJwtPayload(token: string) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const response = await fetch(
          "https://ecommerce.routemisr.com/api/v1/auth/signin",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );

        const payload: SuccessLoginResponse | FailedLoginResponse =
          await response.json().catch(() => ({} as any));

        if (!response.ok) {
          throw new Error((payload as any)?.message || "Login failed");
        }

        if (!("token" in payload) || !payload.token) {
          throw new Error((payload as any)?.message || "Missing token");
        }

        const decoded = decodeJwtPayload(payload.token);
        const userId =
          (payload as any)?.user?._id ||
          decoded?.id ||
          decoded?._id ||
          decoded?.userId ||
          null;

        return {
          id: userId || (payload as any)?.user?.email,
          user: { ...(payload as any).user, _id: userId || (payload as any)?.user?._id },
          token: payload.token,
        };
      },
    }),
  ],

  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = (user as any).user;
        token.token = (user as any).token;
        token.userId = (user as any).id;
      }
      return token;
    },

    session: ({ session, token }) => {
      (session as any).user = token.user;
      (session as any).token = token.token;
      (session as any).userId = token.userId;

      if ((session as any)?.user && !(session as any).user._id && token.userId) {
        (session as any).user._id = token.userId;
      }

      return session;
    },
  },

  pages: { signIn: "/login" },
};
