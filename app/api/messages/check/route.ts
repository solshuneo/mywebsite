import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lastMessageId = searchParams.get("lastMessageId");

        if (!lastMessageId) {
            return NextResponse.json({ hasNew: true });
        }

        // Check if there are any messages newer than lastMessageId
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM message WHERE id > ?`,
            [lastMessageId]
        );

        const count = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).count : 0;

        return NextResponse.json({ hasNew: count > 0 });
    } catch (error: unknown) {
        console.error("Check messages error:", error);
        return NextResponse.json(
            { error: "Failed to check messages" },
            { status: 500 },
        );
    }
}
