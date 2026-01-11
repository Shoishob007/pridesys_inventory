import { useState, useEffect, useCallback } from 'react';

interface UseDataFetchingOptions<T> {
  initialData?: T;
  delay?: number;
}

interface UseDataFetchingResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingResult<T> {
  const { initialData = null, delay = 800 } = options;
  const [data, setData] = useState<T | null>(initialData as T | null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, delay));
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, delay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Mock data fetching functions
export const mockFetch = <T>(data: T, shouldFail = false): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (shouldFail) {
      reject(new Error('Failed to fetch data. Please try again.'));
    } else {
      resolve(data);
    }
  });
};
