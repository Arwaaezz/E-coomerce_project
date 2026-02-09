"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, Plus } from "lucide-react";

import {
  addAddress,
  getAddresses,
  removeAddress,
  type Address,
} from "./address-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const egyptPhone = /^01[0125][0-9]{8}$/;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars").optional().or(z.literal("")),
  details: z.string().min(5, "Details must be at least 5 chars"),
  city: z.string().min(2, "City is required"),
  phone: z.string().regex(egyptPhone, "Enter a valid Egyptian phone number"),
});

type FormValues = z.infer<typeof schema>;

function hasToken() {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

export default function AddressesClient() {
  const [items, setItems] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Home",
      details: "",
      city: "",
      phone: "",
    },
  });

  async function load() {
    setError(null);

    // لو مش logged in
    if (!hasToken()) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAddresses();
      setItems(res?.data ?? []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();

    // لو user عمل login/logout في نفس السشن
    const onAuth = () => load();
    window.addEventListener("auth-changed", onAuth as any);
    return () => window.removeEventListener("auth-changed", onAuth as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormValues) {
    setError(null);

    try {
      setBusyId("ADD");

      const body = {
        name: values.name?.trim() ? values.name.trim() : undefined,
        details: values.details.trim(),
        city: values.city.trim(),
        phone: values.phone.trim(),
      };

      const res = await addAddress(body);
      setItems(res?.data ?? []);
      form.reset({ name: "Home", details: "", city: "", phone: "" });
    } catch (e: any) {
      setError(e?.message ?? "Add address failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onRemove(id: string) {
    setError(null);
    try {
      setBusyId(id);
      const res = await removeAddress(id);
      setItems(res?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  // حالة عدم تسجيل الدخول
  if (!hasToken() && !loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">You are not logged in</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Login to manage your addresses.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button asChild className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>
        <p className="text-sm text-muted-foreground">
          Add and manage your shipping addresses
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <Card className="rounded-3xl">
              <CardContent className="flex min-h-[180px] items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="rounded-3xl">
              <CardContent className="p-8 text-center">
                <p className="text-lg font-semibold">No addresses yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first address from the form.
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((a) => (
              <Card key={a._id} className="rounded-3xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {a.name?.trim() ? a.name : "Address"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.details}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>City: {a.city}</span>
                        <span>•</span>
                        <span>Phone: {a.phone}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 rounded-full"
                      disabled={busyId === a._id}
                      onClick={() => onRemove(a._id)}
                      aria-label="Remove address"
                    >
                      {busyId === a._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Form */}
        <Card className="h-fit rounded-3xl">
          <CardHeader className="pb-0">
            <p className="text-xl font-semibold">Add address</p>
            <p className="text-sm text-muted-foreground">
              This will be used at checkout
            </p>
          </CardHeader>

          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Home / Work" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Input placeholder="Street, building, floor..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <Button
                  type="submit"
                  disabled={busyId === "ADD"}
                  className="h-11 w-full rounded-full font-semibold"
                >
                  {busyId === "ADD" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add address
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
