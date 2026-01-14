"use client";

import { useEffect, useState } from "react";

interface Donation {
    id: number;
    amount: number;
    message: string;
    code: string;
    created_at: string;
    transfered: boolean;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatAmount(amount: number): string {
    const integerAmount = Math.floor(amount);
    return integerAmount.toLocaleString("vi-VN") + "đ";
}

export function DonationHistory() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            setLoading(true);
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
                setLoading(false);
            }
        };

        fetchDonations();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Đang tải...</p>
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <svg
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                <p className="text-gray-500">Bạn chưa có khoản ủng hộ nào</p>
            </div>
        );
    }

    // Tính tổng số tiền đã ủng hộ (chỉ lấy integer)
    const totalAmount = donations.reduce((sum, d) => sum + Math.floor(d.amount), 0);

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng đã ủng hộ</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatAmount(totalAmount)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Số lần</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {donations.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Donation List */}
            <div className="space-y-3">
                {donations.map((donation) => (
                    <div
                        key={donation.id}
                        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {/* Amount */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-green-100 text-green-700 font-semibold text-sm px-3 py-1 rounded">
                                        {formatAmount(donation.amount)}
                                    </span>
                                </div>

                                {/* Message */}
                                {donation.message && (
                                    <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                                        <svg
                                            className="h-4 w-4 text-gray-500 mt-0.5 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                        <p className="line-clamp-2">"{donation.message}"</p>
                                    </div>
                                )}

                                {/* Date */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <svg
                                        className="h-3.5 w-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>{formatDate(donation.created_at)}</span>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <div className="rounded-full bg-red-100 p-2">
                                    <svg
                                        className="h-4 w-4 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
