import { createPool } from "mysql2/promise";

const pool = createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "shuneo",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "chatbox",
    timezone: "+07:00",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;
