import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  maxWidth = '650px'
}) => {
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';
  const resolvedSubmitLabel = submitLabel || (isKhmer ? 'រក្សាទុកការកែប្រែ' : 'Save Changes');
  const resolvedCancelLabel = cancelLabel || (isKhmer ? 'បោះបង់' : 'Cancel');
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
            {title}
          </h4>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="admin-modal-form">
          <div className="admin-modal-body">
            {children}
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {resolvedCancelLabel}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...') : resolvedSubmitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
