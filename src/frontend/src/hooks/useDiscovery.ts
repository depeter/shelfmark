import { useState, useEffect, useRef } from 'react';
import { getDiscovery, DiscoverySectionResult } from '../services/api';

interface UseDiscoveryOptions {
  enabled: boolean;
}

export function useDiscovery({ enabled }: UseDiscoveryOptions) {
  const [sections, setSections] = useState<DiscoverySectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cachedRef = useRef<DiscoverySectionResult[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (cachedRef.current) {
      setSections(cachedRef.current);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    getDiscovery()
      .then((result) => {
        if (!cancelled) {
          cachedRef.current = result;
          setSections(result);
        }
      })
      .catch(() => {
        // Silently ignore — home page falls back to search-only
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  return { sections, isLoading };
}
