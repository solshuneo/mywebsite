"use client";

import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import ChatBox from "./components/ChatBox";

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 gap-6">
            <div className="w-full max-w-2xl flex justify-between items-center">
                <h1 className="text-2xl font-bold">Chatbox</h1>

                {session ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                            {session.user.name}
                        </span>
                        <Link
                            href="/me"
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Trang cá nhân
                        </Link>
                        <Link
                            href="/signout"
                            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            Sign Out
                        </Link>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            href="/signin"
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>

            {/* Chat Box ở giữa */}
            <ChatBox />

            {session?.user.role === "admin" && (
                <Link href="/admin" className="text-blue-500 underline text-sm">
                    Go to Admin Dashboard
                </Link>
            )}
        </div>
    );
}
