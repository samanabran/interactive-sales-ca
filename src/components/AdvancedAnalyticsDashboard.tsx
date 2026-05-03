/**
 * Advanced Analytics Dashboard Component
 * Provides real-time insights, conversion metrics, and performance tracking
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendUp, 
  Phone, 
  Users, 
  Target,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
} from '@phosphor-icons/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import LiveActivityFeed from './LiveActivityFeed';

// Chart colors
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
};

const OUTCOME_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdvancedAnalyticsDashboard() {
  // Note: Analytics API integration pending - using demo data for now
  // TODO: Connect to /api/dashboard/stats once backend is ready
  const performanceData = [
    { month: 'Jan', calls: 65, demos: 45, conversions: 28 },
    { month: 'Feb', calls: 78, demos: 52, conversions: 35 },
    { month: 'Mar', calls: 90, demos: 61, conversions: 42 },
    { month: 'Apr', calls: 85, demos: 58, conversions: 38 },
    { month: 'May', calls: 95, demos: 68, conversions: 48 },
    { month: 'Jun', calls: 110, demos: 78, conversions: 55 },
  ];

  const conversionFunnelData = [
    { stage: 'Calls Made', value: 450, color: COLORS.primary },
    { stage: 'Interested', value: 320, color: COLORS.success },
    { stage: 'Demos Booked', value: 180, color: COLORS.warning },
    { stage: 'Proposals', value: 95, color: COLORS.purple },
    { stage: 'Closed Won', value: 45, color: COLORS.teal },
  ];

  const outcomeDistribution = [
    { name: 'Demo Booked', value: 35 },
    { name: 'Follow-up', value: 28 },
    { name: 'Not Interested', value: 15 },
    { name: 'Callback', value: 12 },
    { name: 'Voicemail', value: 10 },
  ];

  const weeklyTrendData = [
    { day: 'Mon', calls: 18, success: 12 },
    { day: 'Tue', calls: 22, success: 15 },
    { day: 'Wed', calls: 19, success: 13 },
    { day: 'Thu', calls: 25, success: 18 },
    { day: 'Fri', calls: 21, success: 14 },
    { day: 'Sat', calls: 8, success: 5 },
    { day: 'Sun', calls: 5, success: 3 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time performance insights and metrics</p>
        </div>
        <Badge variant="outline" className="w-fit">
          Last updated: Just now
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.3%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>5.2% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5 min</div>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <span>Optimal range</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>18 new this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        {/* Performance Chart */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Calls, demos, and conversions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stackId="1"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demos" 
                    stackId="2"
                    stroke={COLORS.success} 
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stackId="3"
                    stroke={COLORS.teal} 
                    fill={COLORS.teal}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel */}
        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Lead journey from initial contact to close</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={conversionFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.primary}>
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Overall Conversion</p>
                  <p className="text-2xl font-bold text-green-700">10%</p>
                  <p className="text-xs text-green-600">45 of 450 closed</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Avg Days to Close</p>
                  <p className="text-2xl font-bold text-blue-700">28 days</p>
                  <p className="text-xs text-blue-600">Industry avg: 35 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Calls and success rate by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="success" 
                    stroke={COLORS.success} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcome Distribution */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Outcomes</CardTitle>
              <CardDescription>Distribution of call results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={outcomeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outcomeDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[index % OUTCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 w-full md:w-auto">
                  {outcomeDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: OUTCOME_COLORS[index % OUTCOME_COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Insights & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
            <CardDescription>Best conversion rates this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson', calls: 85, conversions: 42, rate: 49.4 },
                { name: 'Mike Chen', calls: 72, conversions: 34, rate: 47.2 },
                { name: 'Emma Davis', calls: 68, conversions: 29, rate: 42.6 },
              ].map((agent, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.calls} calls • {agent.conversions} conversions
                    </p>
                  </div>
                  <Badge variant="default">{agent.rate}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Recommended next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Follow up with 12 warm leads</p>
                    <p className="text-xs text-green-700">High conversion probability</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Schedule 8 pending demos</p>
                    <p className="text-xs text-blue-700">Demos booked but not scheduled</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Re-engage 25 cold leads</p>
                    <p className="text-xs text-orange-700">No contact in 30+ days</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
}
