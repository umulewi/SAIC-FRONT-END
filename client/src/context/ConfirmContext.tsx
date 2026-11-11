import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../components/ui/Button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Defaults to true — styles the confirm button as destructive (red). */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setState({ danger: true, ...options, open: true });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handle = (result: boolean) => {
    setState((s) => (s ? { ...s, open: false } : s));
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state?.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 px-4 backdrop-blur-[2px]"
            onClick={() => handle(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    state.danger ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <button
                  onClick={() => handle(false)}
                  className="cursor-pointer text-ink-400 transition-colors hover:text-ink-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 id="confirm-dialog-title" className="mt-4 text-lg font-bold text-ink-950">
                {state.title}
              </h2>
              {state.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{state.description}</p>
              )}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="outline" className="cursor-pointer" onClick={() => handle(false)}>
                  {state.cancelLabel ?? "Cancel"}
                </Button>
                <button
                  onClick={() => handle(true)}
                  className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors ${
                    state.danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
                  }`}
                >
                  {state.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
