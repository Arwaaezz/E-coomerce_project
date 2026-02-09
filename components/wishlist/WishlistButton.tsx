"use client";

import * as React from "react";
import { Heart, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { Toast } from "@/components/ui/toast";

type Props = {
  productId: string;
  className?: string;
};

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export default function WishlistButton({ productId, className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { isInWishlist, toggle, busyId } = useWishlist();
  const active = isInWishlist(productId);
  const loading = busyId === String(productId);

  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<"default" | "success" | "error">("default");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState<string | undefined>();

  const showToast = React.useCallback((v: "default" | "success" | "error", t: string, d?: string) => {
    setVariant(v);
    setTitle(t);
    setDescription(d);
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  }, []);

  async function onClick() {
    if (loading) return;

    const token = getToken();
    if (!token) {
      showToast("error", "Login required", "Please login to use wishlist.");
      const next = encodeURIComponent(pathname || "/");
      setTimeout(() => router.push(`/login?next=${next}`), 350);
      return;
    }

    try {
      await toggle(productId);
      showToast("success", active ? "Removed 💔" : "Saved ❤️");
    } catch (e: any) {
      showToast("error", "Wishlist failed", e?.message ?? "Try again");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        className={[
          "inline-flex items-center justify-center",
          "rounded-full border bg-background/80 backdrop-blur",
          "hover:bg-muted transition disabled:opacity-60",
          className,
        ].join(" ")}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={["h-5 w-5", active ? "fill-current" : ""].join(" ")} />
        )}
      </button>

      <Toast open={open} onOpenChange={setOpen} title={title} description={description} variant={variant} />
    </>
  );
}
