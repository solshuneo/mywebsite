"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export default function SignOutPage() {
    useEffect(() => {
        const performSignOut = async () => {
            try {
                await authClient.signOut();
            } catch (error) {
                console.error(error);
            } finally {
                // Dùng window.location để đảm bảo trình duyệt tải lại toàn bộ
                window.location.href = "/";
            }
        };

        performSignOut();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-lg font-medium">Signing you out...</p>
        </div>
    );
}
