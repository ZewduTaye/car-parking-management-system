import { X } from "lucide-react";
import "./Modal.css";

function Modal({
  isOpen,
  title,
  subtitle,
  children,
  onClose,
  footer,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="modal-container"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ==================================================
            MODAL HEADER
        ================================================== */}
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">
              {title}
            </h2>

            {subtitle && (
              <p className="modal-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* ==================================================
            MODAL BODY
        ================================================== */}
        <div className="modal-body">
          {children}
        </div>

        {/* ==================================================
            OPTIONAL FOOTER
        ================================================== */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;