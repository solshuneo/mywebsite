"use server";
import { NextResponse } from "next/server";

// In-memory cache để lưu trạng thái và thời gian check
interface CacheEntry {
    isLive: boolean;
    lastChecked: number;
    data: any;
}

const statusCache = new Map<string, CacheEntry>();

// Constants
const OFFLINE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 phút
const ONLINE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 phút

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface TwitchStreamInfo {
    game_name: string;
    viewer_count: number;
    title: string;
    user_name: string;
    started_at: string;
}

interface TwitchStreamsResponse {
    data: TwitchStreamInfo[];
}

interface YouTubeLiveStatus {
    isLive: boolean;
    title?: string;
    viewerCount?: number;
    startedAt?: string;
    channelId?: string;
}

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

async function checkTwitchLive(
    channelName: string,
    token: string,
): Promise<{ isLive: boolean; data?: TwitchStreamInfo }> {
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    if (!TWITCH_CLIENT_ID) {
        return { isLive: false };
    }

    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
    const headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            return { isLive: false };
        }

        const data: TwitchStreamsResponse = await response.json();
        if (data.data && data.data.length > 0) {
            return { isLive: true, data: data.data[0] };
        }
        return { isLive: false };
    } catch (error) {
        console.error(`Error checking Twitch ${channelName}:`, error);
        return { isLive: false };
    }
}

async function checkYouTubeLive(
    channelId: string,
    apiKey?: string,
): Promise<YouTubeLiveStatus> {
    // YouTube API requires API key
    // For now, return offline if no API key
    // You can implement YouTube Data API v3 here
    if (!apiKey) {
        return { isLive: false };
    }

    try {
        // YouTube Data API v3 - Search for live broadcasts
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            return { isLive: false };
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            return {
                isLive: true,
                title: video.snippet?.title,
                channelId: channelId,
            };
        }

        return { isLive: false };
    } catch (error) {
        console.error(`Error checking YouTube ${channelId}:`, error);
        return { isLive: false };
    }
}

function shouldCheckCache(cacheKey: string): boolean {
    const cached = statusCache.get(cacheKey);
    if (!cached) {
        return true; // Chưa có cache, cần check
    }

    const now = Date.now();
    const timeSinceLastCheck = now - cached.lastChecked;

    if (cached.isLive) {
        // Nếu đang live, check lại sau 30 phút
        return timeSinceLastCheck >= ONLINE_CHECK_INTERVAL;
    } else {
        // Nếu offline, check lại sau 5 phút
        return timeSinceLastCheck >= OFFLINE_CHECK_INTERVAL;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");
    const source = searchParams.get("source"); // "twitch" hoặc "youtube"
    const identifier = searchParams.get("identifier"); // channel name hoặc channel ID

    if (!playerId || !source || !identifier) {
        return NextResponse.json(
            {
                success: false,
                message: "Missing required parameters: playerId, source, identifier",
            },
            { status: 400 }
        );
    }

    const cacheKey = `${playerId}-${source}-${identifier}`;

    // Kiểm tra cache
    const cached = statusCache.get(cacheKey);
    if (cached && !shouldCheckCache(cacheKey)) {
        return NextResponse.json({
            success: true,
            isLive: cached.isLive,
            data: cached.data,
            cached: true,
            lastChecked: new Date(cached.lastChecked).toISOString(),
        });
    }

    let result: { isLive: boolean; data?: any } = { isLive: false };

    if (source === "twitch") {
        const token = await getTwitchAccessToken();
        if (token) {
            result = await checkTwitchLive(identifier, token);
        }
    } else if (source === "youtube") {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const ytResult = await checkYouTubeLive(identifier, apiKey);
        result = {
            isLive: ytResult.isLive,
            data: ytResult,
        };
    }

    // Lưu vào cache
    statusCache.set(cacheKey, {
        isLive: result.isLive,
        lastChecked: Date.now(),
        data: result.data,
    });

    return NextResponse.json({
        success: true,
        isLive: result.isLive,
        data: result.data,
        cached: false,
        lastChecked: new Date().toISOString(),
    });
}
