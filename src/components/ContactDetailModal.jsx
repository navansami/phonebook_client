import { useEffect, useState } from 'react';
import { X, Mail, Phone, Building2, Briefcase, MessageSquare, Star, Languages, Tag, Shield, Edit2, Save, Globe, User, Upload, Loader2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact } from '../services/contactsApi';
import toast from 'react-hot-toast';
import axios from 'axios';

// Move component definitions outside to prevent re-creation on every render
const InputField = ({ icon: Icon, label, value, onChange, type = "text", placeholder, isEditing }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-purple-700 uppercase tracking-wide">
      <Icon className="w-4 h-4" />
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
      />
    ) : (
      <div className="px-4 py-3 bg-purple-50/50 rounded-lg border border-purple-100">
        <p className="text-gray-900 font-medium">{value || '-'}</p>
      </div>
    )}
  </div>
);

const TextAreaField = ({ icon: Icon, label, value, onChange, placeholder, isEditing }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-purple-700 uppercase tracking-wide">
      <Icon className="w-4 h-4" />
      {label}
    </label>
    {isEditing ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900 resize-none"
      />
    ) : (
      <div className="px-4 py-3 bg-purple-50/50 rounded-lg border border-purple-100">
        <p className="text-gray-900 whitespace-pre-wrap">{value || '-'}</p>
      </div>
    )}
  </div>
);

const ContactDetailModal = ({ contact, isOpen, onClose }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(contact || {});
  const [profileImage, setProfileImage] = useState(contact?.profile_picture || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const CLOUDINARY_CLOUD_NAME = 'dgyqwlpcm';
  const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // You may need to create an unsigned upload preset in Cloudinary

  // Update edited contact when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      setEditedContact(contact);
      setProfileImage(contact.profile_picture || null);
    }
  }, [isOpen, contact?.id]); // Only update when modal opens or contact ID changes

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateContact(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact updated successfully!');
      setIsEditing(false);

      // Update the local state with the saved data
      // This ensures the modal shows the updated data immediately
      if (response?.data) {
        setEditedContact(response.data);
        setProfileImage(response.data.profile_picture || null);
      } else {
        // If response doesn't include data, use editedContact
        setEditedContact({ ...editedContact });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update contact');
    },
  });

  if (!isOpen || !contact) return null;

  const isFavorite = favorites.includes(contact.id);

  const handleInputChange = (field, value) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setEditedContact(prev => ({ ...prev, [field]: items }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = editedContact.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        setEditedContact(prev => ({
          ...prev,
          tags: [...currentTags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedContact(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: contact.id,
      data: editedContact
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
      formData.append('folder', 'ftp-contacts');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;
      setProfileImage(imageUrl);
      setEditedContact(prev => ({ ...prev, profile_picture: imageUrl }));
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsEditing(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Slide Panel */}
      <div className={`fixed top-0 right-0 z-50 h-full w-full md:w-1/2 bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
      }`}>
        {/* Decorative purple splash in corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-50/20 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 px-6 py-5 shadow-lg z-10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Contact' : 'Contact Details'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => toggleFavorite(contact.id)}
                  className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`w-5 h-5 transition-all ${
                      isFavorite ? 'fill-amber-300 text-amber-300 drop-shadow-glow' : 'text-white/70 hover:text-white'
                    }`}
                  />
                </button>
              )}
              {isAuthenticated && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-semibold"
                  aria-label="Edit contact"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isLoading}
                    className="px-4 py-2 bg-white text-purple-600 hover:bg-white/90 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {updateMutation.isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContact(contact);
                      setProfileImage(contact.profile_picture || null);
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {contact.is_ert && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              <Shield className="w-3 h-3" />
              Emergency Response Team
            </div>
          )}
        </div>

        {/* Content - Scrollable with Two Column Layout */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile and Main Info (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-6 bg-gradient-to-br from-purple-50 via-white to-violet-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                <div className="relative flex-shrink-0">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-400 via-violet-400 to-fuchsia-400 p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt={editedContact.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                          <User className="w-24 h-24 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedContact.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-2xl font-bold text-gray-900 border-b-2 border-purple-300 focus:border-purple-600 outline-none bg-transparent w-full py-2"
                      placeholder="Contact Name"
                    />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-900">{contact.name}</h3>
                  )}
                  {!isEditing && contact.designation && (
                    <p className="text-purple-600 font-semibold mt-1">{contact.designation}</p>
                  )}
                  {!isEditing && contact.department && (
                    <p className="text-gray-500 text-sm mt-1">📍 {contact.department}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-900 border-b-2 border-purple-200 pb-2">Professional Details</h3>
              <InputField
                icon={Briefcase}
                label="Designation"
                value={editedContact.designation}
                onChange={(val) => handleInputChange('designation', val)}
                placeholder="e.g. Senior Manager"
                isEditing={isEditing}
              />
              <InputField
                icon={Building2}
                label="Department"
                value={editedContact.department}
                onChange={(val) => handleInputChange('department', val)}
                placeholder="e.g. Sales"
                isEditing={isEditing}
              />
              <InputField
                icon={Building2}
                label="Company"
                value={editedContact.company}
                onChange={(val) => handleInputChange('company', val)}
                placeholder="e.g. Fairmont The Palm"
                isEditing={isEditing}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-900 border-b-2 border-purple-200 pb-2">Contact Information</h3>
              <InputField
                icon={Mail}
                label="Email"
                type="email"
                value={editedContact.email}
                onChange={(val) => handleInputChange('email', val)}
                placeholder="email@example.com"
                isEditing={isEditing}
              />
              <InputField
                icon={Phone}
                label="Mobile"
                type="tel"
                value={editedContact.mobile}
                onChange={(val) => handleInputChange('mobile', val)}
                placeholder="+971 50 123 4567"
                isEditing={isEditing}
              />
              <InputField
                icon={Phone}
                label="Landline"
                type="tel"
                value={editedContact.landline}
                onChange={(val) => handleInputChange('landline', val)}
                placeholder="+971 4 457 3388"
                isEditing={isEditing}
              />
              <InputField
                icon={Phone}
                label="Extension"
                value={editedContact.extension}
                onChange={(val) => handleInputChange('extension', val)}
                placeholder="3301"
                isEditing={isEditing}
              />
              <InputField
                icon={Globe}
                label="Website"
                type="url"
                value={editedContact.website}
                onChange={(val) => handleInputChange('website', val)}
                placeholder="https://example.com"
                isEditing={isEditing}
              />
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-900 border-b-2 border-purple-200 pb-2">Languages</h3>
              <div className="space-y-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedContact.languages?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('languages', e.target.value)}
                    placeholder="English, Arabic, French (comma separated)"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-900"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedContact.languages && editedContact.languages.length > 0 ? (
                      editedContact.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200 text-purple-700 rounded-full text-sm font-bold"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 px-4 py-3 bg-purple-50/50 rounded-lg">No languages specified</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

            {/* Right Column - Tags & Comments (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tags Section */}
              <div className="bg-white rounded-2xl p-5 border-2 border-purple-200 shadow-lg h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Tags</h3>
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type a tag and press Enter..."
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm text-gray-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      {editedContact.tags && editedContact.tags.length > 0 ? (
                        editedContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                              aria-label={`Remove ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No tags yet. Press Enter to add.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedContact.tags && editedContact.tags.length > 0 ? (
                      editedContact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No tags</p>
                    )}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-2xl p-5 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Comments</h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedContact.comments || ''}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                    placeholder="Additional notes or comments..."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm text-gray-900 resize-none"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100 min-h-[150px]">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {editedContact.comments || <span className="text-gray-400 italic">No comments</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactDetailModal;
