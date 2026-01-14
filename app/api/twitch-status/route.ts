"use server";
import { NextResponse } from "next/server";

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface StreamInfo {
    game_name: string;
    viewer_count: number;
    title: string;
    user_name: string;
    started_at: string;
}

interface StreamsResponse {
    data: StreamInfo[];
}

// Từ điển viết tắt (tương tự test.ts)
const channel_mapping: Record<string, string> = {
    "mixi": "mixigaming",
    "baset": "baset_cs",
    "bomman": "bomman",
    "shroud": "shroud",
    "faker": "faker",
    "tarik": "tarik",
    "pt": "phantom0811",
    "accm": "theaccm",
    "aoe2de": "theaccm",
};

async function getTwitchAccessToken(): Promise<string | null> {
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    const TWITCH_CLIENT_SECRET = process.env.TWITCH_SECRET_KEY;

    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
        return null;
    }

    const url = "https://id.twitch.tv/oauth2/token";
    const params = new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TokenResponse = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error getting Twitch token:", error);
        return null;
    }
}

async function checkTwitchLiveStatus(
    channelName: string,
    token: string,
): Promise<StreamInfo | null> {
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;

    if (!TWITCH_CLIENT_ID) {
        return null;
    }

    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
    const headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
    };

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StreamsResponse = await response.json();
        const streams = data.data || [];

        if (streams.length > 0) {
            return streams[0];
        }

        return null;
    } catch (error) {
        console.error(`Error checking channel ${channelName}:`, error);
        return null;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    let channelName = searchParams.get("channel") || "theaccm";

    // Xử lý auto-complete (tìm trong từ điển)
    const realChannelName = channel_mapping[channelName.toLowerCase()] || channelName;

    // Lấy access token
    const token = await getTwitchAccessToken();

    if (!token) {
        return NextResponse.json({
            success: false,
            message: "Không thể lấy Twitch access token. Kiểm tra TWITCH_CLIENT_ID và TWITCH_SECRET_KEY trong .env",
            channelName: realChannelName,
            isLive: false,
            channelUrl: `https://twitch.tv/${realChannelName}`,
        });
    }

    // Kiểm tra trạng thái live
    const streamInfo = await checkTwitchLiveStatus(realChannelName, token);

    if (streamInfo) {
        return NextResponse.json({
            success: true,
            channelName: realChannelName,
            isLive: true,
            gameName: streamInfo.game_name,
            viewerCount: streamInfo.viewer_count,
            title: streamInfo.title,
            startedAt: streamInfo.started_at,
            channelUrl: `https://twitch.tv/${realChannelName}`,
        });
    } else {
        return NextResponse.json({
            success: true,
            channelName: realChannelName,
            isLive: false,
            channelUrl: `https://twitch.tv/${realChannelName}`,
        });
    }
}
