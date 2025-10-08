import { useState, useEffect } from 'react';
import { X, Loader2, User, Upload, ImageIcon, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCropModal from './ImageCropModal';

const AdminContactFormModal = ({ isOpen, onClose, contact, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    company: '',
    extension: '',
    email: '',
    mobile: '',
    landline: '',
    website: '',
    languages: '',
    tags: '',
    comments: '',
    expose: true,
    is_ert: false,
    is_ifa: false,
    is_third_party: false,
    profile_picture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        designation: contact.designation || '',
        department: contact.department || '',
        company: contact.company || '',
        extension: contact.extension || '',
        email: contact.email || '',
        mobile: contact.mobile || '',
        landline: contact.landline || '',
        website: contact.website || '',
        languages: contact.languages ? contact.languages.join(', ') : '',
        tags: contact.tags ? contact.tags.join(', ') : '',
        comments: contact.comments || '',
        expose: contact.expose !== undefined ? contact.expose : true,
        is_ert: contact.is_ert || false,
        is_ifa: contact.is_ifa || false,
        is_third_party: contact.is_third_party || false,
        profile_picture: contact.profile_picture || ''
      });
    } else {
      setFormData({
        name: '',
        designation: '',
        department: '',
        company: '',
        extension: '',
        email: '',
        mobile: '',
        landline: '',
        website: '',
        languages: '',
        tags: '',
        comments: '',
        expose: true,
        is_ert: false,
        is_ifa: false,
        is_third_party: false,
        profile_picture: ''
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.mobile && !/^[\d\s\-+()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number format';
    }

    if (formData.landline && !/^[\d\s\-+()]+$/.test(formData.landline)) {
      newErrors.landline = 'Invalid landline number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCropComplete = (croppedImage) => {
    setFormData(prev => ({ ...prev, profile_picture: croppedImage }));
    toast.success('Profile picture added successfully');
  };

  const handleRemoveProfilePicture = () => {
    setFormData(prev => ({ ...prev, profile_picture: '' }));
    toast.success('Profile picture removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        languages: formData.languages
          ? formData.languages.split(',').map(lang => lang.trim()).filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : []
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
            <h2 className="text-2xl font-bold">
              {contact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                <div className="relative">
                  {formData.profile_picture ? (
                    <div className="relative group">
                      <img
                        src={formData.profile_picture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove picture"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-indigo-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-sm"
                >
                  {formData.profile_picture ? (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Change Picture
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Picture
                    </>
                  )}
                </button>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    placeholder="Manager"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    placeholder="Sales"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    placeholder="Fairmont The Palm"
                  />
                </div>

                <div>
                  <label htmlFor="extension" className="block text-sm font-medium text-gray-700 mb-1">
                    Extension
                  </label>
                  <input
                    type="text"
                    id="extension"
                    name="extension"
                    value={formData.extension}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    placeholder="3301"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    placeholder="+971 50 123 4567"
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label htmlFor="landline" className="block text-sm font-medium text-gray-700 mb-1">
                    Landline
                  </label>
                  <input
                    type="tel"
                    id="landline"
                    name="landline"
                    value={formData.landline}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.landline ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    placeholder="+971 4 123 4567"
                  />
                  {errors.landline && <p className="text-red-500 text-sm mt-1">{errors.landline}</p>}
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
                    Languages
                  </label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="English, Arabic, Hindi"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <p className="text-gray-500 text-xs mt-1">Separate with commas</p>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="VIP, Management, IT"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <p className="text-gray-500 text-xs mt-1">Separate with commas</p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  disabled={isLoading}
                  placeholder="Additional notes or information..."
                />
              </div>

              {/* Status Toggles */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Status & Permissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="expose"
                      checked={formData.expose}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <span className="font-medium text-gray-700">Publicly Visible</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="is_ert"
                      checked={formData.is_ert}
                      onChange={handleChange}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                      disabled={isLoading}
                    />
                    <span className="font-medium text-gray-700">Emergency Response Team</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="is_ifa"
                      checked={formData.is_ifa}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="font-medium text-gray-700">IFA Contact</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="is_third_party"
                      checked={formData.is_third_party}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <span className="font-medium text-gray-700">Third Party</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Saving...' : (contact ? 'Update Contact' : 'Create Contact')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        initialImage={formData.profile_picture}
      />
    </>
  );
};

export default AdminContactFormModal;
