"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Donation {
    id: number;
    amount: number;
    message: string;
    code: string;
    created_at: string;
    transfered: boolean;
}

export default function Me() {
    // Lấy session của người dùng
    const { data: session, isPending } = authClient.useSession();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        const fetchDonations = async () => {
            if (!session?.user?.id) return;

            setLoadingDonations(true);
            try {
                const response = await fetch("/api/my-donations");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setDonations(data.donations || []);
                    }
                }
            } catch (error) {
                console.error("Error fetching donations:", error);
            } finally {
                setLoadingDonations(false);
            }
        };

        if (session?.user?.id) {
            fetchDonations();
        }
    }, [session?.user?.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                <div className="flex justify-between items-center mb-4">
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

                {loadingDonations ? (
                    <p className="text-center text-gray-500 py-8">
                        Đang tải...
                    </p>
                ) : donations.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                            Bạn chưa có lần ủng hộ nào.
                        </p>
                        <Link
                            href="/donate"
                            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300"
                        >
                            Ủng hộ ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {donations.map((donation) => (
                            <div
                                key={donation.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-lg font-semibold text-green-600">
                                                {donation.amount.toLocaleString(
                                                    "vi-VN",
                                                )}{" "}
                                                VND
                                            </span>

                                        </div>
                                        {donation.message && (
                                            <p className="text-gray-700 mb-2">
                                                "{donation.message}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {formatDate(donation.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
