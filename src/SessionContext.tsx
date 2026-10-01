import { createContext, useContext, useState, type ReactNode } from 'react';

interface SessionContextType {
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <SessionContext.Provider value={{ selectedSessionId, setSelectedSessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}