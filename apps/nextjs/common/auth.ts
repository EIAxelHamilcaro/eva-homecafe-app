import { db } from "@packages/drizzle";
import * as schema from "@packages/drizzle/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { ResendService } from "@/adapters/services/email/resend.service";
import { EmailTemplates } from "@/application/services/email/templates";

const emailProvider = new ResendService();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const template = EmailTemplates.passwordReset(url);
      await emailProvider.send({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [nextCookies()],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = BetterAuthSession["user"];
export type BetterAuthSessionData = BetterAuthSession["session"];
