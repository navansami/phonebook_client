import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_NEW = import.meta.env.VITE_EMAILJS_TEMPLATE_NEW;
const TEMPLATE_EDIT = import.meta.env.VITE_EMAILJS_TEMPLATE_EDIT;

// Initialize EmailJS
if (EMAILJS_USER_ID) {
  emailjs.init(EMAILJS_USER_ID);
}

/**
 * Send new contact notification email via EmailJS
 * @param {Object} contactData - Contact information to include in email
 * @returns {Promise} EmailJS response promise
 */
export const sendNewContactEmail = async (contactData) => {
  try {
    const templateParams = {
      contact_name: contactData.name || '',
      contact_organization: contactData.organization || '',
      contact_phone: contactData.phone || '',
      contact_email: contactData.email || '',
      contact_address: contactData.address || '',
      contact_languages: Array.isArray(contactData.languages)
        ? contactData.languages.join(', ')
        : contactData.languages || '',
      contact_tags: Array.isArray(contactData.tags)
        ? contactData.tags.join(', ')
        : contactData.tags || '',
      contact_notes: contactData.notes || '',
      contact_isErt: contactData.isErt ? 'Yes' : 'No',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_NEW,
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Error sending new contact email:', error);
    throw error;
  }
};

/**
 * Send edit suggestion email via EmailJS
 * @param {Object} contactData - Contact information and suggested changes
 * @returns {Promise} EmailJS response promise
 */
export const sendEditSuggestion = async (contactData) => {
  try {
    const templateParams = {
      contact_name: contactData.name || '',
      contact_organization: contactData.organization || '',
      contact_phone: contactData.phone || '',
      contact_email: contactData.email || '',
      contact_address: contactData.address || '',
      contact_languages: Array.isArray(contactData.languages)
        ? contactData.languages.join(', ')
        : contactData.languages || '',
      contact_tags: Array.isArray(contactData.tags)
        ? contactData.tags.join(', ')
        : contactData.tags || '',
      contact_notes: contactData.notes || '',
      contact_isErt: contactData.isErt ? 'Yes' : 'No',
      suggested_changes: contactData.suggestedChanges || '',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_EDIT,
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Error sending edit suggestion email:', error);
    throw error;
  }
};
