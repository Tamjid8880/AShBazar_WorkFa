"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Widget = {
  id:          string;
  title?:      string | null;
  description?: string | null;
  imageUrl?:   string | null;
  meta?:       any;
};

type Props = {
  posters:    Widget[];

  /** Show slide on left with hero text, image as bg on right */
};

export default function HeroCarousel({ posters }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % Math.max(posters.length, 1)), [posters.length]);
  const prev = () => setCurrent(c => (c - 1 + Math.max(posters.length, 1)) % Math.max(posters.length, 1));

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (posters.length <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next, posters.length]);

  const poster = posters[current];

  return (
    <section
      className="relative min-h-[520px] md:min-h-[580px] overflow-hidden flex items-center bg-gradient-to-r from-[#173e26] via-[#1a442a] to-[#609966]"
    >
      {/* ── Content ─────────────────────────────────────────── */}
      <div className="container-main relative z-10 py-16 flex items-center justify-between">
        
        {/* Left Side: Text */}
        <div className="max-w-xl w-full lg:w-1/2 relative z-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a5d6a7]">
            ONLINE GROCERY
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            {poster?.title || "Get Fresh\nGroceries"}
          </h1>
          <p className="mt-4 max-w-sm text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {poster?.description || "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit"}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#ff6f00] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#e65100] transition-all hover:scale-105"
          >
            Shop Now
          </Link>

          {/* Feature pill */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6f00]">
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Fast Delivery</p>
              <p className="text-[10px] text-white/60">Free cost of any delivery</p>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="hidden lg:flex w-1/2 justify-end items-center relative z-10">
          {poster && poster.imageUrl && (
            <img
              key={poster.id}
              src={poster.imageUrl}
              alt={poster.title || "Hero Banner"}
              className="max-h-[480px] w-auto object-contain animate-[slideInLeft_0.5s_ease-out]"
            />
          )}
        </div>
      </div>

      {/* ── Slide Controls ───────────────────────────────────── */}
      {posters.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition"
            aria-label="Previous"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition"
            aria-label="Next"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 flex gap-2">
            {posters.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-[#ff6f00]" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* No-poster fallback */}
      {posters.length === 0 && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 text-center">
            <p className="text-sm text-white/60">Add hero slides in</p>
            <p className="text-xs font-bold text-white/80">Admin → Widgets → Hero Carousel</p>
          </div>
        </div>
      )}
    </section>
  );
}
