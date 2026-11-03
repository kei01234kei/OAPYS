"use client";

import { useEffect, type RefObject } from "react";

export function useModal(ref: RefObject<HTMLElement | null>, open = true) {
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, [open, ref]);
}
