import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, Plus, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { getContacts, getTags, getLanguages } from '../services/contactsApi';
import { sendNewContactEmail } from '../services/emailService';
import toast from 'react-hot-toast';

// Components
import Sidebar from '../components/Sidebar';
import SearchOverlay from '../components/SearchOverlay';
import SearchBar from '../components/SearchBar';
import TagCloud from '../components/TagCloud';
import LanguageBar from '../components/LanguageBar';
import ContactCard from '../components/ContactCard';
import Pagination from '../components/Pagination';
import ContactDetailModal from '../components/ContactDetailModal';
import ContactFormModal from '../components/ContactFormModal';
import EmergencyModal from '../components/EmergencyModal';
import LocationModal from '../components/LocationModal';
import HelpModal from '../components/HelpModal';
import AccessCodeModal from '../components/AccessCodeModal';
import Loader from '../components/Loader';

const ITEMS_PER_PAGE = 20; // 4x5 grid

const HomePage = () => {
  const { theme } = useTheme();
  const { favorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Access verification state
  const [isAccessVerified, setIsAccessVerified] = useState(false);

  // State Management
  const [currentView, setCurrentView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);

  // Modal States
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check access verification on mount
  useEffect(() => {
    const isVerified = sessionStorage.getItem('hotel_access_verified');
    if (isVerified === 'true') {
      setIsAccessVerified(true);
    }
  }, []);

  // Show help modal on first visit (only after access is verified)
  useEffect(() => {
    if (isAccessVerified) {
      const hasSeenHelp = sessionStorage.getItem('hasSeenHelp');
      if (!hasSeenHelp) {
        setIsHelpModalOpen(true);
        sessionStorage.setItem('hasSeenHelp', 'true');
      }
    }
  }, [isAccessVerified]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab - Focus search (only if no modal is open)
      if (
        e.key === 'Tab' &&
        !isDetailModalOpen &&
        !isFormModalOpen &&
        !isEmergencyModalOpen &&
        !isLocationModalOpen &&
        !isHelpModalOpen
      ) {
        e.preventDefault();
        setIsSearchOverlayOpen(true);
      }

      // Escape - Close modals or clear search
      if (e.key === 'Escape') {
        if (isSearchOverlayOpen) {
          setSearchQuery('');
          setIsSearchOverlayOpen(false);
        } else if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
        } else if (isFormModalOpen) {
          setIsFormModalOpen(false);
        } else if (isEmergencyModalOpen) {
          setIsEmergencyModalOpen(false);
        } else if (isLocationModalOpen) {
          setIsLocationModalOpen(false);
        } else if (isHelpModalOpen) {
          setIsHelpModalOpen(false);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSearchOverlayOpen,
    isDetailModalOpen,
    isFormModalOpen,
    isEmergencyModalOpen,
    isLocationModalOpen,
    isHelpModalOpen,
    searchQuery,
  ]);

  // Fetch ALL contacts at once for client-side filtering and pagination
  const {
    data: allContactsData,
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: async () => {
      const params = {
        page: 1,
        limit: 1000, // Fetch all contacts (you have 183)
        sortBy: 'name',
      };

      const response = await getContacts(params);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // Cache for 1 minute only
    cacheTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    enabled: isAccessVerified, // Only fetch if access is verified
  });

  // Fetch tags
  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await getTags();
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    enabled: isAccessVerified, // Only fetch if access is verified
  });

  // Fetch languages
  const { data: languagesData, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await getLanguages();
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    enabled: isAccessVerified, // Only fetch if access is verified
  });

  // Client-side filtering and pagination with useMemo
  const { contacts: filteredContacts, totalPages, totalResults } = useMemo(() => {
    if (!allContactsData?.contacts || !Array.isArray(allContactsData.contacts)) {
      return { contacts: [], totalPages: 1, totalResults: 0 };
    }

    let filtered = [...allContactsData.contacts];

    // Apply view filter
    if (currentView === 'emergency') {
      filtered = filtered.filter(contact => contact.is_ert);
    } else if (currentView === 'ifa') {
      filtered = filtered.filter(contact => contact.is_ifa);
    } else if (currentView === 'thirdparty') {
      filtered = filtered.filter(contact => contact.is_third_party);
    } else if (currentView === 'all') {
      filtered = filtered.filter(contact => !contact.is_third_party);
    } else if (currentView === 'favorites') {
      filtered = filtered.filter(contact => {
        const id = contact._id || contact.id;
        return id && isFavorite(id);
      });
    } else if (currentView === 'languages' || currentView === 'tags') {
      // For languages and tags views, exclude IFA and 3rd Party contacts
      filtered = filtered.filter(contact => !contact.is_ifa && !contact.is_third_party);
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(query) ||
        contact.designation?.toLowerCase().includes(query) ||
        contact.department?.toLowerCase().includes(query) ||
        contact.extension?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.mobile?.toLowerCase().includes(query) ||
        contact.landline?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(contact =>
        contact.tags?.includes(selectedTag)
      );
    }

    // Apply language filter
    if (selectedLanguage) {
      filtered = filtered.filter(contact =>
        contact.languages?.includes(selectedLanguage)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'department') {
        return (a.department || '').localeCompare(b.department || '');
      } else if (sortBy === 'extension') {
        return (a.extension || '').localeCompare(b.extension || '');
      }
      return 0;
    });

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;

    // Paginate
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedContacts = filtered.slice(startIndex, endIndex);

    return {
      contacts: paginatedContacts,
      totalPages,
      totalResults
    };
  }, [allContactsData, currentView, debouncedSearchQuery, selectedTag, selectedLanguage, sortBy, currentPage, isFavorite, favorites]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedTag, selectedLanguage, currentView]);

  // Handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedTag(null);
    setSelectedLanguage(null);
  };

  const handleOpenDetail = (contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedContact(null);
  };

  const handleOpenForm = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await sendNewContactEmail(formData);
      toast.success('Contact suggestion sent successfully!');
      handleCloseForm();
    } catch (error) {
      toast.error('Failed to send suggestion. Please try again.');
      throw error;
    }
  };

  const handleEditContact = (contact) => {
    // Open the detail modal which will have edit functionality
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccessVerified = () => {
    setIsAccessVerified(true);
  };

  // Show initial loader
  if (isLoadingContacts && !allContactsData) {
    return <Loader text="Loading contacts..." />;
  }

  // Show error state
  if (contactsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Contacts
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {contactsError.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => refetchContacts()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={handleViewChange}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {/* Main Content */}
      <div className="lg:pl-64 h-screen flex flex-col">
        {/* Mobile Search Bar */}
        <div className="flex-shrink-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => {}}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Main Container - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-4 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            {/* Top Bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Results Count */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentView === 'all' && 'All Contacts'}
                {currentView === 'emergency' && 'Emergency Response Team'}
                {currentView === 'ifa' && 'IFA Contacts'}
                {currentView === 'thirdparty' && 'Third Party Companies'}
                {currentView === 'favorites' && 'Favorites'}
                {currentView === 'languages' && 'Languages'}
                {currentView === 'tags' && 'Tags'}
              </h1>
              <span className="badge badge-primary">
                {isLoadingContacts ? '...' : totalResults}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="input appearance-none pl-3 pr-10 py-2 text-sm cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="extension">Sort by Extension</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Help Button */}
              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="btn-secondary p-2"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Add Contact Button */}
              <button
                onClick={handleOpenForm}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Contact</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Tag Cloud - Show when in tags view */}
          {currentView === 'tags' && !isLoadingTags && tagsData?.tags && (
            <div className="mb-4">
              <TagCloud
                tags={tagsData.tags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
              />
            </div>
          )}

          {/* Language Bar - Show when in languages view */}
          {currentView === 'languages' && !isLoadingLanguages && languagesData?.languages && (
            <div className="mb-4">
              <LanguageBar
                languages={languagesData.languages}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
              />
            </div>
          )}

          {/* Contact Grid */}
          {isLoadingContacts ? (
            <div className="flex items-center justify-center py-20">
              <Loader text="Loading contacts..." />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center card max-w-md p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No contacts found
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : currentView === 'favorites'
                    ? 'You have not added any favorites yet'
                    : 'No contacts available'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                      setSelectedLanguage(null);
                    }}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 mb-4">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact._id || contact.id}
                    contact={contact}
                    onOpenDetail={handleOpenDetail}
                    onEdit={handleEditContact}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="sticky bottom-0 bg-gradient-to-t from-purple-50 via-purple-50 to-transparent pt-2 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Desktop Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
      />

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      {/* Access Code Modal */}
      <AccessCodeModal
        isOpen={!isAccessVerified}
        onVerified={handleAccessVerified}
      />
    </div>
  );
};

export default HomePage;
