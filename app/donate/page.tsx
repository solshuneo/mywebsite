"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { DonateForm } from "@/components/donate-form";

export default function DonatePage() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">
                        Bạn cần đăng nhập để ủng hộ
                    </p>
                    <Link
                        href="/signin"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Ủng hộ Shuneo.com
                </h1>
                <DonateForm />
            </div>
        </main>
    );
}
