export type Player = {
  id: string;
  name: string;
  points: number;
  deductions: number;
  matches: number;
  last_burn_round?: number | null;
};

export type GameEvent = {
  id: string;
  message: string;
  created_at: string;
  player_id?: string;
  round_no: number;
};

export type GameState = {
  game_id: string;
  round_no: number;
  players: Player[];
  events: GameEvent[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.detail || `Request failed: ${res.status}`);
    } catch {
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }

  return res.json();
}

export function getGameState() {
  return request<GameState>("/games/state");
}

export function joinGame(name: string) {
  return request<Player>("/players/join", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function deductPoint(playerId: string, action: "shared" | "same") {
  return request<Player>("/players/deduct", {
    method: "POST",
    body: JSON.stringify({ player_id: playerId, action }),
  });
}

export function adjustPoints(playerId: string, delta: number) {
  return request<Player>("/players/adjust-points", {
    method: "POST",
    body: JSON.stringify({ player_id: playerId, delta }),
  });
}

export function nextRound() {
  return request<{ ok: boolean; round_no: number }>("/games/next-round", {
    method: "POST",
  });
}

export function resetGame() {
  return request<{ ok: boolean }>("/games/reset", {
    method: "POST",
  });
}