"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { getUserOrders } from "../checkout/order-api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrdersClient() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (status !== "authenticated") return;

    const userId =
      (session as any)?.user?._id || (session as any)?.userId || null;

    if (!userId) {
      setError("Missing user id (check NextAuth session.user._id)");
      return;
    }

    (async () => {
      try {
        setError("");
        const res = await getUserOrders(userId);
        // غالبًا بيرجع array
        setOrders(Array.isArray(res) ? res : res?.data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load orders");
      }
    })();
  }, [status, session]);

  if (status === "loading") return <div className="p-6">Loading...</div>;

  if (status === "unauthenticated") {
    return (
      <div className="p-6 space-y-3">
        <p>Please login to view orders.</p>
        <Button asChild className="rounded-full">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border p-6 text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o._id || o.id} className="rounded-2xl border p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">#{o._id || o.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.paymentMethodType} • {o.isPaid ? "Paid" : "Not paid"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{o.totalOrderPrice} EGP</p>
                  <p className="text-sm text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
