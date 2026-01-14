import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
interface SepayWebhookData {
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    subAccount: string;
    transferType: "in" | "out";
    transferAmount: number;
    accumulated: number;
    content: string;
    referenceCode: string;
    description: string;
}

export async function POST(req: Request) {
    const apiKey = req.headers.get("Authorization");
    if (apiKey?.trim() !== "Apikey " + process.env.SEPAY_SECRET_KEY?.trim()) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
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

        const data: SepayWebhookData = await req.json();

        if (!data) {
            return NextResponse.json(
                { success: false, message: "No data received" },
                { status: 400 },
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const content = data.content;
        console.log("Raw content received:", content);

        // Sử dụng biểu thức chính quy (regex) để trích xuất mã donate.
        // Mẫu này sẽ tìm chuỗi "shuneo" theo sau bởi đúng 6 chữ số (\d{6}).
        const match = content.match(/shuneo\d{6}/);

        // Nếu tìm thấy, `match` sẽ là một mảng (ví dụ: ['shuneo000908']).
        // Mã code chúng ta cần là phần tử đầu tiên. Nếu không tìm thấy, kết quả là null.
        const code = match ? match[0] : null;
        console.log(code);
        const [result] = await connection.execute(
            "update donation set transfered = 1, created_at = CURRENT_TIMESTAMP where code = ?",
            [code],
        );

        console.log(result); // Nếu bằng 0 nghĩa là không tìm thấy code nào khớp
        console.log("Received valid webhook data:", data);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Webhook Error:", error);
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
