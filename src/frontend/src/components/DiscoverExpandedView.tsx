import { Book } from '../types';
import { useDiscoverySection } from '../hooks/useDiscoverySection';

interface DiscoverExpandedViewProps {
  sectionKey: string;
  initialBooks: Book[];
  initialTitle: string;
  onBack: () => void;
  onBookClick: (book: Book) => void;
}

export const DiscoverExpandedView = ({
  sectionKey,
  initialBooks,
  initialTitle,
  onBack,
  onBookClick,
}: DiscoverExpandedViewProps) => {
  const { books, title, isLoading, hasMore, loadMore } = useDiscoverySection(
    sectionKey,
    initialBooks,
    initialTitle,
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-xl font-semibold">{title || initialTitle}</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {books.map((book, i) => (
          <button
            key={book.id || i}
            onClick={() => onBookClick(book)}
            className="text-left hover:scale-[1.03] hover:shadow-lg transition-transform cursor-pointer animate-pop-up"
            style={{ animationDelay: `${i * 20}ms`, animationFillMode: 'backwards' }}
          >
            {book.preview ? (
              <img
                src={book.preview}
                alt={book.title}
                className="aspect-[2/3] w-full rounded-lg object-cover bg-[var(--bg-soft)]"
                loading="lazy"
              />
            ) : (
              <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-soft)] flex items-center justify-center">
                <span className="text-xs opacity-30 px-2 text-center line-clamp-3">{book.title}</span>
              </div>
            )}
            <div className="text-xs mt-1.5 line-clamp-2">{book.title}</div>
            {book.author && (
              <div className="text-xs opacity-50 line-clamp-1">{book.author}</div>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-soft)] animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-[var(--bg-soft)] mt-1.5 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-[var(--bg-soft)] mt-1 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 rounded-lg bg-[var(--bg-soft)] hover:opacity-80 transition-colors text-sm cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
