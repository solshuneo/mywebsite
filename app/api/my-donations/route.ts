"use server";
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
    let connection;
    try {
        // Kiểm tra session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Bạn chưa đăng nhập!" },
                { status: 401 },
            );
        }

        const userId = session.session.userId;

        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        // Lấy tất cả donations của user đã được thanh toán, sắp xếp mới nhất trước
        const [rows]: [any[], any] = await connection.execute(
            `SELECT id, amount, message, code, created_at, transfered 
             FROM donation 
             WHERE sender_id = ? AND transfered = 1 
             ORDER BY created_at DESC`,
            [userId],
        );

        return NextResponse.json({ success: true, donations: rows });
    } catch (error) {
        console.error("Get My Donations API Error:", error);
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
