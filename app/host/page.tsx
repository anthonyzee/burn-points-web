"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  adjustPoints,
  GameState,
  getGameState,
  nextRound,
  resetGame,
} from "../../lib/api";

export default function HostPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const playerUrl = process.env.NEXT_PUBLIC_PLAYER_URL || "http://localhost:3000/player";

  async function refresh() {
    try {
      const data = await getGameState();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game state");
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, []);

  async function handleNextRound() {
    await nextRound();
    await refresh();
  }

  async function handleReset() {
    const ok = window.confirm("Reset this game?");
    if (!ok) return;
    await resetGame();
    await refresh();
  }

    async function handleAdjust(playerId: string, delta: number) {
    await adjustPoints(playerId, delta);
    await refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold">Burn Your Points</h1>
          <p className="text-slate-400">Round {state?.round_no ?? "-"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleNextRound} className="rounded-xl bg-white text-slate-950 px-4 py-2 font-bold">
            Next Round
          </button>
          <button onClick={handleReset} className="rounded-xl bg-red-600 px-4 py-2 hover:bg-red-500">
            Reset
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-900/50 border border-red-700 p-3">{error}</div>}

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <div className="mb-6 rounded-2xl bg-slate-800 p-5">
            <p className="text-slate-400 text-sm">Game rule</p>
            <h2 className="text-2xl font-bold mt-1">Each player can burn only 1 point per round</h2>
          </div>

          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <div className="space-y-3">
            {state?.players.map((player, index) => {
              const burnedThisRound = player.last_burn_round === state.round_no;

              return (
                <div
                  key={player.id}
                  className="rounded-2xl bg-slate-800 border border-slate-700 p-4 flex items-center gap-4"
                >
                  <div className="text-2xl font-bold w-10">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xl font-semibold">{player.name}</div>
                        {burnedThisRound && (                          <div className="text-xs text-emerald-300 mt-1">Burned this round</div>
                        )}
                      </div>
                      <div className="text-4xl font-bold">{player.points}</div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, (player.points / 10) * 100))}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Deductions: {player.deductions} · Matches: {player.matches}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAdjust(player.id, 1)}
                      className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
                    >
                      +1 Undo
                    </button>
                    <button
                      onClick={() => handleAdjust(player.id, -1)}
                      className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
                    >
                      -1 Manual
                    </button>
                  </div>
                </div>
              );
            })}

            {state?.players.length === 0 && (
              <p className="text-slate-400">No players yet. Ask people to scan the QR code.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white text-slate-950 p-6">
            <h2 className="text-xl font-bold mb-3">Scan to Join</h2>
            <QRCodeSVG value={playerUrl} size={220} />
            <p className="text-sm mt-3 break-all">{playerUrl}</p>
          </div>

                    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {state?.events.map((event) => (
                <div key={event.id} className="rounded-xl bg-slate-800 p-3">
                  <div className="font-medium">{event.message}</div>
                  <div className="text-xs text-slate-400 mt-1">Round {event.round_no}</div>
                </div>
              ))}
              {state?.events.length === 0 && <p className="text-slate-400">No activity yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}