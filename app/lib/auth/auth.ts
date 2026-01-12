import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import pool from "../db";

export const auth = betterAuth({
    database: pool,
    experimental: { joins: true },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
            banned: {
                type: "boolean",
                defaultValue: false,
            },
            banReason: {
                type: "string",
                required: false,
            },
            banExpires: {
                type: "date",
                required: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        disableSignUp: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [admin()],
});
