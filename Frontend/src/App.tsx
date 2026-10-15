import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { router } from './routes';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/Dialog';
import { Button } from './components/ui/Button';
import { useErrorStore } from './store/useStore';

// Global window.alert override to show custom React popup instead of native browser dialog
if (typeof window !== 'undefined') {
  window.alert = (message: any) => {
    let msg = '';
    if (message && typeof message === 'object') {
      if (message.message) {
        msg = message.message;
      } else {
        try {
          msg = JSON.stringify(message);
        } catch (e) {
          msg = String(message);
        }
      }
    } else {
      msg = String(message);
    }

    // Extract human-readable message if it's formatted as a JSON string
    if (typeof msg === 'string' && msg.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) {
          msg = parsed.message;
        } else if (parsed.error) {
          if (typeof parsed.error === 'object') {
            msg = parsed.error.message || msg;
          } else if (typeof parsed.error === 'string') {
            msg = parsed.error;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Simplify database/Prisma unique constraint error traces to a clean human-readable sentence
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase();
      if (
        lower.includes('unique constraint failed') || 
        lower.includes('owners_email_key') || 
        lower.includes('users_email_key') || 
        lower.includes('tenants_email_key') || 
        lower.includes('vendors_email_key')
      ) {
        if (lower.includes('email')) {
          msg = 'Email address is already registered.';
        } else if (lower.includes('code_key') || lower.includes('code')) {
          msg = 'Company code is already taken.';
        } else {
          msg = 'A record with duplicate unique fields already exists.';
        }
      } else if (lower.includes('prisma') || lower.includes('database_js_1') || lower.includes('invocation in')) {
        msg = 'An error occurred while saving to the database. Please check for unique fields like email.';
      }
    }

    let title = 'Notification';
    const lowerMsg = msg.toLowerCase();
    if (
      lowerMsg.includes('fail') || 
      lowerMsg.includes('error') || 
      lowerMsg.includes('invalid') || 
      lowerMsg.includes('wrong') || 
      lowerMsg.includes('required') || 
      lowerMsg.includes('already registered') ||
      lowerMsg.includes('exist')
    ) {
      title = 'Error Alert';
    }

    useErrorStore.getState().showError(title, msg);
  };
}

// Create a client with centralized error handlers
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      console.error(`Query failed: ${error.message}`);
    }
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // Global alert fallback (will trigger overridden window.alert)
      alert(error.message || 'Operation failed');
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ErrorModal() {
  const { isOpen, title, message, closeError } = useErrorStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeError(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-lg font-bold flex items-center gap-2 ${title === 'Error Alert' ? 'text-rose-500' : 'text-primary'}`}>
            {title === 'Error Alert' ? '⚠️' : 'ℹ️'} {title || 'Alert'}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/80 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end">
          <Button onClick={closeError} className="bg-primary text-primary-foreground font-semibold px-6">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ErrorModal />
    </QueryClientProvider>
  );
}

export default App;
