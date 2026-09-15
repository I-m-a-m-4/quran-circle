'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronRight, Trash2 } from 'lucide-react';
import { getBookmarks, removeBookmark, type BookmarkItem } from '@/lib/storage/local';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (id: string) => {
    removeBookmark(id);
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-semibold">Bookmarks</h1>
      </div>

      <div className="p-6">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No bookmarks yet.</p>
            <p className="text-sm mt-1">Save ayahs or adhkar to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="bg-card rounded-xl border border-border p-5 relative group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {bm.type === 'ayah' ? (
                      <Link 
                        href={`/quran/${bm.surahNumber}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        {bm.surahName} • Ayah {bm.ayahNumber} <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-primary">Adhkar</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(bm.id)}
                    className="p-2 -mt-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {bm.arabicText && (
                  <p className="font-quran text-2xl leading-loose text-right mb-4" dir="rtl">
                    {bm.arabicText}
                  </p>
                )}
                
                {bm.translation && (
                  <p className="text-sm text-muted-foreground leading-relaxed pr-6">
                    {bm.translation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
