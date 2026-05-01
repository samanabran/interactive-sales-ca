// Analytics Page — routes to company-specific KPI dashboards
// Renders EigerMarvelKPIs or SDCTechKPIs based on the active company

import { useCompany } from '@/contexts/CompanyContext';
import EigerMarvelKPIs from '@/components/analytics/EigerMarvelKPIs';
import SDCTechKPIs from '@/components/analytics/SDCTechKPIs';

export default function AnalyticsPage() {
  const { selectedCompany } = useCompany();

  if (selectedCompany === 'eiger-marvel-hr') {
    return <EigerMarvelKPIs sessions={[]} />;
  }

  if (selectedCompany === 'sgc-tech-ai') {
    return <SDCTechKPIs sessions={[]} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
      <p>Select a company to view analytics.</p>
    </div>
  );
}
