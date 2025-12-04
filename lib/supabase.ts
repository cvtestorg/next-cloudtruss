"use client";

import { createBrowserClient } from "@supabase/ssr";
import { logger } from "./logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  logger.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// 使用 createBrowserClient 将 session 存储在 cookies 中，而不是 localStorage
// 这样 proxy 和服务器端组件都能访问到 session
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
