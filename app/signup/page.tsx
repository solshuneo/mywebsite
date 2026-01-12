"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error: authError } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/",
        });

        setLoading(false);

        if (authError) {
            setError(authError.message || "An error occurred during sign up");
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form
                onSubmit={handleSignUp}
                className="p-8 border rounded-lg shadow-md w-96 flex flex-col gap-4"
            >
                <h1 className="text-2xl font-bold mb-4">Create Account</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition disabled:bg-green-300"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-sm text-center mt-2">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-blue-500 hover:underline">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
}
