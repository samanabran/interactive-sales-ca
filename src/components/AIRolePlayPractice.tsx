// AIRolePlayPractice — thin router that delegates to company-specific components
import { useCompany } from '@/contexts/CompanyContext';
import EigerMarvelRolePlay from '@/components/roleplay/EigerMarvelRolePlay';
import SDCTechAIRolePlay from '@/components/roleplay/SDCTechAIRolePlay';

export default function AIRolePlayPractice() {
  const { selectedCompany } = useCompany();

  if (selectedCompany === 'eiger-marvel-hr') return <EigerMarvelRolePlay />;
  if (selectedCompany === 'sgc-tech-ai') return <SDCTechAIRolePlay />;

  // CompanySelector handles the no-company state upstream
  return null;
}
