"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

export default function AuthSync() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated") {
      const token = (session as any)?.token;
      if (token) localStorage.setItem("token", token);

      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("cart-changed"));
    }

    if (status === "unauthenticated") {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("cart-changed"));
    }
  }, [status, session]);

  return null;
}
