// lib/jwt.ts
export function decodeJwtPayload(token: string): any | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // browser
    if (typeof window !== "undefined" && typeof atob === "function") {
      const json = atob(padded);
      return JSON.parse(json);
    }

    // node
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const buf = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(buf);
  } catch {
    return null;
  }
}

export function getUserIdFromJwt(token: string): string | null {
  const p = decodeJwtPayload(token);
  const id =
    p?.id ??
    p?.userId ??
    p?._id ??
    p?.sub ??
    null;

  return id ? String(id) : null;
}
