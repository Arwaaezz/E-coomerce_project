"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { resetPassword } from "./forgot-api";
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
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Confirm password is required"),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  // ✅ Protect route: لازم email + verified
  React.useEffect(() => {
    const email = localStorage.getItem("reset-email");
    const verified = localStorage.getItem("reset-verified");
    if (!email) router.replace("/forgot-password");
    else if (verified !== "1") router.replace("/verify-code");
  }, [router]);

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);

    try {
      const email = localStorage.getItem("reset-email");
      if (!email) {
        router.replace("/forgot-password");
        return;
      }

      // 1) Reset password
      await resetPassword(email, values.newPassword);

      // 2) Clear reset flow keys
      localStorage.removeItem("reset-email");
      localStorage.removeItem("reset-verified");

      // 3) ✅ Auto login (عشان الناف يتحدث فورًا)
      const loginRes = await signIn("credentials", {
        email,
        password: values.newPassword,
        redirect: false,
        callbackUrl: "/products",
      });

      if (!loginRes || loginRes.error) {
        router.replace("/login");
        return;
      }

      // ✅ خلي الناف/الكارت يتحدثوا
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("cart-changed"));

      router.replace(loginRes.url || "/products");
      router.refresh();
    } catch (e: any) {
      setApiError(e?.message ?? "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Back to <Link className="underline" href="/login">Login</Link>
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
              name="newPassword"
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
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
