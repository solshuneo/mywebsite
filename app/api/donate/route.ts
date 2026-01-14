"use server";
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth/auth"; // Assuming a server-side auth utility. Please adjust the path if necessary.

export async function POST(req: Request) {
    let connection;
    try {
        // 1. Kiểm tra session từ headers
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            throw new Error("Bạn chưa đăng nhập!");
        }

        const { amount, message } = await req.json();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json(
                { success: false, message: "A valid amount is required." },
                { status: 400 },
            );
        }

        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const [lastDonationRows]: [any[], any] = await connection.execute(
            "SELECT `code` FROM `donation` where transfered = 0 LIMIT 1",
        );

        const code = lastDonationRows[0].code;
        const userId = session.session.userId;
        await connection.query(
            "update donation set sender_id = ?, amount = ?, message = ? where code = ?",
            [userId, amount, message, code],
        );

        return NextResponse.json({ success: true, code: code });
    } catch (error) {
        console.error("Donate API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An internal server error occurred.",
            },
            { status: 500 },
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
