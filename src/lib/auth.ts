// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isCoordinator } from "./roles"; // <-- Importa la nueva función

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/classroom.courses.readonly",
            "https://www.googleapis.com/auth/classroom.rosters.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
            "https://www.googleapis.com/auth/classroom.profile.emails", // <-- AÑADE ESTA LÍNEA
          ].join(" "),
        },
      },
    }),
  ],
  // AÑADIR ESTA SECCIÓN DE CALLBACKS
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        // --- AÑADE ESTA LÍNEA PARA INCLUIR EL ROL ---
        session.user.role = isCoordinator(session.user.email)
          ? "coordinator"
          : "user";
      }
      return session;
    },
  },
});
