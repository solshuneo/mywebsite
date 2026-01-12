"use client";

import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";

export default function Home() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-3xl font-bold">Welcome to My Website</h1>

            {session ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-lg">
                        Hello,{" "}
                        <span className="font-semibold">
                            {session.user.email}
                        </span>
                        !
                    </p>
                    <Link
                        href="/signout"
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Sign Out
                    </Link>
                </div>
            ) : (
                <div className="flex gap-4">
                    <Link
                        href="/signin"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </div>
    );
}
