// lib/api.ts
import { getToken } from "./token";

const BASE = "https://ecommerce.routemisr.com/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  auth?: boolean;
  headers?: Record<string, string>;
  cache?: RequestCache;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    headers = {},
    cache = "no-store",
  } = opts;

  const token = auth ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      cache,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { token } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e: any) {
    // ده كان بيطلع "Pool was force destroyed"
    throw new ApiError("Network error (dev server restarted). Try again.", 0, e);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message ?? `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}
