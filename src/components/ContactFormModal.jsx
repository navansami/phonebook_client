import { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactFormModal = ({ isOpen, onClose, contact, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    email: '',
    mobile: '',
    landline: '',
    comments: ''
  });
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [languageInput, setLanguageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        designation: contact.designation || '',
        department: contact.department || '',
        email: contact.email || '',
        mobile: contact.mobile || '',
        landline: contact.landline || '',
        comments: contact.comments || ''
      });
      setLanguages(contact.languages || []);
      setTags(contact.tags || []);
    } else {
      setFormData({
        name: '',
        designation: '',
        department: '',
        email: '',
        mobile: '',
        landline: '',
        comments: ''
      });
      setLanguages([]);
      setTags([]);
    }
    setLanguageInput('');
    setTagInput('');
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddLanguage = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedLanguage = languageInput.trim();
      if (trimmedLanguage && !languages.includes(trimmedLanguage)) {
        setLanguages([...languages, trimmedLanguage]);
        setLanguageInput('');
      }
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setLanguages(languages.filter(lang => lang !== languageToRemove));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
        languages: languages,
        tags: tags
      };

      await onSubmit(submitData);
      toast.success(contact ? 'Contact updated successfully' : 'Contact added successfully');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {contact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-5">
            {/* Info Banner */}
            <div className="bg-indigo-50 border-l-4 border-indigo-600 rounded-lg p-4">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">Note:</span> Please note the below contact will be added to the global phone book.
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errors.name}
              </p>}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Designation */}
              <div>
                <label htmlFor="designation" className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Manager"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Sales"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@fairmont.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errors.email}
              </p>}
            </div>

            {/* Two Column Layout for Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+971 50 123 4567"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.mobile ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isLoading}
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> {errors.mobile}
                </p>}
              </div>

              {/* Landline */}
              <div>
                <label htmlFor="landline" className="block text-sm font-semibold text-gray-700 mb-2">
                  Landline
                </label>
                <input
                  type="tel"
                  id="landline"
                  name="landline"
                  value={formData.landline}
                  onChange={handleChange}
                  placeholder="+971 4 123 4567"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.landline ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isLoading}
                />
                {errors.landline && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> {errors.landline}
                </p>}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label htmlFor="languages" className="block text-sm font-semibold text-gray-700 mb-2">
                Languages
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={handleAddLanguage}
                placeholder="Type a language and press Enter"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
              <p className="text-gray-500 text-xs mt-1.5">Press Enter to add each language</p>

              {/* Language Chips */}
              {languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(language)}
                        className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
              <p className="text-gray-500 text-xs mt-1.5">Press Enter to add each tag</p>

              {/* Tag Chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional information..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Adding...' : (contact ? 'Update Contact' : 'Add Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
