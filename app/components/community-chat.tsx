"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Message } from "@/lib/types";

const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Nếu cùng ngày, chỉ hiển thị giờ
    if (messageDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    
    // Nếu khác ngày, hiển thị ngày và giờ
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const getUserColor = (userId: string): string => {
    const colors = [
        "bg-rose-500",
        "bg-blue-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-violet-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-cyan-500",
    ];
    // Simple hash function to get consistent color for user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export function CommunityChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const { data: session } = authClient.useSession();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch("/api/messages");
            if (!res.ok) {
                console.error("Fetch error:", res.statusText);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, []);

    useEffect(() => {
        const initialFetch = setTimeout(() => {
            fetchMessages();
        }, 0);

        const interval = setInterval(() => {
            fetchMessages();
        }, 3000); // Poll every 3 seconds

        return () => {
            clearTimeout(initialFetch);
            clearInterval(interval);
        };
    }, [fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (!newMessage.trim() || !session) return;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages();
                inputRef.current?.focus();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get unique users for online count
    const uniqueUsers = new Set(messages.map((m) => m.sender_id));
    const onlineCount = uniqueUsers.size;

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-full max-w-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gray-50 py-4 px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-blue-500"
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
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Chat cộng đồng
                            </h3>
                            <p className="text-sm text-gray-500">
                                {onlineCount} người đang online
                            </p>
                        </div>
                    </div>
                    {/* Online users avatars */}
                    <div className="flex -space-x-2">
                        {Array.from(uniqueUsers)
                            .slice(0, 4)
                            .map((userId) => {
                                const userMessage = messages.find((m) => m.sender_id === userId);
                                if (!userMessage) return null;
                                const color = getUserColor(userId);
                                return (
                                    <div
                                        key={userId}
                                        className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center`}
                                        title={userMessage.sender_name}
                                    >
                                        <span className="text-xs text-white font-medium">
                                            {getInitials(userMessage.sender_name)}
                                        </span>
                                    </div>
                                );
                            })}
                        {uniqueUsers.size > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600 font-medium">
                                    +{uniqueUsers.size - 4}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 bg-white" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>Chưa có tin nhắn nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwnMessage =
                                message.sender_id === session?.user.id;
                            const showAvatar =
                                index === 0 ||
                                messages[index - 1].sender_id !== message.sender_id;
                            const userColor = getUserColor(message.sender_id);

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${
                                        isOwnMessage ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    {showAvatar ? (
                                        <div
                                            className={`w-8 h-8 rounded-full ${userColor} shrink-0 flex items-center justify-center text-white text-xs font-medium`}
                                        >
                                            {getInitials(message.sender_name)}
                                        </div>
                                    ) : (
                                        <div className="w-8 shrink-0" />
                                    )}

                                    <div
                                        className={`flex flex-col ${
                                            isOwnMessage
                                                ? "items-end"
                                                : "items-start"
                                        } max-w-[75%]`}
                                    >
                                        {showAvatar && (
                                            <div
                                                className={`flex items-center gap-2 mb-1 ${
                                                    isOwnMessage
                                                        ? "flex-row-reverse"
                                                        : ""
                                                }`}
                                            >
                                                <span className="text-sm font-medium text-gray-800">
                                                    {message.sender_name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(
                                                        message.createdAt ||
                                                            message.created_at ||
                                                            new Date()
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 ${
                                                isOwnMessage
                                                    ? "bg-blue-500 text-white rounded-br-md"
                                                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Input */}
            {session ? (
                <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-200 bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition duration-300 shrink-0"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-4 border-t border-gray-200 text-center text-gray-500 bg-gray-50">
                    <p className="text-sm">
                        Đăng nhập để tham gia chat cộng đồng
                    </p>
                </div>
            )}
        </div>
    );
}
