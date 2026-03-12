import { Book } from '../types';
import { DiscoverySectionResult } from '../services/api';

interface DiscoverSectionProps {
  sections: DiscoverySectionResult[];
  isLoading: boolean;
  onBookClick: (book: Book) => void;
  onSeeMore?: (sectionKey: string) => void;
}

const SkeletonRow = () => (
  <div className="mb-4">
    <div className="h-4 w-24 rounded bg-[var(--bg-soft)] mb-2" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-[110px] sm:w-[140px] flex-shrink-0">
          <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-soft)] animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-[var(--bg-soft)] mt-1.5 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-[var(--bg-soft)] mt-1 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export const DiscoverSection = ({ sections, isLoading, onBookClick, onSeeMore }: DiscoverSectionProps) => {
  if (!sections.length && !isLoading) return null;

  return (
    <div className="mt-6">
      {isLoading && !sections.length ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        sections.map((section) => (
          <div key={section.key} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium opacity-70">{section.title}</h2>
              {onSeeMore && section.books.length > 0 && (
                <button
                  onClick={() => onSeeMore(section.key)}
                  className="text-xs opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  See more &rarr;
                </button>
              )}
            </div>
            <div className="overflow-x-auto flex gap-3 pb-2 scrollbar-hide">
              {section.books.map((book, i) => (
                <button
                  key={book.id || i}
                  onClick={() => onBookClick(book)}
                  className="animate-pop-up hover:scale-[1.03] hover:shadow-lg transition-transform cursor-pointer"
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="w-[110px] sm:w-[140px] flex-shrink-0">
                    {book.preview ? (
                      <img
                        src={book.preview}
                        alt={book.title}
                        className="aspect-[2/3] w-full rounded-lg object-cover bg-[var(--bg-soft)]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-soft)]" />
                    )}
                    <div className="text-xs mt-1.5 line-clamp-2 text-left">{book.title}</div>
                    {book.author && (
                      <div className="text-xs opacity-50 line-clamp-1 text-left">{book.author}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
