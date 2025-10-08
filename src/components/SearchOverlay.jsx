import { useEffect } from 'react';
import { X } from 'lucide-react';

const SearchOverlay = ({ isOpen, onClose, searchQuery, setSearchQuery }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        // Keep search active, just close overlay
        onClose();
      } else if (e.key === 'Escape') {
        // Clear search and close
        setSearchQuery('');
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, setSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Ghost watermark in background */}
      {searchQuery && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="text-[20rem] font-bold text-white/5 select-none whitespace-nowrap">
            {searchQuery}
          </div>
        </div>
      )}

      {/* Search input container */}
      <div className="relative z-10 w-full max-w-3xl px-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            autoFocus
            className="w-full px-8 py-6 text-4xl font-light text-white bg-white/10 border-2 border-amber-500/50 rounded-2xl focus:outline-none focus:border-amber-500 placeholder-white/40 backdrop-blur-sm"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        {/* Hint text */}
        <div className="mt-4 text-center text-white/60 text-sm space-y-1">
          <p>Press <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> to search</p>
          <p>Press <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> to clear and close</p>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
