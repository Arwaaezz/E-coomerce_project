"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import ThemeToggle from "@/components/theme-toggle";
import WishlistNavBadge from "@/components/wishlist/WishlistNavBadge";
import CartNavButton from "@/components/cart/CartNavButton";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/brands", label: "Brands" },
  { href: "/categories", label: "Categories" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const authed = status === "authenticated";

  React.useEffect(() => {
    try {
      if (status === "authenticated") {
        const token = (session as any)?.token;
        if (token) {
          localStorage.setItem("token", token);
          window.dispatchEvent(new Event("auth-changed"));
        }
      } else if (status === "unauthenticated") {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-changed"));
      }
    } catch {}
  }, [status, session]);

  const isActive = React.useCallback(
    (href: string) => pathname === href || pathname?.startsWith(href + "/"),
    [pathname]
  );

  const linkBase =
    "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition";
  const linkInactive =
    "text-muted-foreground hover:text-foreground hover:bg-muted/60";
  const linkActive =
    "bg-foreground text-background shadow-sm hover:bg-foreground/90";

  const iconBtn =
    "h-10 w-10 rounded-full border border-border/60 bg-background/60 backdrop-blur hover:bg-muted/60";

  async function logout() {
    await signOut({ redirect: false });
    try {
      localStorage.removeItem("token");
    } catch {}

    window.dispatchEvent(new Event("auth-changed"));
    window.dispatchEvent(new CustomEvent("cart-changed", { detail: { count: 0 } }));
    window.dispatchEvent(new Event("wishlist-changed"));

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background shadow-sm">
              S
            </span>
            <span className="text-lg text-foreground">ShopMart</span>
          </Link>

          {/* Center links */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <ul className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 p-1 backdrop-blur">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cx(linkBase, isActive(l.href) ? linkActive : linkInactive)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right */}
          <div className="ml-auto flex items-center gap-2">
            {/* Mobile nav menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={cx("md:hidden", iconBtn)} aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 md:hidden">
                {LINKS.map((l) => (
                  <DropdownMenuItem key={l.href} asChild className="rounded-xl">
                    <Link href={l.href}>{l.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme */}
            {/* لو ThemeToggle بيدعم className استخدمه: */}
            {/* <ThemeToggle className={iconBtn} /> */}
           <ThemeToggle className={iconBtn} />


            {/* Wishlist */}
            <div className="relative">
              <Button asChild variant="outline" size="icon" className={iconBtn} aria-label="Wishlist">
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <WishlistNavBadge />
            </div>

            {/* Cart */}
            <div className="relative">
              <Button asChild variant="outline" size="icon" className={iconBtn} aria-label="Cart">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
              <CartNavButton />
            </div>

            {/* Auth */}
            {!authed ? (
              <>
                <Button asChild variant="outline" className="hidden rounded-full md:inline-flex">
                  <Link href="/login" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Login
                  </Link>
                </Button>

                <Button asChild className="hidden rounded-full md:inline-flex">
                  <Link href="/register">Register</Link>
                </Button>

                {/* Mobile account */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className={cx("md:hidden", iconBtn)} aria-label="Account">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 md:hidden">
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className={iconBtn} aria-label="User menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/addresses">Addresses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/change-password">Change Password</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logout} className="rounded-xl text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
