"use client";
import { api } from "./apiClient";

/**
 * Test function to verify backend connectivity
 * Call this from browser console or component to test API
 */
export async function testBackendConnection() {
  console.group("🔍 Backend Connection Test");
  
  // Check environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("1. Environment Variable:");
  console.log("   NEXT_PUBLIC_API_URL =", apiUrl || "❌ NOT SET");
  
  if (!apiUrl) {
    console.error("❌ NEXT_PUBLIC_API_URL is not set!");
    console.log("💡 Create .env.local with:");
    console.log("   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1");
    console.groupEnd();
    return false;
  }
  
  // Test basic GET request
  console.log("\n2. Testing GET request...");
  try {
    const response = await api.get("/cases/user/all");
    console.log("✅ GET /cases/user/all succeeded");
    console.log("   Status:", response.status);
    console.log("   Data:", response.data);
    console.groupEnd();
    return true;
  } catch (error: any) {
    console.error("❌ GET /cases/user/all failed");
    console.log("   Error:", error.message);
    
    if (error.response) {
      console.log("   Status:", error.response.status);
      console.log("   Data:", error.response.data);
      
      if (error.response.status === 401) {
        console.log("💡 401 Unauthorized - You need to sign in first");
      } else if (error.response.status === 404) {
        console.log("💡 404 Not Found - Check backend route exists");
      }
    } else if (error.request) {
      console.error("❌ No response received from server");
      console.log("💡 Possible issues:");
      console.log("   - Backend is not running");
      console.log("   - Wrong API URL");
      console.log("   - CORS issue");
      console.log("   - Network error");
    }
    
    console.groupEnd();
    return false;
  }
}

/**
 * Test unauthenticated endpoint (health check or public route)
 */
export async function testPublicEndpoint() {
  console.group("🔍 Public Endpoint Test");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("Testing:", apiUrl);
  
  try {
    // Try a simple fetch without auth
    const response = await fetch(`${apiUrl}/health`);
    console.log("✅ Health check succeeded");
    console.log("   Status:", response.status);
    const text = await response.text();
    console.log("   Response:", text);
    console.groupEnd();
    return true;
  } catch (error: any) {
    console.error("❌ Health check failed:", error.message);
    console.groupEnd();
    return false;
  }
}

/**
 * Log all axios request/response for debugging
 */
export function enableApiDebugMode() {
  console.log("🐛 API Debug Mode Enabled");
  
  // Log all requests
  api.interceptors.request.use(
    (config) => {
      console.group(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log("Base URL:", config.baseURL);
      console.log("Headers:", config.headers);
      console.log("Data:", config.data);
      console.groupEnd();
      return config;
    },
    (error) => {
      console.error("📤 Request Error:", error);
      return Promise.reject(error);
    }
  );
  
  // Log all responses
  api.interceptors.response.use(
    (response) => {
      console.group(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      console.groupEnd();
      return response;
    },
    (error) => {
      console.group(`📥 API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error("Error:", error.message);
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      console.groupEnd();
      return Promise.reject(error);
    }
  );
}

// Make available in browser console
if (typeof window !== "undefined") {
  (window as any).testBackendConnection = testBackendConnection;
  (window as any).testPublicEndpoint = testPublicEndpoint;
  (window as any).enableApiDebugMode = enableApiDebugMode;
  
  console.log("🛠️ API Test Utilities Available:");
  console.log("   testBackendConnection() - Test authenticated endpoint");
  console.log("   testPublicEndpoint() - Test health check");
  console.log("   enableApiDebugMode() - Log all API calls");
}
