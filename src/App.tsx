// Main application - Zero-cost deployment (Clerk auth removed)
import { useState, lazy, Suspense } from 'react';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  PhoneCall,
  Users,
  ChartBar,
  Robot,
  Books,
  Shield
} from '@phosphor-icons/react';
import { CallErrorBoundary, AIErrorBoundary, LeadErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { QueryProvider } from '@/lib/queryClient';

// Lazy load heavy components for better performance
const CallApp = lazy(() => import('@/components/CallApp'));
const LeadManager = lazy(() => import('@/components/LeadManager'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const ScriptTestPage = lazy(() => import('@/pages/ScriptTestPage'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/components/AdvancedAnalyticsDashboard'));
const RolePlayPage = lazy(() => import('@/pages/RolePlayPage'));

// Loading component
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

// Component loading fallback with skeleton
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

// Main layout (no auth required - zero-cost deployment)
function MainLayout() {
  const [activeTab, setActiveTab] = useState('roleplay'); // Default to AI RolePlay for B2B voice agents
  const userRole = 'agent'; // Simplified for zero-cost deployment

  const getRoleBadge = (role: string) => (
    <Badge 
      variant="outline" 
      className={
        role === 'admin' ? 'border-purple-300 text-purple-700' :
        role === 'manager' ? 'border-blue-300 text-blue-700' :
        'border-gray-300 text-gray-700'
      }
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 safe-area-top">
        <div className="mobile-container max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                Scholarix CRM
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Role badge */}
              <div className="hidden xs:block">
                {getRoleBadge(userRole)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="mobile-container max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 md:grid-cols-6 h-12 sm:h-14 bg-transparent p-0">
              <TabsTrigger 
                value="calls" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Calls</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="leads" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Leads</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="analytics" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
              >
                <ChartBar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="roleplay" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600"
              >
                <Robot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">AI Practice</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="script-test" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600"
              >
                <Books className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Script Test</span>
                <span className="sm:hidden">Script</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="admin" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="min-h-[calc(100vh-8rem)]">
              <TabsContent value="calls" className="mt-0 h-full">
                <CallErrorBoundary componentName="CallApp">
                  <Suspense fallback={<ComponentLoadingFallback />}>
                    <CallApp />
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
              
              <TabsContent value="analytics" className="mt-0 h-full">
                <ComponentErrorBoundary>
                  <Suspense fallback={<ComponentLoadingFallback />}>
                    <AdvancedAnalyticsDashboard />
                  </Suspense>
                </ComponentErrorBoundary>
              </TabsContent>
              
              <TabsContent value="roleplay" className="mt-0 h-full">
                <AIErrorBoundary componentName="RolePlayPage">
                  <Suspense fallback={<ComponentLoadingFallback />}>
                    <RolePlayPage />
                  </Suspense>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="script-test" className="mt-0 h-full">
                <AIErrorBoundary componentName="ScriptTestPage">
                  <Suspense fallback={<ComponentLoadingFallback />}>
                    <ScriptTestPage />
                  </Suspense>
                </AIErrorBoundary>
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0 h-full">
                <Suspense fallback={<ComponentLoadingFallback />}>
                  <AdminPanel />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'toast-mobile'
        }}
      />
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
