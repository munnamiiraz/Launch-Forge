"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { LEADERBOARD_STALE_TIME } from "../_lib/queryKeys";

interface LeaderboardQueryProviderProps {
  children:        React.ReactNode;
  dehydratedState?: DehydratedState;
}

/**
 * Scoped QueryClient for the leaderboard detail page.
 *
 * Created with useState so each page mount gets a fresh client
 * (avoids sharing state between server renders in Next.js).
 *
 * HydrationBoundary rehydrates the server-prefetched cache
 * so the first render shows data immediately — no loading spinner.
 */
export function LeaderboardQueryProvider({
  children,
  dehydratedState,
}: LeaderboardQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            LEADERBOARD_STALE_TIME,
            refetchOnWindowFocus: true,
            retry:                1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}