"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { forgotPassword } from "./forgot-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      await forgotPassword(values.email);
      localStorage.setItem("reset-email", values.email);
      router.push("/verify-code");
    } catch (e: any) {
      setApiError(e?.message ?? "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Remembered it? <Link className="underline" href="/login">Login</Link>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {apiError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{apiError}</div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="name@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-full font-semibold">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : "Send code"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
