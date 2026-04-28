import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-3">Burn Your Points</h1>
        <p className="text-slate-300 mb-8">
          A QR-based icebreaker game for department meetings.
        </p>
        <div className="flex gap-4">
          <Link className="rounded-2xl bg-white text-slate-950 px-5 py-3 font-semibold" href="/host">
            Host Dashboard
          </Link>
          <Link className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold" href="/player">
            Player View
          </Link>
        </div>
      </div>
    </main>
  );
}