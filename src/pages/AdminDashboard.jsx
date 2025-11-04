import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Building2,
  Building,
  ExternalLink,
  LogOut,
  BookOpen,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AdminContactFormModal from '../components/AdminContactFormModal';
import ConfirmModal from '../components/ConfirmModal';
import * as contactsApi from '../services/contactsApi';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Fetch ALL contacts (up to 1000) for admin panel
  const {
    data: contactsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const response = await contactsApi.getContacts({
        page: 1,
        limit: 500,
        include_pictures: true  // Include profile pictures for admin
      });
      return response.data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to fetch contacts');
    }
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: (data) => contactsApi.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('Contact created successfully');
      setIsFormModalOpen(false);
      setSelectedContact(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create contact');
    }
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactsApi.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('Contact updated successfully');
      setIsFormModalOpen(false);
      setSelectedContact(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update contact');
    }
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => contactsApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('Contact deleted successfully');
      setIsDeleteModalOpen(false);
      setContactToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    }
  });

  // Toggle ERT mutation
  const toggleERTMutation = useMutation({
    mutationFn: ({ id, isErt }) => contactsApi.toggleERT(id, isErt),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('ERT status updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update ERT status');
    }
  });

  // Toggle IFA mutation
  const toggleIFAMutation = useMutation({
    mutationFn: ({ id, isIfa }) => contactsApi.toggleIFA(id, isIfa),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('IFA status updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update IFA status');
    }
  });

  // Toggle Expose mutation
  const toggleExposeMutation = useMutation({
    mutationFn: ({ id, expose }) => contactsApi.toggleExpose(id, expose),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('Expose status updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update expose status');
    }
  });

  // Toggle Third Party mutation
  const toggleThirdPartyMutation = useMutation({
    mutationFn: ({ id, isThirdParty }) => contactsApi.toggleThirdParty(id, isThirdParty),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contacts']);
      toast.success('Third Party status updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update third party status');
    }
  });

  // Filter, sort, and paginate contacts
  const processedContacts = useMemo(() => {
    if (!contactsData?.contacts) return [];

    let filtered = [...contactsData.contacts];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(search) ||
        contact.designation?.toLowerCase().includes(search) ||
        contact.department?.toLowerCase().includes(search) ||
        contact.email?.toLowerCase().includes(search) ||
        contact.mobile?.toLowerCase().includes(search) ||
        contact.landline?.toLowerCase().includes(search) ||
        contact.extension?.toLowerCase().includes(search) ||
        contact.company?.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortColumn] || '';
      let bValue = b[sortColumn] || '';

      // Handle boolean values (isErt)
      if (typeof aValue === 'boolean') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [contactsData, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedContacts.length / itemsPerPage);
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedContacts, currentPage, itemsPerPage]);

  // Handlers
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsFormModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete.id);
    }
  };

  const handleFormSubmit = async (data) => {
    if (selectedContact) {
      await updateMutation.mutateAsync({ id: selectedContact.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleToggleERT = (contact) => {
    toggleERTMutation.mutate({
      id: contact.id,
      isErt: !contact.is_ert
    });
  };

  const handleToggleIFA = (contact) => {
    toggleIFAMutation.mutate({
      id: contact.id,
      isIfa: !contact.is_ifa
    });
  };

  const handleToggleExpose = (contact) => {
    toggleExposeMutation.mutate({
      id: contact.id,
      expose: !contact.expose
    });
  };

  const handleToggleThirdParty = (contact) => {
    toggleThirdPartyMutation.mutate({
      id: contact.id,
      isThirdParty: !contact.is_third_party
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleOpenPhonebook = () => {
    window.open('/', '_blank');
  };

  // Sort icon component
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Table header component
  const TableHeader = ({ column, label, sortable = true }) => (
    <th
      onClick={() => sortable && handleSort(column)}
      className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
        sortable ? 'cursor-pointer hover:bg-gray-100' : ''
      }`}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortable && <SortIcon column={column} />}
      </div>
    </th>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="card p-8">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Contacts</h2>
            <p className="text-gray-600">{error?.response?.data?.message || 'Something went wrong'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header with Actions */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  Admin Dashboard
                  <span className="badge badge-primary text-base px-4 py-2">
                    {processedContacts.length} {processedContacts.length === 1 ? 'Contact' : 'Contacts'}
                  </span>
                </h1>
                <p className="text-gray-600">
                  Manage all contacts with full CRUD operations
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenPhonebook}
                  className="btn-secondary flex items-center gap-2"
                  title="Open Phonebook in new tab"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="hidden sm:inline">Phonebook</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="card p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="input w-full pl-10"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddContact}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </button>
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedContacts.length} of {processedContacts.length} contacts
              {searchTerm && ` (filtered from ${contactsData?.contacts?.length || 0} total)`}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Photo
                  </th>
                  <TableHeader column="name" label="Name" />
                  <TableHeader column="designation" label="Designation" />
                  <TableHeader column="department" label="Department" />
                  <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-lg font-medium">No contacts found</p>
                        <p className="text-sm">
                          {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new contact'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        {contact.profile_picture ? (
                          <img
                            src={contact.profile_picture}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-semibold text-gray-900 truncate">{contact.name}</div>
                        {contact.email && (
                          <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-700 truncate">{contact.designation || '-'}</div>
                        {contact.mobile && (
                          <div className="text-xs text-gray-500">{contact.mobile}</div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-700 truncate">{contact.department || '-'}</div>
                        {contact.extension && (
                          <div className="text-xs text-gray-500">Ext: {contact.extension}</div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1 flex-wrap">
                            {contact.is_ert && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                <Shield className="w-3 h-3 mr-1" />
                                ERT
                              </span>
                            )}
                            {contact.is_ifa && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                <Building className="w-3 h-3 mr-1" />
                                IFA
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              contact.expose
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {contact.expose ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visible
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Hidden
                                </>
                              )}
                            </span>
                            {contact.is_third_party && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                <Building2 className="w-3 h-3 mr-1" />
                                3rd Party
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit contact"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablet/Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {paginatedContacts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No contacts found</p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new contact'}
              </p>
            </div>
          ) : (
            paginatedContacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Header */}
                <div className="flex items-start gap-4 mb-3">
                  {contact.profile_picture ? (
                    <img
                      src={contact.profile_picture}
                      alt={contact.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-lg truncate">{contact.name}</h3>
                    {contact.designation && (
                      <p className="text-sm text-gray-600 truncate">{contact.designation}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleERT(contact)}
                      disabled={toggleERTMutation.isLoading}
                      className={`badge ${
                        contact.is_ert
                          ? 'badge-warning'
                          : 'bg-gray-100 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      {contact.is_ert ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          ERT
                        </>
                      ) : (
                        <>
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Not ERT
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleIFA(contact)}
                      disabled={toggleIFAMutation.isLoading}
                      className={`badge ${
                        contact.is_ifa
                          ? 'badge-info'
                          : 'bg-gray-100 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      {contact.is_ifa ? (
                        <>
                          <Building className="w-3 h-3 mr-1" />
                          IFA
                        </>
                      ) : (
                        <>
                          <Building className="w-3 h-3 mr-1" />
                          Not IFA
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleExpose(contact)}
                      disabled={toggleExposeMutation.isLoading}
                      className={`badge ${
                        contact.expose
                          ? 'badge-success'
                          : 'badge-error'
                      } disabled:opacity-50`}
                    >
                      {contact.expose ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {contact.department && (
                    <div className="text-sm">
                      <span className="text-gray-500">Department:</span>{' '}
                      <span className="text-gray-900">{contact.department}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="text-sm">
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="text-gray-900">{contact.email}</span>
                    </div>
                  )}
                  {contact.mobile && (
                    <div className="text-sm">
                      <span className="text-gray-500">Mobile:</span>{' '}
                      <span className="text-gray-900">{contact.mobile}</span>
                    </div>
                  )}
                  {contact.landline && (
                    <div className="text-sm">
                      <span className="text-gray-500">Landline:</span>{' '}
                      <span className="text-gray-900">{contact.landline}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(contact)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 card p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setContactToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message={`Are you sure you want to delete "${contactToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default AdminDashboard;
