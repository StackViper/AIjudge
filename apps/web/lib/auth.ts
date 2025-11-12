export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("judgeai_token");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("judgeai_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("judgeai_token");
}
