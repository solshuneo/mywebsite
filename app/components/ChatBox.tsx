"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Message } from "@/lib/types";

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const { data: session } = authClient.useSession();
    const scrollRef = useRef<HTMLDivElement>(null);

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
        // Wrap in setTimeout 0 to avoid cascading renders during the initial effect run
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

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const res = await fetch("/api/messages", {
            method: "POST",
            body: JSON.stringify({ content: newMessage }),
        });

        if (res.ok) {
            setNewMessage("");
            fetchMessages();
        }
    };

    return (
        <div className="flex flex-col w-full max-w-2xl h-125 border rounded-lg shadow-lg bg-white">
            <div className="p-4 border-b font-bold bg-gray-50">
                Community Chat
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender_id === session?.user.id ? "items-end" : "items-start"}`}
                    >
                        <span className="text-xs text-gray-500 mb-1">
                            {msg.sender_name}
                        </span>
                        <div
                            className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                                msg.sender_id === session?.user.id
                                    ? "bg-blue-500 text-white rounded-tr-none"
                                    : "bg-gray-200 text-black rounded-tl-none"
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {session ? (
                <form
                    onSubmit={sendMessage}
                    className="p-4 border-t flex gap-2"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-full px-4 outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition">
                        Send
                    </button>
                </form>
            ) : (
                <div className="p-4 border-t text-center text-gray-500 bg-gray-50">
                    Please sign in to join the conversation.
                </div>
            )}
        </div>
    );
}
