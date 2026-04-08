import { useEffect } from 'react';
import { X, Search } from 'lucide-react';

const QuickTipModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Search Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-400/30 backdrop-blur-sm flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-300/40 backdrop-blur-sm flex items-center justify-center">
                <Search className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-6">
            Quick Tip!
          </h2>

          {/* Message */}
          <p className="text-xl text-white/95 font-medium mb-8 leading-relaxed">
            Press the <span className="font-bold">TAB</span> key anytime to quickly<br />
            search for contacts
          </p>

          {/* Visual Demonstration */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* TAB Key */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-lg">
              <span className="text-3xl font-bold text-purple-600">TAB</span>
            </div>

            {/* Arrow */}
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* Search Box */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border-2 border-purple-400/50 flex items-center gap-3 min-w-[160px]">
              <Search className="w-5 h-5 text-white/70" />
              <span className="text-white/70 font-medium">Search...</span>
            </div>
          </div>

          {/* Footer instruction */}
          <p className="text-white/80 text-sm font-medium">
            Click anywhere or press <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs mx-1">ESC</span> to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickTipModal;
