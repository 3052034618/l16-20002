import { X } from 'lucide-react';
import { cn } from '@/utils';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-white dark:bg-ink-800 rounded-2xl shadow-2xl border border-ink-200 dark:border-ink-700 animate-slide-up',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-ink-200 dark:border-ink-700">
          <h2 className="text-xl font-display font-semibold text-ink-800 dark:text-ink-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
