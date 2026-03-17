import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm,
  loading = false,
  maxWidth = 'max-w-md'
}) => {
  const icons = {
    info: <InformationCircleIcon className="w-6 h-6 text-primary-400" />,
    success: <CheckCircleIcon className="w-6 h-6 text-emerald-400" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />,
    danger: <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
  };

  const confirmColors = {
    info: 'bg-primary-500 hover:bg-primary-600',
    success: 'bg-emerald-500 hover:bg-emerald-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    danger: 'bg-red-500 hover:bg-red-600'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} glass-dark border border-white/10 overflow-hidden shadow-2xl`}
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-none bg-white/5 border border-white/5`}>
                    {icons[type]}
                  </div>
                  <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase">
                    {title}
                  </h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 text-slate-500 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                {children}
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-white/5 pt-8">
                <button
                  onClick={onClose}
                  className="btn-ghost"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`btn-primary ${confirmColors[type]} disabled:opacity-50 min-w-[120px]`}
                  >
                    {loading ? 'PROCESSING...' : confirmText.toUpperCase()}
                  </button>
                )}
              </div>
            </div>

            {/* Corner Decor */}
            <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-20">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white" />
              <div className="absolute bottom-0 right-0 w-[1px] h-full bg-white" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
