import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        adminClient(), // Giúp client gọi được các hàm admin.listUsers, v.v.
    ],
});
