"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right" duration={3000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="bg-[#1a1a1a] border-[#d4af37]/25 text-white shadow-2xl shadow-black/50 shadow-[#d4af37]/5"
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-sm font-semibold text-[#d4af37] font-[family-name:var(--font-inter)]">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-xs text-white/60 font-[family-name:var(--font-inter)]">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/30 hover:text-white/60" />
          </Toast>
        );
      })}
      <ToastViewport className="sm:bottom-20 sm:top-auto" />
    </ToastProvider>
  );
}
