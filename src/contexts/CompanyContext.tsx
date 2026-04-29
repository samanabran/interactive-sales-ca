import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CompanyType } from '../lib/companySelector';

interface CompanyContextType {
  selectedCompany: CompanyType | null;
  setSelectedCompany: (company: CompanyType) => void;
  clearCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null);

  const clearCompany = () => setSelectedCompany(null);

  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany, clearCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
