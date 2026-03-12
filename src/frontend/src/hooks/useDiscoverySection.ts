import { useState, useCallback, useRef, useEffect } from 'react';
import { Book } from '../types';
import { getDiscoverySection } from '../services/api';

interface UseDiscoverySectionResult {
  books: Book[];
  title: string;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export function useDiscoverySection(
  sectionKey: string | null,
  initialBooks?: Book[],
  initialTitle?: string,
): UseDiscoverySectionResult {
  const [books, setBooks] = useState<Book[]>(initialBooks || []);
  const [title, setTitle] = useState(initialTitle || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  // Load the first full page on mount
  useEffect(() => {
    if (!sectionKey) return;
    let cancelled = false;
    setIsLoading(true);
    pageRef.current = 1;
    getDiscoverySection(sectionKey, 1)
      .then((result) => {
        if (cancelled) return;
        setBooks(result.books);
        setTitle(result.title);
        setHasMore(result.hasMore);
        pageRef.current = 2;
      })
      .catch(() => { if (!cancelled) setHasMore(false); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [sectionKey]);

  const loadMore = useCallback(() => {
    if (!sectionKey || isLoading || pageRef.current < 2) return;

    setIsLoading(true);
    getDiscoverySection(sectionKey, pageRef.current)
      .then((result) => {
        setBooks((prev) => [...prev, ...result.books]);
        setHasMore(result.hasMore);
        pageRef.current += 1;
      })
      .catch(() => setHasMore(false))
      .finally(() => setIsLoading(false));
  }, [sectionKey, isLoading]);

  return { books, title, isLoading, hasMore, loadMore };
}
