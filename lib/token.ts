export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("auth:updated"));
}

export function clearToken() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth:updated"));
}
