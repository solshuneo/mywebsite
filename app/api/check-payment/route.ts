"use server";
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth/auth"; // Assuming a server-side auth utility. Please adjust the path if necessary.

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    const userId = session?.session.userId;
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "What  the hell? sign in yet?" },
            { status: 400 },
        );
    }

    if (!code) {
        return NextResponse.json(
            { success: false, message: "Missing donation code" },
            { status: 400 },
        );
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        // Check if the donation exists for the user and is marked as paid (transfered = 1)
        const sql = `
            SELECT id FROM donation
            WHERE code = ? AND sender_id = ? AND transfered = 1
            LIMIT 1
        `;

        const [rows]: [any[], any] = await connection.execute(sql, [
            code,
            userId,
        ]);

        if (rows.length > 0) {
            // The payment has been received and confirmed
            return NextResponse.json({ paid: true });
        } else {
            // The payment has not been confirmed yet
            return NextResponse.json({ paid: false });
        }
    } catch (error: unknown) {
        console.error("Check Payment Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 },
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
