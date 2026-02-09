"use client";

export default function NavBadge({ count }: { count: number }) {
  if (!count) return null;

  return (
    <span
      className={[
        "pointer-events-none absolute -right-1 -top-1",
        "grid h-5 min-w-5 place-items-center rounded-full px-1",
        "text-[11px] font-semibold tabular-nums",
        "bg-foreground text-background ring-2 ring-background",
      ].join(" ")}
    >
      {count}
    </span>
  );
}
