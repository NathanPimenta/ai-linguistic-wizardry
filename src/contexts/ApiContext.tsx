
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ApiContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
