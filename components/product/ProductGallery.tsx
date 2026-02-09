"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  title: string;
};

export default function ProductGallery({ images, title }: Props) {
  const imgs = useMemo(() => {
    const arr = Array.isArray(images) ? images.filter(Boolean) : [];
    // remove duplicates while keeping order
    const seen = new Set<string>();
    return arr.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
  }, [images]);

  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => setIdx(0), [imgs.length]);

  // Keyboard navigation (optional but pro)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (imgs.length <= 1) return;
      if (e.key === "ArrowRight") setIdx((x) => (x + 1) % imgs.length);
      if (e.key === "ArrowLeft") setIdx((x) => (x - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imgs.length]);

  useEffect(() => {
    if (imgs.length <= 1) return;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    if (!hovered) {
      intervalRef.current = window.setInterval(() => {
        setIdx((x) => (x + 1) % imgs.length);
      }, 1500);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [imgs.length, hovered]);

  const current = imgs[idx];

  if (!current) {
    return <div className="aspect-square w-full rounded-3xl bg-muted/30" />;
  }

  return (
    <div className="space-y-4">
      {/* Main */}
      <div
        className="relative overflow-hidden rounded-3xl border bg-muted/10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* glassy top glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-foreground/[0.04]" />

        <div className="relative aspect-square w-full">
          <Image
            key={current}
            src={current}
            alt={title}
            fill
            priority
            className="object-cover will-change-transform animate-in fade-in duration-400"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* bottom vignette for readability */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        {/* Badges */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border bg-background/70 px-3 py-1 text-xs backdrop-blur">
            {idx + 1} / {imgs.length}
          </span>
        
        </div>

        {/* Dots (بدون أزرار) */}
        {imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background/70 px-3 py-2 backdrop-blur">
            {imgs.slice(0, 8).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Go to image ${i + 1}`}
                className={[
                  "h-2 w-2 rounded-full transition-all",
                  i === idx ? "bg-foreground w-5" : "bg-foreground/30 hover:bg-foreground/50",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIdx(i)}
              className={[
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-muted/10 transition-all",
                i === idx
                  ? "ring-2 ring-foreground/80"
                  : "opacity-80 hover:opacity-100 hover:shadow-sm",
              ].join(" ")}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
