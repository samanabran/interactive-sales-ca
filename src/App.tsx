// Main application with routing and authentication using Clerk
import { useState, lazy, Suspense } from 'react';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton, 
  useUser,
  RedirectToSignIn
} from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  PhoneCall,
  Users,
  Shield,
  User as UserIcon,
  Books,
  Robot,
  ChartBar
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

// Sign-in page component
function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Scholarix CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your sales dashboard
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <Button size="lg" className="w-full">
                Sign in to continue
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main protected layout
function ProtectedLayout() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('calls');

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  // Get user role from user metadata or default to 'agent'
  const userRole = user.publicMetadata?.role as string || 'agent';

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
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-gray-200 safe-area-top">
        <div className="mobile-container max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Always visible */}
            <div className="flex items-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                Scholarix CRM
              </div>
            </div>

            {/* Mobile-optimized header actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User info - responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* User details - hidden on very small screens */}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-24 md:max-w-none">
                    {user.fullName || user.firstName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-24 md:max-w-none">
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                
                {/* Role badge - smaller on mobile */}
                <div className="hidden xs:block">
                  {getRoleBadge(userRole)}
                </div>

                {/* Clerk User Button - handles user menu and logout */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 sm:h-10 sm:w-10"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Mobile Responsive */}
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
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Admin</span>
                </TabsTrigger>
              )}
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
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <TabsContent value="admin" className="mt-0 h-full">
                  <Suspense fallback={<ComponentLoadingFallback />}>
                    <AdminPanel />
                  </Suspense>
                </TabsContent>
              )}
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
    <QueryProvider>
      <CompanyProvider>
        <SignedOut>
          <SignInPage />
        </SignedOut>
        <SignedIn>
          <ProtectedLayout />
        </SignedIn>
      </CompanyProvider>
    </QueryProvider>
  );
}
