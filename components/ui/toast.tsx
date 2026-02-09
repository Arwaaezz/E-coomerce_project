"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastPrimitives.Provider>{children}</ToastPrimitives.Provider>;
}

export function ToastViewport() {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        "fixed right-4 top-4 z-[9999] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      )}
    />
  );
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}) {
  const styles =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : variant === "error"
      ? "border-red-200 bg-red-50 text-red-950"
      : "border-border bg-background text-foreground";

  return (
    <ToastPrimitives.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "grid gap-1 rounded-xl border p-4 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        styles
      )}
    >
      <ToastPrimitives.Title className="text-sm font-semibold">
        {title}
      </ToastPrimitives.Title>

      {description ? (
        <ToastPrimitives.Description className="text-sm opacity-90">
          {description}
        </ToastPrimitives.Description>
      ) : null}
    </ToastPrimitives.Root>
  );
}
