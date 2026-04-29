// Main application - Zero-cost deployment (Clerk auth removed)
import { useState, lazy, Suspense, useCallback } from 'react';
import { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  PhoneCall,
  Robot,
  ChartBar,
  Users,
} from '@phosphor-icons/react';
import { CallErrorBoundary, AIErrorBoundary, LeadErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { QueryProvider } from '@/lib/queryClient';

// Lazy load heavy components
const RolePlayPage = lazy(() => import('@/pages/RolePlayPage'));
const CallApp = lazy(() => import('@/components/CallApp'));
const LeadManager = lazy(() => import('@/components/LeadManager'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/components/AdvancedAnalyticsDashboard'));

// Loading fallback
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function ComponentLoadingFallback() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-6 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main layout with company selection and simplified tabs
function MainLayout() {
  const [activeTab, setActiveTab] = useState('roleplay');
  const { selectedCompany, setSelectedCompany } = useCompany();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handleCompanySelect = useCallback((company: string) => {
    setSelectedCompany(company as any);
    setSelectedPersona(null);
    setActiveTab('roleplay');
  }, [setSelectedCompany]);

  const handlePersonaSelect = useCallback((personaId: string) => {
    setSelectedPersona(personaId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 safe-area-top">
        <div className="mobile-container max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                Scholarix CRM
              </div>
              {selectedCompany && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {selectedCompany === 'eiger-marvel-hr' ? 'EIGER MARVEL HR' : 'SGC TECH AI'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Company Selection Bar */}
      {!selectedCompany && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Select Your Company for Training</h2>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant={selectedCompany === 'eiger-marvel-hr' ? 'default' : 'outline'}
                onClick={() => handleCompanySelect('eiger-marvel-hr')}
                className="text-lg px-8 py-6 h-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                EIGER MARVEL HR
                <span className="block text-sm font-normal mt-1">HR Consultancy</span>
              </Button>
              <Button
                size="lg"
                variant={selectedCompany === 'sgc-tech-ai' ? 'default' : 'outline'}
                onClick={() => handleCompanySelect('sgc-tech-ai')}
                className="text-lg px-8 py-6 h-auto"
              >
                <ChartBar className="mr-2 h-5 w-5" />
                SGC TECH AI
                <span className="block text-sm font-normal mt-1">IT & Software</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Only show when company is selected */}
      {selectedCompany && (
        <div className="bg-white border-b border-gray-200">
          <div className="mobile-container max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-transparent p-0">
                <TabsTrigger 
                  value="roleplay" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600"
                >
                  <Robot className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>AI Practice</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="calls" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Live Call</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="leads" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Leads</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                <TabsContent value="roleplay" className="mt-0 h-full">
                  <AIErrorBoundary componentName="RolePlayPage">
                    <Suspense fallback={<ComponentLoadingFallback />}>
                      <RolePlayPage 
                        company={selectedCompany}
                        onPersonaSelect={handlePersonaSelect}
                        selectedPersona={selectedPersona}
                      />
                    </Suspense>
                  </AIErrorBoundary>
                </TabsContent>
                
                <TabsContent value="calls" className="mt-0 h-full">
                  <CallErrorBoundary componentName="CallApp">
                    <Suspense fallback={<ComponentLoadingFallback />}>
                      <CallApp 
                        company={selectedCompany}
                        personaId={selectedPersona}
                      />
                    </Suspense>
                  </CallErrorBoundary>
                </TabsContent>
                
                <TabsContent value="leads" className="mt-0 h-full">
                  <LeadErrorBoundary componentName="LeadManager">
                    <Suspense fallback={<ComponentLoadingFallback />}>
                      <LeadManager />
                    </Suspense>
                  </LeadErrorBoundary>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
      
      <Toaster position="top-center" toastOptions={{ className: 'toast-mobile' }} />
    </div>
  );
}

export default function App() {
  return (
    <CompanyProvider>
      <QueryProvider>
        <Toaster />
        <Suspense fallback={<LoadingSpinner />}>
          <MainLayout />
        </Suspense>
      </QueryProvider>
    </CompanyProvider>
  );
}
