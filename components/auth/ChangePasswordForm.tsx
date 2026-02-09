"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    password: z.string().min(6, "New password must be at least 6 characters"),
    rePassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((v) => v.password === v.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      password: "",
      rePassword: "",
    },
  });

  // token من NextAuth session (أفضل) أو من localStorage (fallback)
  const token =
    (session as any)?.token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);

    try {
      if (!token) {
        setApiError("Login required");
        router.replace("/login");
        return;
      }

      const res = await fetch(
        "https://ecommerce.routemisr.com/api/v1/users/changeMyPassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // غالبًا message موجودة
        setApiError(data?.message ?? `Request failed (${res.status})`);
        return;
      }

      // بعض السيرفرات بترجع token جديد بعد تغيير الباسورد — لو رجع خزّنيه
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ خلي الـ navbar والـ cart badge يتحدثوا فورًا
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("cart-changed"));

      // نجاح
      form.reset();
      router.replace("/products");
      router.refresh();
    } catch {
      setApiError("Network error, try again");
    } finally {
      setLoading(false);
    }
  }

  // لو لسه session بتتحمل، متحسيش الصفحة “فاضية”
  const disabled = loading || status === "loading";

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Change password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your account password.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {apiError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rePassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={disabled}
              className="h-11 w-full rounded-full font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
