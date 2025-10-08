import { Search, X } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch, onClear }) => {
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="md:hidden w-full px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
        >
          Search
        </button>

        {/* Clear button - only show if there's a search query */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
