"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

type Step = "form" | "qr" | "success";

export function DonateForm() {
    const [step, setStep] = useState<Step>("form");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [donationCode, setDonationCode] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");
    const { data: session } = authClient.useSession();

    const handleGenerateQR = async () => {
        if (!amount || Number.parseInt(amount) <= 0) return;

        setIsGenerating(true);
        try {
            const response = await fetch("/api/donate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount, message }),
            });

            const data = await response.json();

            if (data.success) {
                const code = data.code;
                setDonationCode(code);

                // Get bank info from environment (these should be NEXT_PUBLIC_ prefixed)
                const bankId = process.env.NEXT_PUBLIC_BANK_ID || "970422";
                const accountNo = process.env.NEXT_PUBLIC_ACCOUNT_NO || "";

                if (!accountNo) {
                    console.error(
                        "Account Number is not configured in environment variables.",
                    );
                    setIsGenerating(false);
                    return;
                }

                const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${encodeURIComponent(code)}`;
                setQrCodeUrl(url);
                setPaymentStatus("pending");
                setStep("qr");
            } else {
                console.error("Failed to generate donation code:", data.message);
            }
        } catch (error) {
            console.error("Error generating donation code:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (step !== "qr" || !donationCode || !session?.user.id) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/check-payment?code=${donationCode}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.paid) {
                        setPaymentStatus("paid");
                        setStep("success");
                        clearInterval(interval);
                    }
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [step, donationCode, session]);

    const handleReset = () => {
        setStep("form");
        setAmount("");
        setMessage("");
        setDonationCode("");
        setQrCodeUrl("");
        setPaymentStatus("pending");
    };

    if (step === "success") {
        return (
            <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-100 p-4">
                        <svg
                            className="h-12 w-12 text-green-500"
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
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Cảm ơn bạn rất nhiều!
                </h2>
                <p className="text-gray-600 mb-6">
                    Chúng tôi đã nhận được khoản ủng hộ{" "}
                    <span className="font-semibold text-blue-600">
                        {Number.parseInt(amount).toLocaleString("vi-VN")}đ
                    </span>{" "}
                    của bạn.
                </p>
                {message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 italic">"{message}"</p>
                    </div>
                )}
                <div className="space-y-3">
                    <Link
                        href="/me"
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 text-center"
                    >
                        Về trang cá nhân
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 text-center"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    if (step === "qr") {
        return (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Quét mã QR để chuyển khoản
                    </h2>
                    <p className="text-gray-600">
                        Số tiền:{" "}
                        <span className="font-semibold text-gray-800">
                            {Number.parseInt(amount).toLocaleString("vi-VN")}đ
                        </span>
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-lg border-2 border-dashed border-blue-300 p-4 bg-gray-50">
                            {qrCodeUrl && (
                                <Image
                                    src={qrCodeUrl}
                                    alt="QR Code chuyển khoản"
                                    width={256}
                                    height={256}
                                    className="object-contain"
                                />
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                Nội dung chuyển khoản:
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                                {message || donationCode}
                            </p>
                        </div>
                    )}

                    {paymentStatus === "pending" && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                Đang chờ xác nhận thanh toán...
                            </p>
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => setStep("form")}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Thông tin ủng hộ
                </h2>
                <p className="text-gray-600 text-sm">
                    Nhập số tiền và lời nhắn của bạn
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Số tiền (VNĐ)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="50000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {[50000, 100000, 200000, 500000].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAmount(preset.toString())}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded transition duration-300"
                            >
                                {preset.toLocaleString("vi-VN")}đ
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Lời nhắn (không bắt buộc)
                    </label>
                    <textarea
                        id="message"
                        placeholder="Chúc dự án phát triển..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                <button
                    onClick={handleGenerateQR}
                    disabled={
                        !amount ||
                        Number.parseInt(amount) <= 0 ||
                        isGenerating
                    }
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang tạo mã QR...
                        </>
                    ) : (
                        <>
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                />
                            </svg>
                            Sinh mã QR
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
