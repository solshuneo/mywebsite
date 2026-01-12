export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role: "user" | "admin";
    banned?: boolean;
    banReason?: string | null;
    banExpires?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date | string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Message {
    id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
}

export interface Account {
    id: string;
    userId: string;
    accountId: string;
    providerId: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    idToken?: string | null;
    expiresAt?: Date | string | null;
    password?: string | null;
}
