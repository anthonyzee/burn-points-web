"use client";

import { useEffect, useMemo, useState } from "react";
import { deductPoint, GameState, getGameState, joinGame, Player } from "../../lib/api";

const STORAGE_KEY = "burn_points_player";

export default function PlayerPage() {
  const [name, setName] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const data = await getGameState();
    setState(data);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Player;
      const latest = data.players.find((p) => p.id === parsed.id);
      if (latest) setPlayer(latest);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Player;
      setPlayer(parsed);
      setName(parsed.name);
    }

    refresh();
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, []);

  const burnedThisRound = useMemo(() => {
    if (!player || !state) return false;
    return player.last_burn_round === state.round_no;
  }, [player, state]);

    async function handleJoin() {
    setLoading(true);
    setMessage(null);
    try {
      const joined = await joinGame(name);
      setPlayer(joined);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(joined));
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeduct(action: "shared" | "same") {
    if (!player) return;
    setLoading(true);
    setMessage(null);
    try {
      const updated = await deductPoint(player.id, action);
      setPlayer(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setMessage(action === "shared" ? "You burned 1 point." : "You matched and burned 1 point.");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to deduct point");
    } finally {
      setLoading(false);
    }
  }
  if (!player) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <h1 className="text-3xl font-bold mb-2">Join Game</h1>
          <p className="text-slate-400 mb-6">Enter your name to start with 10 points.</p>
          <input
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 mb-4 outline-none"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            disabled={loading || !name.trim()}
            onClick={handleJoin}
            className="w-full rounded-xl bg-white text-slate-950 px-4 py-3 font-bold disabled:opacity-50"
          >
            Join
          </button>
          {message && <p className="mt-4 text-sm text-red-300">{message}</p>}
        </div>
      </main>
    );
  }
return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6">
        <div className="mb-6">
          <p className="text-slate-400">Player</p>
          <h1 className="text-3xl font-bold">{player.name}</h1>
        </div>

        <div className="rounded-3xl bg-slate-800 p-6 text-center mb-6">
          <p className="text-slate-400">Remaining Points</p>
          <div className="text-7xl font-black mt-2">{player.points}</div>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4 mb-6">
          <p className="text-slate-400 text-sm">Current Round</p>
          <p className="text-xl font-bold">Round {state?.round_no ?? "-"}</p>
          {burnedThisRound && (
            <p className="text-emerald-300 text-sm mt-2">You already burned 1 point this round.</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            disabled={loading || burnedThisRound || player.points <= 0}
            onClick={() => handleDeduct("shared")}
            className="w-full rounded-2xl bg-white text-slate-950 px-4 py-4 font-bold disabled:opacity-40"
          >
            I Shared — Burn 1 Point
          </button>

          <button
            disabled={loading || burnedThisRound || player.points <= 0}
            onClick={() => handleDeduct("same")}
            className="w-full rounded-2xl bg-slate-700 px-4 py-4 font-bold disabled:opacity-40"
          >
            Same As Them — Burn 1 Point
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          You can only burn 1 point per round. If you tapped wrongly, ask the host to use +1 Undo.
        </p>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </div>
    </main>
  );
}