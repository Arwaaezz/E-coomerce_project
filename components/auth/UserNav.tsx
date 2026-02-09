"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserNav() {
  const router = useRouter();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const read = () => setToken(localStorage.getItem("token"));
    read();

    const onAuthChanged = () => read();

    window.addEventListener("auth-changed", onAuthChanged as any);
    window.addEventListener("storage", onAuthChanged);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged as any);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    router.replace("/login");
  }

  // ✅ لو مش عامل login
  if (!token) {
    return (
      <Button asChild variant="outline" className="rounded-full">
        <Link href="/login" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Login
        </Link>
      </Button>
    );
  }

  // ✅ لو عامل login
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/account">My Account</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/change-password">Change Password</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/orders">Orders</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/addresses">Addresses</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/wishlist">Wishlist</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="rounded-xl text-red-600 focus:text-red-600"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
