import React, { useEffect, useMemo, useState } from "react";

// Mobile-first, black & white UI. No external APIs. Persists to localStorage.
// Confessions post anonymously with a randomized Hollywood-actor pseudonym.

const ACTORS = [
  "Keanu Reeves",
  "Scarlett Johansson",
  "Tom Cruise",
  "Zendaya",
  "Ryan Gosling",
  "Emma Stone",
  "Dwayne Johnson",
  "Jennifer Lawrence",
  "Chris Hemsworth",
  "Margot Robbie",
  "Robert Downey Jr.",
  "Natalie Portman",
  "Leonardo DiCaprio",
  "Gal Gadot",
  "Michael B. Jordan",
  "Ana de Armas",
  "Timothée Chalamet",
  "Viola Davis",
  "Zendaya",
  "Christian Bale",
  "Emily Blunt",
  "Pedro Pascal",
  "Florence Pugh",
  "Andrew Garfield",
  "Zoe Kravitz"
];

const STORAGE_KEY = "spicy_confessions_v1";

function randomActor() {
  const name = ACTORS[Math.floor(Math.random() * ACTORS.length)];
  // Make it funny-but-clear it's a pseudonym
  const prefixes = ["Anon", "Totally-Not", "Definitely-Not", "Secret", "Agent", "Undercover"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${name}`;
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function ConfessionsApp() {
  const [confessions, setConfessions] = useLocalStorageState(STORAGE_KEY, []);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const remaining = useMemo(() => 480 - text.trim().length, [text]);

  function handleSubmit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSubmitting(true);
    const newConfession = {
      id: crypto.randomUUID(),
      author: randomActor(),
      body,
      ts: Date.now()
    };
    // Simulate slight delay for a tactile feel
    setTimeout(() => {
      setConfessions((prev) => [newConfession, ...prev]);
      setText("");
      setSubmitting(false);
    }, 250);
  }

  return (
    <div className="min-h-screen bg-white text-black antialiased flex items-start justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-black/10">
          {/* Monochrome 'fire' marquee */}
          <div className="h-10 w-full bg-black text-white flex items-center overflow-hidden">
            <div className="animate-marquee whitespace-nowrap opacity-90 select-none [filter:grayscale(1)]">
              {"🔥 ".repeat(60)}
            </div>
          </div>

          <div className="bg-white p-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
              Spicy Confessions
              <span className="sr-only"> (anonymous)</span>
            </h1>
            <p className="text-center text-sm mt-2 text-black/60">
              Anonymous. No judgment. 🔥
            </p>

            {/* Composer */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label htmlFor="confession" className="sr-only">Type your confession</label>
              <textarea
                id="confession"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Spill the tea… (kept anonymous)"
                maxLength={480}
                rows={5}
                className="w-full rounded-2xl border border-black p-4 focus:outline-none focus:ring-4 focus:ring-black/10 bg-white placeholder-black/40"
              />

              <div className="flex items-center justify-between text-xs">
                <span className={`tabular-nums ${remaining < 0 ? "text-red-600" : "text-black/50"}`}>
                  {remaining} chars left
                </span>
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="px-4 py-2 rounded-full border border-black bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
                >
                  {submitting ? "Publishing…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Feed */}
        <section className="mt-6 space-y-3" aria-live="polite">
          {confessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/20 p-6 text-center text-sm text-black/60">
              No confessions yet. Be the first to light the fire.
            </div>
          ) : (
            confessions.map((c) => (
              <article key={c.id} className="rounded-2xl border border-black/10 p-4 bg-white">
                <header className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-black/50">{c.author}</span>
                  <time className="text-[10px] text-black/40" dateTime={new Date(c.ts).toISOString()}>
                    {new Date(c.ts).toLocaleString()}
                  </time>
                </header>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{c.body}</p>
              </article>
            ))
          )}
        </section>

        {/* Footer flame line */}
        <div className="mt-8 h-8 overflow-hidden [filter:grayscale(1)] select-none">
          <div className="animate-marquee-slow whitespace-nowrap">{"🔥 ".repeat(80)}</div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 12s linear infinite;
        }
        .animate-marquee-slow {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 24s linear infinite;
        }
      `}</style>
    </div>
  );
}
