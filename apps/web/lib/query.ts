"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

let client: QueryClient | null = null;
function getClient() {
  if (!client) client = new QueryClient();
  return client;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: getClient() }, children);
}
