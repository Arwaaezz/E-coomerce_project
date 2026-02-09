"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginNextAuthForm() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/products",
      });

      if (!res || res.error) {
        // ✅ نفس شكل register: رسالة فوق + ممكن نحطها تحت email لو حبيتي
        const msg = res?.error || "Login failed";
        setApiError(msg);
        return;
      }

      // ✅ بعد نجاح login: خد session وخزن token للـ endpoints بتاعت cart/wishlist
      const session = await getSession();
      const token = (session as any)?.token;
      if (token) localStorage.setItem("token", token);

      // ✅ تحديث الناف/العداد
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("cart-changed"));

      router.replace(res.url || "/products");
      router.refresh();
    } catch {
      setApiError("Network error, try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link className="underline" href="/register">
            Register
          </Link>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ✅ نفس طريقة register: error box فوق */}
        {apiError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
