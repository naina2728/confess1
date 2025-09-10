'use client'

import React, { useEffect, useMemo, useState } from "react";
import { fetchConfessions, createConfession, likeConfession, unlikeConfession, hasUserLikedConfession, getUserIdentifier, recalculateLikeCounts } from '@/lib/confessions';
import type { Confession } from '@/types/database';
import { useMiniKit } from '@coinbase/onchainkit/minikit'

// Mobile-first, black & white UI with Supabase integration
// Confessions post anonymously with a randomized Hollywood-actor pseudonym.

const ACTORS: string[] = [
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

function randomActor(): string {
  const name = ACTORS[Math.floor(Math.random() * ACTORS.length)];
  // Make it funny-but-clear it's a pseudonym
  const prefixes = ["Anon", "Totally-Not", "Definitely-Not", "Secret", "Agent", "Undercover"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${name}`;
}

export default function ConfessionsApp(): JSX.Element {
  const { context } = useMiniKit()
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [text, setText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedConfessions, setLikedConfessions] = useState<Set<number>>(new Set());
  const [userFid, setUserFid] = useState<number | undefined>(undefined);
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [likingConfession, setLikingConfession] = useState<number | null>(null);
  const remaining = useMemo(() => 480 - text.trim().length, [text]);

  // Initialize user identification on component mount
  useEffect(() => {
    const { userFid, userIdentifier } = getUserIdentifier(context);
    setUserFid(userFid);
    setUserIdentifier(userIdentifier || "");
  }, [context]);

  // Load confessions from Supabase on component mount
  useEffect(() => {
    loadConfessions();
  }, []);

  // Load liked status for confessions when they change
  useEffect(() => {
    if (confessions.length > 0 && (userFid || userIdentifier)) {
      loadLikedStatus();
    }
  }, [confessions, userFid, userIdentifier]);

  async function loadConfessions(): Promise<void> {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConfessions();
      setConfessions(data);
    } catch (err) {
      console.error('Error loading confessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load confessions');
    } finally {
      setLoading(false);
    }
  }

  async function loadLikedStatus(): Promise<void> {
    try {
      const likedSet = new Set<number>();
      
      // Check liked status for each confession
      await Promise.all(
        confessions.map(async (confession) => {
          const isLiked = await hasUserLikedConfession(
            confession.id,
            userFid,
            userIdentifier
          );
          if (isLiked) {
            likedSet.add(confession.id);
          }
        })
      );
      
      setLikedConfessions(likedSet);
    } catch (err) {
      console.error('Error loading liked status:', err);
      // Don't show error to user for this, just log it
    }
  }

  async function handleLikeToggle(confessionId: number): Promise<void> {
    if ((!userFid && !userIdentifier) || likingConfession === confessionId) return;
    
    setLikingConfession(confessionId);
    const wasLiked = likedConfessions.has(confessionId);
    
    try {
      if (wasLiked) {
        // Unlike the confession
        await unlikeConfession(confessionId, userFid, userIdentifier);
        
        // Update local state
        setLikedConfessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(confessionId);
          return newSet;
        });
        
        // Update confession like count
        setConfessions(prev => 
          prev.map(c => 
            c.id === confessionId 
              ? { ...c, like_count: Math.max(0, c.like_count - 1) }
              : c
          )
        );
      } else {
        // Like the confession
        await likeConfession({
          confession_id: confessionId,
          user_fid: userFid,
          user_identifier: userIdentifier
        });
        
        // Update local state
        setLikedConfessions(prev => {
          const newSet = new Set(prev);
          newSet.add(confessionId);
          return newSet;
        });
        
        // Update confession like count
        setConfessions(prev => 
          prev.map(c => 
            c.id === confessionId 
              ? { ...c, like_count: c.like_count + 1 }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err instanceof Error ? err.message : 'Failed to update like');
    } finally {
      setLikingConfession(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Generate random actor name for this confession
      const actorName = randomActor();
      
      // Create confession in database
      const newConfession = await createConfession({
        text: body,
        author: actorName,
        is_anonymous: true
      });
      
      // Add to local state
      setConfessions(prev => [newConfession, ...prev]);
      setText("");
    } catch (err) {
      console.error('Error creating confession:', err);
      setError(err instanceof Error ? err.message : 'Failed to create confession');
    } finally {
      setSubmitting(false);
    }
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
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

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
            <div className="mt-2 space-x-2">
              <button 
                onClick={loadConfessions}
                className="underline hover:no-underline"
              >
                Try again
              </button>
              <button 
                onClick={async () => {
                  try {
                    await recalculateLikeCounts()
                    await loadConfessions()
                    setError(null)
                  } catch (err) {
                    console.error('Error recalculating like counts:', err)
                  }
                }}
                className="underline hover:no-underline"
              >
                Fix like counts
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        <section className="mt-6 space-y-3" aria-live="polite">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-black/20 p-6 text-center text-sm text-black/60">
              Loading confessions... 🔥
            </div>
          ) : confessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/20 p-6 text-center text-sm text-black/60">
              No confessions yet. Be the first to light the fire.
            </div>
          ) : (
            confessions.map((c: Confession) => (
              <article key={c.id} className="rounded-2xl border border-black/10 p-4 bg-white">
                <header className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-black/50">{c.author}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeToggle(c.id)}
                      disabled={likingConfession === c.id || (!userFid && !userIdentifier)}
                      className={`flex items-center gap-1 text-xs transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        likedConfessions.has(c.id) 
                          ? 'text-red-500' 
                          : 'text-black/40 hover:text-red-400'
                      }`}
                      title={likedConfessions.has(c.id) ? 'Unlike this confession' : 'Like this confession'}
                    >
                      <span className={likingConfession === c.id ? 'animate-pulse' : ''}>
                        {likedConfessions.has(c.id) ? '❤️' : '🤍'}
                      </span>
                      <span className="tabular-nums">{c.like_count}</span>
                    </button>
                    <time className="text-[10px] text-black/40" dateTime={new Date(c.created_at).toISOString()}>
                      {new Date(c.created_at).toLocaleString()}
                    </time>
                  </div>
                </header>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
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
      <style jsx>{`
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
