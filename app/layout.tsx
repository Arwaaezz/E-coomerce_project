import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/navbar/page";
import Providers from "./providers";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopMart",
  description: "Ecommerce app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Providers>
              <WishlistProvider>
                <Navbar />
                <div className="container mx-auto px-4">{children}</div>
              </WishlistProvider>
            </Providers>

            <ToastViewport />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
