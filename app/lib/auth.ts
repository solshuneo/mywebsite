import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
    database: createPool({
        host: "localhost",
        user: "shuneo",
        password: "password",
        database: "mywebsite",
        timezone: "+07:00", // Consistent timezone for Vietnam
    }),
    experimental: { joins: true },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
});
