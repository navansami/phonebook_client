import { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MessageSquare,
  Star,
  Tag,
  Shield,
  Edit2,
  Save,
  Globe,
  User,
  MapPin,
} from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact } from '../services/contactsApi';
import toast from 'react-hot-toast';
import axios from 'axios';

const InputField = ({ icon: Icon, label, value, onChange, type = 'text', placeholder, isEditing }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-[#69d6ff]">
      <Icon className="h-4 w-4" />
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-[#29556e] dark:bg-[#17212c] dark:text-gray-100 dark:focus:border-[#23b7f2] dark:focus:ring-[#23b7f2]/20"
      />
    ) : (
      <div className="rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3 dark:border-[#29556e] dark:bg-[#102431]">
        <p className="break-words font-medium text-gray-900 dark:text-gray-100">{value || '-'}</p>
      </div>
    )}
  </div>
);

const SectionCard = ({ title, description, children, icon: Icon }) => (
  <section className="rounded-2xl border border-purple-200/80 bg-white/90 p-5 shadow-sm shadow-purple-100/40 dark:border-[#24465c] dark:bg-[#141b23] dark:shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
    <div className="mb-4 flex items-start gap-3 border-b border-purple-100 pb-3 dark:border-[#223242]">
      {Icon && (
        <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-[#102431]">
          <Icon className="h-5 w-5 text-purple-600 dark:text-[#69d6ff]" />
        </div>
      )}
      <div>
        <h3 className="text-base font-bold text-purple-900 dark:text-white">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
    </div>
    {children}
  </section>
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
  const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

  useEffect(() => {
    if (isOpen && contact) {
      setEditedContact(contact);
      setProfileImage(contact.profile_picture || null);
    }
  }, [isOpen, contact?.id]);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateContact(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact updated successfully!');
      setIsEditing(false);

      if (response?.data) {
        setEditedContact(response.data);
        setProfileImage(response.data.profile_picture || null);
      } else {
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
    setEditedContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map((item) => item.trim()).filter((item) => item);
    setEditedContact((prev) => ({ ...prev, [field]: items }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = editedContact.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        setEditedContact((prev) => ({
          ...prev,
          tags: [...currentTags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedContact((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: contact.id,
      data: editedContact,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

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
      setEditedContact((prev) => ({ ...prev, profile_picture: imageUrl }));
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

  const resetEditing = () => {
    setIsEditing(false);
    setEditedContact(contact);
    setProfileImage(contact.profile_picture || null);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleBackdropClick}
      />

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full translate-x-0 flex-col bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-[#0f141b] md:w-[52rem] ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-purple-50/30 blur-3xl dark:bg-[#0d2c3b]/30" />
        <div className="absolute bottom-0 left-0 -z-10 h-48 w-48 rounded-full bg-violet-50/20 blur-3xl dark:bg-[#0d2230]/30" />

        <div className="sticky top-0 z-10 flex-shrink-0 border-b bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 px-6 py-5 shadow-lg dark:border-[#24465c] dark:from-[#131b23] dark:via-[#18222d] dark:to-[#131b23]">
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-white" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">User Directory</p>
                  <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Contact' : 'Contact Details'}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => toggleFavorite(contact.id)}
                    className="rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`h-5 w-5 transition-all ${
                        isFavorite ? 'fill-amber-300 text-amber-300' : 'text-white/70 hover:text-white'
                      }`}
                    />
                  </button>
                )}
                {!isEditing && isAuthenticated && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30"
                    aria-label="Edit contact"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isLoading}
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-purple-600 transition-all duration-200 hover:bg-white/90 disabled:opacity-50 dark:text-[#0f6f9a]"
                    >
                      <Save className="h-4 w-4" />
                      {updateMutation.isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={resetEditing}
                      className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {contact.is_ert && (
                <div className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  <Shield className="h-3 w-3" />
                  Emergency Response Team
                </div>
              )}
              {contact.extension && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                  <Phone className="h-3 w-3" />
                  Ext. {contact.extension}
                </div>
              )}
              {contact.department && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                  <MapPin className="h-3 w-3" />
                  {contact.department}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50 via-white to-violet-50 p-4 shadow-lg shadow-purple-100/50 dark:border-[#24465c] dark:bg-[linear-gradient(135deg,rgba(22,30,39,0.98),rgba(15,20,27,0.98))] dark:shadow-[0_22px_40px_rgba(2,6,23,0.35)] sm:p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="h-32 w-32 rounded-[1.7rem] bg-gradient-to-br from-purple-400 via-violet-400 to-fuchsia-400 p-1 shadow-xl dark:from-[#23b7f2] dark:via-[#1598df] dark:to-[#0d6fb0] sm:h-44 sm:w-44">
                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.45rem] bg-white dark:bg-[#0e141b]">
                        {profileImage ? (
                          <img src={profileImage} alt={editedContact.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-violet-100 dark:from-[#163243] dark:to-[#1a2230]">
                            <User className="h-16 w-16 text-purple-400 dark:text-[#7eddff] sm:h-24 sm:w-24" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex-1 text-center sm:text-left">
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editedContact.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full border-b-2 border-purple-300 bg-transparent py-2 text-xl font-bold text-gray-900 outline-none focus:border-purple-600 dark:border-[#29556e] dark:text-white dark:focus:border-[#23b7f2] sm:text-2xl"
                          placeholder="Contact Name"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-colors hover:bg-purple-50 dark:border-[#29556e] dark:bg-[#13222d] dark:text-[#7eddff] dark:hover:bg-[#183040]">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
                        </label>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                          {contact.name}
                        </h3>
                        <p className="mt-3 text-base font-semibold text-purple-600 dark:text-slate-200 sm:text-lg">
                          {contact.designation || 'No designation assigned'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {contact.company || 'No company listed'}
                        </p>
                      </>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      {contact.department && (
                        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm dark:border-[#29556e] dark:bg-[#13222d] dark:text-slate-200">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-500 dark:text-[#69d6ff]" />
                          <span className="truncate">{contact.department}</span>
                        </span>
                      )}
                      {contact.email && (
                        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm dark:border-[#29556e] dark:bg-[#13222d] dark:text-slate-200 sm:max-w-[24rem]">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-purple-500 dark:text-[#69d6ff]" />
                          <span className="truncate">{contact.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <SectionCard title="Professional Details" description="Role, department, and company information." icon={Briefcase}>
                  <div className="space-y-4">
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
                </SectionCard>

                <SectionCard title="Contact Channels" description="Primary ways to reach this contact." icon={Phone}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <InputField
                        icon={Mail}
                        label="Email"
                        type="email"
                        value={editedContact.email}
                        onChange={(val) => handleInputChange('email', val)}
                        placeholder="email@example.com"
                        isEditing={isEditing}
                      />
                    </div>
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
                    <div className="md:col-span-2">
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
                  </div>
                </SectionCard>

                <SectionCard title="Languages" description="Spoken or supported languages." icon={Globe}>
                  <div className="space-y-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedContact.languages?.join(', ') || ''}
                        onChange={(e) => handleArrayChange('languages', e.target.value)}
                        placeholder="English, Arabic, French"
                        className="w-full rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-[#29556e] dark:bg-[#17212c] dark:text-gray-100 dark:focus:border-[#23b7f2] dark:focus:ring-[#23b7f2]/20"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {editedContact.languages && editedContact.languages.length > 0 ? (
                          editedContact.languages.map((lang, index) => (
                            <span
                              key={index}
                              className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-violet-100 px-3 py-1.5 text-sm font-bold text-purple-700 dark:border-[#29556e] dark:bg-[linear-gradient(90deg,rgba(16,36,49,0.95),rgba(15,30,42,0.95))] dark:text-[#7eddff]"
                            >
                              {lang}
                            </span>
                          ))
                        ) : (
                          <p className="rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3 text-slate-500 dark:border-[#29556e] dark:bg-[#102431] dark:text-slate-400">
                            No languages specified
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <SectionCard title="Tags" description="Keywords used to group and filter contacts." icon={Tag}>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type a tag and press Enter..."
                      className="w-full rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-[#29556e] dark:bg-[#17212c] dark:text-gray-100 dark:focus:border-[#23b7f2] dark:focus:ring-[#23b7f2]/20"
                    />
                    <div className="flex flex-wrap gap-2">
                      {editedContact.tags && editedContact.tags.length > 0 ? (
                        editedContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200 dark:border-[#29556e] dark:bg-[#1d2b37] dark:text-slate-100 dark:hover:bg-[#253645]"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="rounded-full p-0.5 transition-colors hover:bg-purple-300 dark:hover:bg-[#34485c]"
                              aria-label={`Remove ${tag}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm italic text-gray-400">No tags yet. Press Enter to add.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editedContact.tags && editedContact.tags.length > 0 ? (
                      editedContact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-[#334252] dark:bg-[#253240] dark:text-slate-100 dark:hover:bg-[#314252]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-400">No tags</p>
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Comments" description="Operational notes and additional context." icon={MessageSquare}>
                {isEditing ? (
                  <textarea
                    value={editedContact.comments || ''}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                    placeholder="Additional notes or comments..."
                    rows={8}
                    className="w-full resize-none rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-[#29556e] dark:bg-[#17212c] dark:text-gray-100 dark:focus:border-[#23b7f2] dark:focus:ring-[#23b7f2]/20"
                  />
                ) : (
                  <div className="min-h-[180px] rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:border-[#29556e] dark:bg-[linear-gradient(135deg,rgba(31,44,57,0.95),rgba(42,54,71,0.95))]">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-100">
                      {editedContact.comments || <span className="italic text-gray-400">No comments</span>}
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactDetailModal;
