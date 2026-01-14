"use server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface Player {
    name: string;
    country: string;
    twitch?: string[];
    youtube?: string[];
    id?: number;
    [key: string]: any;
}

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "app", "players.yaml");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const players = yaml.load(fileContents) as Player[];

        // Whitelist các players được phép hiển thị
        const allowedNames = [
            "saymyname",
            "hoang",
            "fcmnlop",
            "accm",
            "quảng trị",
            "py_blue_sky",
        ];

        // Lọc players từ Vietnam và trong whitelist
        const vietnamPlayers = players.filter((player) => {
            if (player.country?.toLowerCase() !== "vn") {
                return false;
            }
            
            const playerNameLower = player.name?.toLowerCase() || "";
            return allowedNames.some((allowedName) =>
                playerNameLower.includes(allowedName.toLowerCase())
            );
        });

        // Format dữ liệu và filter players có link live
        const formattedPlayers = vietnamPlayers
            .map((player) => {
                // Extract channel names từ URLs
                const twitchChannels =
                    player.twitch?.map((url) => {
                        const match = url.match(/twitch\.tv\/([^\/\?]+)/);
                        return match ? match[1] : null;
                    }) || [];

                const youtubeChannels =
                    player.youtube?.map((url) => {
                        // Extract channel ID hoặc handle từ URL
                        if (url.includes("/channel/")) {
                            const match = url.match(/\/channel\/([^\/\?]+)/);
                            return { type: "channel", id: match ? match[1] : null };
                        } else if (url.includes("/user/")) {
                            const match = url.match(/\/user\/([^\/\?]+)/);
                            return { type: "user", id: match ? match[1] : null };
                        } else if (url.includes("/c/")) {
                            const match = url.match(/\/c\/([^\/\?]+)/);
                            return { type: "custom", id: match ? match[1] : null };
                        } else if (url.includes("@")) {
                            const match = url.match(/@([^\/\?]+)/);
                            return { type: "handle", id: match ? match[1] : null };
                        }
                        return { type: "unknown", id: url };
                    }) || [];

                return {
                    id: player.id,
                    name: player.name,
                    twitchChannels: twitchChannels.filter((c) => c !== null),
                    youtubeChannels: youtubeChannels.filter((c) => c.id !== null),
                    twitchUrls: player.twitch || [],
                    youtubeUrls: player.youtube || [],
                };
            })
            .filter((player) => {
                // Chỉ giữ lại players có ít nhất một Twitch hoặc YouTube channel hợp lệ
                return (
                    player.twitchChannels.length > 0 ||
                    player.youtubeChannels.length > 0
                );
            });

        return NextResponse.json({
            success: true,
            players: formattedPlayers,
            count: formattedPlayers.length,
        });
    } catch (error) {
        console.error("Error reading players.yaml:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error reading players file",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
