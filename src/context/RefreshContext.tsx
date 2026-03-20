import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type RefreshContextValue = {
  tick: number;
  trigger: () => void;
};

const RefreshContext = createContext<RefreshContextValue | undefined>(undefined);

export const RefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [tick, setTick] = useState(0);

  const trigger = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  const value = useMemo(() => ({ tick, trigger }), [tick, trigger]);

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
};

export const useRefresh = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return ctx;
};

