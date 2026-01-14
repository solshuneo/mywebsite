"use client";

import { useEffect, useState } from "react";

interface Player {
    id?: number;
    name: string;
    twitchChannels: string[];
    youtubeChannels: Array<{ type: string; id: string | null }>;
    twitchUrls: string[];
    youtubeUrls: string[];
}

interface LiveStatus {
    source: "twitch" | "youtube";
    isLive: boolean;
    data?: any;
    url: string;
}

interface PlayerWithStatus extends Player {
    liveStatuses: LiveStatus[];
    isAnyLive: boolean;
}

export default function AOE2DEPage() {
    const [players, setPlayers] = useState<PlayerWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchPlayers = async () => {
        try {
            const response = await fetch("/api/vietnam-players");
            const data = await response.json();
            if (data.success) {
                setPlayers(data.players.map((p: Player) => ({ ...p, liveStatuses: [], isAnyLive: false })));
            }
        } catch (error) {
            console.error("Error fetching players:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkLiveStatus = async (player: Player) => {
        const liveStatuses: LiveStatus[] = [];

        // Check Twitch channels
        for (const channel of player.twitchChannels) {
            try {
                const response = await fetch(
                    `/api/player-live-status?playerId=${player.id}&source=twitch&identifier=${channel}`
                );
                const data = await response.json();
                if (data.success && data.isLive) {
                    liveStatuses.push({
                        source: "twitch",
                        isLive: true,
                        data: data.data,
                        url: `https://twitch.tv/${channel}`,
                    });
                }
            } catch (error) {
                console.error(`Error checking Twitch ${channel}:`, error);
            }
        }

        // Check YouTube channels
        for (const ytChannel of player.youtubeChannels) {
            if (ytChannel.id) {
                try {
                    const response = await fetch(
                        `/api/player-live-status?playerId=${player.id}&source=youtube&identifier=${ytChannel.id}`
                    );
                    const data = await response.json();
                    if (data.success && data.isLive) {
                        liveStatuses.push({
                            source: "youtube",
                            isLive: true,
                            data: data.data,
                            url: player.youtubeUrls.find((url) =>
                                url.includes(ytChannel.id || "")
                            ) || `https://youtube.com/channel/${ytChannel.id}`,
                        });
                    }
                } catch (error) {
                    console.error(`Error checking YouTube ${ytChannel.id}:`, error);
                }
            }
        }

        return liveStatuses;
    };

    const updateAllStatuses = async () => {
        const updatedPlayers = await Promise.all(
            players.map(async (player) => {
                const liveStatuses = await checkLiveStatus(player);
                return {
                    ...player,
                    liveStatuses,
                    isAnyLive: liveStatuses.some((s) => s.isLive),
                };
            })
        );

        // Sort: live players first
        updatedPlayers.sort((a, b) => {
            if (a.isAnyLive && !b.isAnyLive) return -1;
            if (!a.isAnyLive && b.isAnyLive) return 1;
            return 0;
        });

        setPlayers(updatedPlayers);
        setLastUpdate(new Date());
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchPlayers();
        };
        loadData();
    }, []);

    useEffect(() => {
        if (players.length > 0) {
            // Check statuses lần đầu
            updateAllStatuses();
            
            // Auto-refresh: check every 5 minutes
            const interval = setInterval(() => {
                updateAllStatuses();
            }, 5 * 60 * 1000);
            
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [players.length]);

    const formatViewerCount = (count?: number) => {
        if (!count) return "";
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const getStreamDuration = (startedAt?: string) => {
        if (!startedAt) return "";
        const start = new Date(startedAt);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);

        if (diffHours > 0) {
            return `${diffHours}h ${diffMins}m`;
        }
        return `${diffMins}m`;
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Players Vietnam - Trạng thái Live
                </h1>

                {loading ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-gray-500">Đang tải danh sách players...</p>
                    </div>
                ) : players.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-gray-500">Không tìm thấy players nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-gray-600 text-center">
                            Tổng số: {players.length} players | Đang live:{" "}
                            {players.filter((p) => p.isAnyLive).length} | Cập nhật lần cuối:{" "}
                            {lastUpdate.toLocaleTimeString("vi-VN")}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {players.map((player) => (
                                <div
                                    key={player.id || player.name}
                                    className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
                                        player.isAnyLive
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold">{player.name}</h3>
                                        {player.isAnyLive && (
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        )}
                                    </div>

                                    {player.isAnyLive ? (
                                        <div className="space-y-2">
                                            {player.liveStatuses
                                                .filter((s) => s.isLive)
                                                .map((status, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-3 rounded border border-green-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-semibold text-green-600 uppercase">
                                                                {status.source}
                                                            </span>
                                                            {status.data?.viewerCount && (
                                                                <span className="text-xs text-gray-500">
                                                                    👁️{" "}
                                                                    {formatViewerCount(
                                                                        status.data.viewerCount
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {status.data?.title && (
                                                            <p className="text-sm font-medium mb-1 line-clamp-2">
                                                                {status.data.title}
                                                            </p>
                                                        )}

                                                        {status.data?.game_name && (
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                🎮 {status.data.game_name}
                                                            </p>
                                                        )}

                                                        {status.data?.started_at && (
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                ⏱️ {getStreamDuration(status.data.started_at)}
                                                            </p>
                                                        )}

                                                        <a
                                                            href={status.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block w-full text-center text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded transition duration-300"
                                                        >
                                                            Xem Live →
                                                        </a>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            <p>⚫ Không đang live</p>
                                            <div className="mt-2 text-xs">
                                                {player.twitchChannels.length > 0 && (
                                                    <p>Twitch: {player.twitchChannels.length}</p>
                                                )}
                                                {player.youtubeChannels.length > 0 && (
                                                    <p>YouTube: {player.youtubeChannels.length}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
