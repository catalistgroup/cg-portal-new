import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { CircleX, CircleCheck, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

// --------------------------------
// Types
// --------------------------------
type ToastType = 'success' | 'error' | 'description';

type ToastButton = {
  title: string;
  btnStyles?: string;
  onPress: () => void;
};

interface ToastProps {
  message: string;
  title: string;
  type?: ToastType;
  buttons?: ToastButton[];
}

interface ToastData extends ToastProps {
  id: string;
  open: boolean;
}

// --------------------------------
// Styles
// --------------------------------
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-lg p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        success: 'bg-[#16a34a] text-white',
        error: 'bg-[#f87171] text-white',
        description: 'bg-white text-[#155EEF]',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  }
);

// --------------------------------
// State Management
// --------------------------------
let toastId = 0;
const TOAST_REMOVE_DELAY = 5000;

class ToastManager {
  private static instance: ToastManager;
  private toasts: ToastData[] = [];
  private listeners: Set<(toasts: ToastData[]) => void> = new Set();

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  subscribe(callback: (toasts: ToastData[]) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  show({ message, title, type = 'success', buttons }: ToastProps) {
    const id = String(++toastId);
    const toast: ToastData = {
      id,
      message,
      title,
      type,
      open: true,
      buttons,
    };

    this.toasts = [toast, ...this.toasts];
    this.notify();

    // Only auto-dismiss success toasts
    if (type === 'success') {
      setTimeout(() => this.dismiss(id), TOAST_REMOVE_DELAY);
    }
  }

  dismiss(id: string) {
    this.toasts = this.toasts.map((t) =>
      t.id === id ? { ...t, open: false } : t
    );
    this.notify();

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.notify();
    }, 300);
  }
}

// --------------------------------
// Hooks
// --------------------------------
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  return {
    toasts,
    successToast: (title: string, description: string = '') =>
      ToastManager.getInstance().show({
        title,
        message: description,
        type: 'success',
      }),
    errorToast: (
      title: string,
      description: string = '',
      buttons?: ToastButton[]
    ) =>
      ToastManager.getInstance().show({
        title,
        message: description,
        type: 'error',
        buttons,
      }),
    standardToast: (title: string, description: string) =>
      ToastManager.getInstance().show({
        title,
        message: description,
        type: 'description',
      }),
  };
}

// --------------------------------
// Toast Variant Components
// --------------------------------
const SuccessToast = ({ id, title, message, open }: ToastData) => (
  <ToastPrimitives.Root
    key={id}
    open={open}
    duration={TOAST_REMOVE_DELAY}
    onOpenChange={(open) => {
      if (!open) ToastManager.getInstance().dismiss(id);
    }}
    className={cn(toastVariants({ variant: 'success' }))}
  >
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <CircleCheck className="h-5 w-5" />
        </div>
        <ToastPrimitives.Title className="text-sm font-semibold flex-1">
          {title}
        </ToastPrimitives.Title>
        <ToastPrimitives.Close className="p-1 focus:outline-none flex-shrink-0">
          <CircleX className="h-5 w-5" />
        </ToastPrimitives.Close>
      </div>
      {message && (
        <ToastPrimitives.Description className="text-sm opacity-90 pl-8">
          {message}
        </ToastPrimitives.Description>
      )}
    </div>
  </ToastPrimitives.Root>
);

const ErrorToast = ({ id, title, message, open, buttons }: ToastData) => (
  <ToastPrimitives.Root
    key={id}
    open={open}
    duration={Infinity}
    onOpenChange={(open) => {
      if (!open) ToastManager.getInstance().dismiss(id);
    }}
    className={cn(toastVariants({ variant: 'error' }))}
  >
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <ToastPrimitives.Title className="text-sm font-semibold flex-1">
          {title}
        </ToastPrimitives.Title>
        <ToastPrimitives.Close className="p-1 focus:outline-none flex-shrink-0">
          <CircleX className="h-5 w-5" />
        </ToastPrimitives.Close>
      </div>
      {message && (
        <ToastPrimitives.Description className="text-sm opacity-90 pl-8">
          {message}
        </ToastPrimitives.Description>
      )}
      {buttons && buttons.length > 0 && (
        <div className="flex gap-2 mt-2 pl-8">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className={
                btn.btnStyles ||
                'px-3 py-1 rounded bg-white text-[#FF5E5E] border border-[#FF5E5E] hover:bg-[#FF5E5E] hover:text-white transition'
              }
              onClick={btn.onPress}
              type="button"
            >
              {btn.title}
            </button>
          ))}
        </div>
      )}
    </div>
  </ToastPrimitives.Root>
);

const DescriptionToast = ({ id, title, message, open }: ToastData) => (
  <ToastPrimitives.Root
    key={id}
    open={open}
    duration={TOAST_REMOVE_DELAY}
    onOpenChange={(open) => {
      if (!open) ToastManager.getInstance().dismiss(id);
    }}
    className={cn(toastVariants({ variant: 'description' }))}
  >
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <CircleCheck className="h-5 w-5" />
        </div>
        <ToastPrimitives.Title className="text-sm font-semibold flex-1">
          {title}
        </ToastPrimitives.Title>
        <ToastPrimitives.Close className="p-1 focus:outline-none flex-shrink-0">
          <CircleX className="h-5 w-5" />
        </ToastPrimitives.Close>
      </div>
      {message && (
        <ToastPrimitives.Description className="text-sm text-[#525252] opacity-90 pl-8">
          {message}
        </ToastPrimitives.Description>
      )}
    </div>
  </ToastPrimitives.Root>
);

// --------------------------------
// Components
// --------------------------------
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {toasts.map((toast) => {
        switch (toast.type) {
          case 'success':
            return <SuccessToast key={toast.id} {...toast} />;
          case 'error':
            return <ErrorToast key={toast.id} {...toast} />;
          case 'description':
            return <DescriptionToast key={toast.id} {...toast} />;
          default:
            return <SuccessToast key={toast.id} {...toast} />;
        }
      })}
      <ToastPrimitives.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:right-0 sm:top-0 sm:flex-col md:max-w-[420px]" />
    </ToastPrimitives.Provider>
  );
}

/**
 * Dismisses the most recent (top) toast, if any.
 */
export function dismissCurrentToast() {
  const manager = ToastManager.getInstance();
  // Dismiss the first toast in the array (the most recent one)
  if (manager['toasts'].length > 0) {
    const topToast = manager['toasts'][0];
    manager.dismiss(topToast.id);
  }
}
