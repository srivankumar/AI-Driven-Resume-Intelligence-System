import { QueryClient } from '@tanstack/react-query';

// Create a singleton query client with optimized cache settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      
      // Network Optimization
      retry: 1, // Only retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch Configuration
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab (reduces server load)
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: false, // Don't refetch if data is still fresh
      
      // Request Deduplication
      // React Query automatically deduplicates requests made within a short time window
      // This prevents multiple components from making the same request
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      retryDelay: 1000,
    },
  },
});

// Cache invalidation strategies
export const CACHE_STRATEGIES = {
  // Jobs - relatively static, can be cached longer
  JOBS_LIST: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Job details - can be cached longer as they change less frequently
  JOB_DETAIL: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Applications - more dynamic, shorter cache
  APPLICATIONS_LIST: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Application status - check frequently
  APPLICATION_STATUS: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Top candidates - can be cached moderately
  TOP_CANDIDATES: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
};

// Prefetch helper to load data before it's needed
export function prefetchQuery(queryKey: any[], queryFn: () => Promise<any>) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

// Helper to manually invalidate specific caches
export function invalidateCache(queryKey: any[]) {
  return queryClient.invalidateQueries({ queryKey });
}

// Helper to clear all cache
export function clearAllCache() {
  return queryClient.clear();
}
