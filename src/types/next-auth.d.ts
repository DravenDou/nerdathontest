// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      role?: "coordinator" | "user";
    } & DefaultSession["user"];
  }
}
