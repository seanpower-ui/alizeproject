"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { MaterialSymbolsProvider, AlizeDevToolsProvider } from "@jllt/alize-ui";

const CREATED_WORK_ORDERS_KEY = "alize-created-work-orders";

export function Providers({ children }: { children: React.ReactNode }) {
  // On full page load (refresh or first visit), clear session-created work orders
  // so only the original 2 remain in tile/table and detail pages.
  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(CREATED_WORK_ORDERS_KEY);
    }
  }, []);

  return (
    <>
      <MaterialSymbolsProvider />
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        value={{ light: "theme-light", dark: "theme-dark" }}
      >
        {/* 
          Alizé DevTools - Component Inspector
          Activation: npm run dev:devtools OR add ?alize-devtools=true to URL
          Toggle: Ctrl+Shift+A (Cmd+Shift+A on Mac)
        */}
        <AlizeDevToolsProvider>
        {children}
        </AlizeDevToolsProvider>
      </ThemeProvider>
    </>
  );
}
