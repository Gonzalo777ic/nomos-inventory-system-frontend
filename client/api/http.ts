// http.ts
import axios, { AxiosRequestHeaders } from "axios";

export const http = axios.create({
  baseURL: "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("nomos_token");
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function tryRequest<T>(fn: () => Promise<{ data: T }>, fallback: () => Promise<T>): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch {
    return await fallback();
  }
}
