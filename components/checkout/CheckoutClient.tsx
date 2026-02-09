"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { getCart, clearCart, type CartResponse } from "@/components/cart/cart-api";
import { createCashOrder, checkoutOnline, type ShippingAddress } from "@/components/checkout/checkout-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  details: z.string().min(3, "Enter address details"),
  phone: z.string().min(8, "Enter valid phone"),
  city: z.string().min(2, "Enter city"),
});

type FormValues = z.infer<typeof schema>;

function getCartId(cart: CartResponse | null) {
  return String((cart?.data as any)?._id ?? (cart?.data as any)?.id ?? "");
}

export default function CheckoutClient() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [payment, setPayment] = React.useState<"cash" | "online">("cash");
  const [cart, setCart] = React.useState<CartResponse | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { details: "", phone: "", city: "" },
  });

  React.useEffect(() => {
    (async () => {
      try {
        const c = await getCart();
        setCart(c);
      } catch (e: any) {
        setApiError(e?.message ?? "Failed to load cart");
      }
    })();
  }, []);

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);

    try {
      // تأكد cartId
      const c = cart ?? (await getCart());
      const cartId = getCartId(c);
      if (!cartId) throw new Error("Missing cartId from cart response");

      const shippingAddress: ShippingAddress = {
        details: values.details,
        phone: values.phone,
        city: values.city,
      };

      if (payment === "cash") {
        await createCashOrder(cartId, shippingAddress);

        // اختياري: فضّي الكارت بعد نجاح الأوردر
        await clearCart().catch(() => {});
        window.dispatchEvent(new CustomEvent("cart-changed", { detail: { count: 0 } }));

        router.replace("/orders");
        router.refresh();
        return;
      }

      // online
      const returnUrl = `${window.location.origin}/orders`;
      const res: any = await checkoutOnline(cartId, shippingAddress, returnUrl);

      const url =
        res?.session?.url ||
        res?.url ||
        res?.data?.session?.url ||
        res?.data?.url;

      if (!url) throw new Error("Missing checkout session url from API response");

      window.location.href = url; // redirect لبوابة الدفع
    } catch (e: any) {
      setApiError(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <Card className="mx-auto w-full max-w-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {apiError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant={payment === "cash" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPayment("cash")}
            >
              Cash
            </Button>
            <Button
              type="button"
              variant={payment === "online" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPayment("online")}
            >
              Online
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address details</FormLabel>
                    <FormControl>
                      <Input placeholder="Street, building, ...etc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Cairo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="010xxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={loading} className="h-11 w-full rounded-full font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place order (${payment})`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
