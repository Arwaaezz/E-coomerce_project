"use client";

import * as React from "react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import NavBadge from "@/components/ui/NavBadge";

export default function WishlistNavBadge() {
  const { ids } = useWishlist();
  return <NavBadge count={ids.size} />;
}