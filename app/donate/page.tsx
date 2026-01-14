"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function DonatePage() {
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [donationCode, setDonationCode] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<
        "pending" | "paid" | "unpaid"
    >("unpaid");
    const { data: session, isPending } = authClient.useSession();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                // These should be set in your .env.local file
                const bankId = process.env.NEXT_PUBLIC_BANK_ID;
                const accountNo = process.env.NEXT_PUBLIC_ACCOUNT_NO;

                if (!bankId || !accountNo) {
                    console.error(
                        "Bank ID or Account Number is not configured in environment variables.",
                    );
                    // Handle this error in the UI
                    return;
                }

                const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${encodeURIComponent(
                    code,
                )}`;
                setQrCodeUrl(url);
                setPaymentStatus("pending");
            } else {
                console.error(
                    "Failed to generate donation code:",
                    data.message,
                );
                // Handle error appropriately in the UI
            }
        } catch (error) {
            console.error("Error generating donation code:", error);
            // Handle error appropriately in the UI
        }
    };

    useEffect(() => {
        if (paymentStatus !== "pending" || !donationCode || !session?.user.id) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                // This route needs to be created. It should check the database
                // to see if a transaction with the given code has been received.
                const response = await fetch(
                    `/api/check-payment?code=${donationCode}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.paid) {
                        setPaymentStatus("paid");
                        clearInterval(interval);
                    }
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [paymentStatus, donationCode, session]);

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
                <p>You are not already logged in.</p>
                <br></br>
                <Link href="/signin">signin</Link>
            </div>
        );
    }
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <div className="container mx-auto p-4">
                    <h1 className="text-4xl font-bold text-center mb-8">
                        Donate Shuneo.com
                    </h1>

                    {paymentStatus === "paid" && (
                        <div>
                            <h2 className="text-2xl font-bold text-green-500">
                                Thank you for your donation!
                            </h2>
                            <p>Your payment has been received.</p>
                            <Link href="/">back to main page</Link>
                        </div>
                    )}

                    {paymentStatus === "pending" && (
                        <div className="flex flex-col items-center">
                            <h2 className="text-2xl mb-4">
                                Scan QR code to pay
                            </h2>
                            <p>Amount: {amount} VND</p>
                            <p className="mb-4">
                                Message: {message || donationCode}
                            </p>
                            {qrCodeUrl && (
                                <Image
                                    src={qrCodeUrl}
                                    alt="VietQR Code"
                                    width={300}
                                    height={300}
                                />
                            )}
                            <p className="mt-4">
                                Waiting for payment confirmation...
                            </p>
                        </div>
                    )}

                    {paymentStatus === "unpaid" && (
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-md mx-auto"
                        >
                            <div className="mb-4">
                                <label
                                    htmlFor="amount"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Amount (VND)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={amount}
                                    min={2000}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                      disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                    placeholder="Optional message"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Generate QR Code
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
