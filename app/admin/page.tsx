"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const { data: session, isPending } = authClient.useSession();
    const [users, setUsers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!isPending && session?.user.role !== "admin") {
            router.push("/");
        }

        if (session?.user.role === "admin") {
            // Gọi API có sẵn của plugin để lấy danh sách user
            authClient.admin.listUsers({ query: { limit: 10 } }).then((res) => {
                if (res.data) setUsers(res.data.users);
            });
        }
    }, [session, isPending, router]);

    if (isPending) return <p>Loading...</p>;
    if (session?.user.role !== "admin") return null;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                    Danh sách người dùng
                </h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Tên</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Quyền</th>
                            <th className="p-2">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b">
                                <td className="p-2">{u.name}</td>
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">{u.role}</td>
                                <td className="p-2">
                                    <button className="text-red-500 hover:underline">
                                        Ban
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
