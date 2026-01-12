import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.execute(
            `SELECT
                m.id,
                m.sender_id,
                m.content,
                m.createdAt,
                u.name as sender_name
             FROM message m
             JOIN user u ON m.sender_id = u.id
             ORDER BY m.createdAt ASC`,
        );

        return NextResponse.json(rows);
    } catch (error: unknown) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { content } = await req.json();

        if (!content || content.trim() === "") {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 },
            );
        }

        const messageId = crypto.randomUUID();

        await pool.execute(
            "INSERT INTO message (id, sender_id, content) VALUES (?, ?, ?)",
            [messageId, session.user.id, content],
        );

        return NextResponse.json({ success: true, id: messageId });
    } catch (error: unknown) {
        console.error("Post message error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
