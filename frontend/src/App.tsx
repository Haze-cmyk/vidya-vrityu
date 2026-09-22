import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster, toast } from 'sonner';

export const App: React.FC = () => {
  useEffect(() => {
    // When a user clicks anywhere on an active toast notification, immediately dismiss it
    const handleToastClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const toastItem = target?.closest('[data-sonner-toast]') as HTMLElement | null;
      if (toastItem) {
        // Allow links and custom action buttons (other than close button) to handle their own clicks
        if (target?.tagName === 'A') return;
        if (target?.tagName === 'BUTTON' && !target.closest('[data-close-button]')) return;

        const closeBtn = toastItem.querySelector<HTMLButtonElement>('[data-close-button]');
        if (closeBtn) {
          closeBtn.click();
        } else {
          toast.dismiss();
        }
      }
    };

    document.addEventListener('click', handleToastClick, true);
    return () => document.removeEventListener('click', handleToastClick, true);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          toastOptions={{
            className: 'cursor-pointer select-none transition-all hover:opacity-90 active:scale-[0.98]',
            style: { cursor: 'pointer' }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
