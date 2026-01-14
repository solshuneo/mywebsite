"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DonationHistory } from "@/components/donation-history";

export default function Me() {
    // Lấy session của người dùng
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">
                Chào mừng trở lại, {session.user?.name || "bạn"}!
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">
                        Lịch sử ủng hộ của bạn
                    </h2>
                    <Link
                        href="/donate"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Ủng hộ ngay
                    </Link>
                </div>

                <DonationHistory />
            </div>
        </div>
    );
}
