import { auth } from "@/lib/auth/auth";
import { createPool } from "mysql2/promise";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const db = createPool({
    host: "localhost",
    user: "shuneo",
    password: "password",
    database: "mywebsite",
});

export async function GET() {
    const [rows] = await db.execute(
        "SELECT m.*, u.name as sender_name FROM message m JOIN user u ON m.sender_id = u.id ORDER BY m.createdAt ASC",
    );
    return NextResponse.json(rows);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content)
        return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const messageId = crypto.randomUUID();

    await db.execute(
        "INSERT INTO message (id, sender_id, content) VALUES (?, ?, ?)",
        [messageId, session.user.id, content],
    );

    return NextResponse.json({ success: true });
}
