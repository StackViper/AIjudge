"use client";
import { useEffect } from "react";

/**
 * Development tools component
 * Only active in development mode
 * Provides browser console utilities for debugging
 */
export function DevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Import test utilities
      import("@/lib/testApi").then(() => {
        console.log(
          "%c🛠️ Judge AI Dev Tools Loaded",
          "background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
        );
        console.log("Available commands:");
        console.log("  • testBackendConnection() - Test API connectivity");
        console.log("  • testPublicEndpoint() - Test health endpoint");
        console.log("  • enableApiDebugMode() - Log all API requests");
        console.log("\nEnvironment:");
        console.log("  • API URL:", process.env.NEXT_PUBLIC_API_URL || "❌ NOT SET");
      });
    }
  }, []);

  return null; // This component renders nothing
}
