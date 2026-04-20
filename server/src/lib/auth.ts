import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { redisStorage } from "@better-auth/redis-storage";
import { Role, UserStatus } from "../constraint/index";
import { envVars } from "../config/env";
import { prisma } from "./prisma";
import { redis as ioRedis } from "./redis";
import { emailQueue } from "./queue";

const isHttpsUrl = (url: string | undefined) =>
  typeof url === "string" && url.startsWith("https://");

// `SameSite=None` requires `Secure`, which breaks localhost over http.
const authCookieSecure =
  envVars.NODE_ENV === "production" ||
  isHttpsUrl(envVars.BETTER_AUTH_URL) ||
  isHttpsUrl(envVars.FRONTEND_URL);

const authCookieSameSite = authCookieSecure ? "none" : "lax";

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    secondaryStorage: redisStorage({
      client: ioRedis,
      keyPrefix: "auth:",
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    socialProviders:{
      google:{
        clientId: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        redirectURI: envVars.GOOGLE_CALLBACK_URL,
        mapProfileToUser: ()=>{
          return {
            role : Role.OWNER,
            status : UserStatus.ACTIVE,
            needPasswordChange : false,
            emailVerified : true,
            isDeleted : false,
            deletedAt : null,
          }
        }
      }
    },

    emailVerification:{
      sendOnSignUp: false,
      sendOnSignIn: false,
      autoSignInAfterVerification: true,
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: Role.OWNER
        },

        status: {
          type: "string",
          required: true,
          defaultValue: UserStatus.ACTIVE
        },

        needPasswordChange: {
          type: "boolean",
          required: true,
          defaultValue: false
        },

        isDeleted: {
          type: "boolean",
          required: true,
          defaultValue: false
        },

        deletedAt: {
          type: "date",
          required: false,
          defaultValue: null
        },
      }
    },

    plugins: [
      bearer(),
      emailOTP({
        overrideDefaultEmailVerification: true,
        async sendVerificationOTP({email, otp, type}) {
          let name = "User";
          try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user?.name) name = user.name;
          } catch {
            // non-fatal — fall back to "User"
          }

          // Offload email sending to BullMQ queue
          await emailQueue.add("send-otp", {
            to: email,
            subject: type === "email-verification" ? "Verify your email" :
                     type === "forget-password" ? "Password Reset OTP" : "OTP Code",
            templateName: "otp",
            templateData: { name, otp, type },
          });
        },
        expiresIn: 10 * 60,
        otpLength: 6,
        rateLimit: { window: 60, max: 10 },
      })
    ],

    session: {
      expiresIn: 24 * 60 * 60, // 1 day in seconds
      updateAge: 24 * 60 * 60, // 1 day in seconds
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes caching on cookie side
        refreshCache: false // disable stateless cookie refresh since we hit redis
      }
    },

    redirectURLs:{
      signIn : `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },

    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Send a cool welcome email via the queue
            await emailQueue.add("send-welcome", {
              to: user.email,
              subject: "Welcome to LaunchForge! 🚀",
              templateName: "welcome",
              templateData: {
                name: user.name || "Founder",
                dashboardUrl: `${envVars.FRONTEND_URL}/dashboard`,
              },
            });
            console.log(`[Auth] Welcome email queued for: ${user.email}`);
          },
        },
      },
    },

    advanced: {
      useSecureCookies: authCookieSecure,
      cookies:{
        state:{
          attributes:{
            sameSite: authCookieSameSite,
            secure: authCookieSecure,
            httpOnly: true,
            path: "/",
          }
        },
        sessionToken:{
          attributes:{
            sameSite: authCookieSameSite,
            secure: authCookieSecure,
            httpOnly: true,
            path: "/",
          }
        }
      }
    }
});
