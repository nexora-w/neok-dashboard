"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RefreshContextType {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  onRefresh: (() => void) | null;
  setOnRefresh: (callback: (() => void) | null) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshing, setRefreshing] = useState(false);
  const [onRefresh, setOnRefresh] = useState<(() => void) | null>(null);

  return (
    <RefreshContext.Provider value={{ refreshing, setRefreshing, onRefresh, setOnRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
}

