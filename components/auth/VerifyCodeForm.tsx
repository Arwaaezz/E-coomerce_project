"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { verifyResetCode } from "./forgot-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  resetCode: z.string().min(4, "Enter the code"),
});
type FormValues = z.infer<typeof schema>;

export default function VerifyCodeForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resetCode: "" },
  });

  React.useEffect(() => {
    const email = localStorage.getItem("reset-email");
    if (!email) router.replace("/forgot-password");
  }, [router]);
  

  async function onSubmit(values: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      await verifyResetCode(values.resetCode);
      localStorage.setItem("reset-verified", "1");
      router.push("/reset-password");
    } catch (e: any) {
      setApiError(e?.message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Verify code</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {apiError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{apiError}</div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resetCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset code</FormLabel>
                  <FormControl><Input placeholder="1234" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-full font-semibold">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>) : "Verify"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
