// SGC TECH AI — KPI Analytics Dashboard
// Tracks enterprise IT/AI sales training performance metrics

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendUp,
  Robot,
  ClockCountdown,
  Code,
  Trophy,
  ChartBar,
  GearSix,
  TerminalWindow,
} from '@phosphor-icons/react';

export interface SGCSessionRecord {
  sessionId: string;
  date: string;
  personaName: string;
  personaType: string;
  durationMinutes: number;
  overallScore: number;
  scriptAdherence: number;
  objectionHandling: number;
  rapport: number;
  closing: number;
  objectionsEncountered: string[];
  stagesReached: string[];
}

interface SDCTechKPIsProps {
  sessions: SGCSessionRecord[];
}

const STAGE_ORDER = [
  'greeting',
  'discovery',
  'gap-analysis',
  'business-case',
  'poc-proposal',
  'objection-handling',
  'closing',
];

const STAGE_LABELS: Record<string, string> = {
  greeting: 'Greeting',
  discovery: 'Discovery',
  'gap-analysis': 'Gap Analysis',
  'business-case': 'Biz Case',
  'poc-proposal': 'PoC Proposal',
  'objection-handling': 'Objections',
  closing: 'Closing',
};

const OBJECTION_LABELS: Record<string, string> = {
  trackRecord: 'Track Record',
  transactionVolume: 'Volume/Scale',
  implementationRisk: 'Impl. Risk',
  slaRequirements: 'SLA/Uptime',
  securityCompliance: 'Security',
  vendorLockIn: 'Vendor Lock-in',
  aiQuality: 'AI Quality',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

export default function SDCTechKPIs({ sessions }: SDCTechKPIsProps) {
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const avgScore = Math.round(avg(sessions.map(s => s.overallScore)));
    const avgAdherence = Math.round(avg(sessions.map(s => s.scriptAdherence)));
    const avgObjection = Math.round(avg(sessions.map(s => s.objectionHandling)));
    const avgRapport = Math.round(avg(sessions.map(s => s.rapport)));
    const avgClosing = Math.round(avg(sessions.map(s => s.closing)));
    const totalSessions = sessions.length;
    const avgDuration = Math.round(avg(sessions.map(s => s.durationMinutes)));

    // PoC proposal reach rate (key enterprise metric)
    const pocRate = Math.round(
      (sessions.filter(s => s.stagesReached.includes('poc-proposal')).length / totalSessions) * 100
    );

    // Stage completion rates
    const stageRates = STAGE_ORDER.map(stage => ({
      name: STAGE_LABELS[stage] ?? stage,
      rate: Math.round(
        (sessions.filter(s => s.stagesReached.includes(stage)).length / totalSessions) * 100
      ),
    }));

    // Objection frequency
    const objCount: Record<string, number> = {};
    for (const s of sessions) {
      for (const obj of s.objectionsEncountered) {
        objCount[obj] = (objCount[obj] ?? 0) + 1;
      }
    }
    const objections = Object.entries(objCount)
      .map(([key, count]) => ({
        name: OBJECTION_LABELS[key] ?? key,
        count,
        rate: Math.round((count / totalSessions) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Score trend (last 8 sessions)
    const recent = sessions.slice(-8);
    const trend = recent.map((s, i) => ({
      session: `S${sessions.length - recent.length + i + 1}`,
      overall: s.overallScore,
      closing: s.closing,
      objection: s.objectionHandling,
    }));

    // Area chart for cumulative improvement
    const cumulativeTrend = sessions.slice(-10).map((s, i) => ({
      session: `S${sessions.length - Math.min(10, sessions.length) + i + 1}`,
      score: s.overallScore,
      avg: Math.round(avg(sessions.slice(0, sessions.length - Math.min(10, sessions.length) + i + 1).map(x => x.overallScore))),
    }));

    // Radar data
    const radar = [
      { skill: 'Script', score: avgAdherence },
      { skill: 'Objections', score: avgObjection },
      { skill: 'Rapport', score: avgRapport },
      { skill: 'Closing', score: avgClosing },
      { skill: 'Overall', score: avgScore },
    ];

    // Persona breakdown
    const personaMap: Record<string, number[]> = {};
    for (const s of sessions) {
      if (!personaMap[s.personaName]) personaMap[s.personaName] = [];
      personaMap[s.personaName].push(s.overallScore);
    }
    const personaBreakdown = Object.entries(personaMap).map(([name, scores]) => ({
      name: name.split(' ')[0],
      avgScore: Math.round(avg(scores)),
      sessions: scores.length,
    }));

    return {
      avgScore, avgAdherence, avgObjection, avgRapport, avgClosing,
      totalSessions, avgDuration, pocRate, stageRates, objections,
      trend, cumulativeTrend, radar, personaBreakdown,
    };
  }, [sessions]);

  if (!stats) {
    return (
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-700 flex items-center gap-2">
            <ChartBar className="h-5 w-5" /> SGC TECH AI — Training Analytics
          </CardTitle>
          <CardDescription>Complete your first roleplay session to see analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No sessions recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <Robot className="h-6 w-6" />
            SGC TECH AI — Sales Training KPIs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise AI automation & IT services sales performance
          </p>
        </div>
        <Badge variant={scoreBadgeVariant(stats.avgScore)} className="text-lg px-4 py-2">
          Avg Score: {stats.avgScore}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Overall Score</span>
            </div>
            <div className={`text-2xl font-bold ${scoreColor(stats.avgScore)}`}>
              {stats.avgScore}
            </div>
            <Progress value={stats.avgScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TerminalWindow className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">PoC Proposal Rate</span>
            </div>
            <div className={`text-2xl font-bold ${scoreColor(stats.pocRate)}`}>
              {stats.pocRate}%
            </div>
            <Progress value={stats.pocRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClockCountdown className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {stats.avgDuration}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">per session</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <GearSix className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {stats.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp className="h-4 w-4 text-emerald-500" />
              Score Trend (Last 8 Sessions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.cumulativeTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="sgcScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d1fae5' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#sgcScore)" strokeWidth={2} name="Session Score" />
                <Line type="monotone" dataKey="avg" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Running Avg" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skill Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={stats.radar}>
                <PolarGrid stroke="#d1fae5" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.25}
                />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stage Completion + Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Call Stage Completion</CardTitle>
            <CardDescription className="text-xs">% of sessions reaching each stage (7-stage tech flow)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.stageRates} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Completion']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="rate" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Objection Frequency</CardTitle>
            <CardDescription className="text-xs">Most common tech buyer objections encountered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.objections.slice(0, 7).map(obj => (
              <div key={obj.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{obj.name}</span>
                <Progress value={obj.rate} className="flex-1 h-2" />
                <span className="text-xs font-medium w-10 text-right text-emerald-700">{obj.rate}%</span>
              </div>
            ))}
            {stats.objections.length === 0 && (
              <p className="text-xs text-muted-foreground">No objections recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Persona Breakdown */}
      {stats.personaBreakdown.length > 0 && (
        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score by Prospect Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {stats.personaBreakdown.map(p => (
                <div key={p.name} className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className={`text-2xl font-bold ${scoreColor(p.avgScore)}`}>{p.avgScore}</div>
                  <div className="text-sm font-medium mt-1">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sessions} session{p.sessions !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SGC-specific KPI benchmarks */}
      <Card className="border-emerald-100 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            <Code className="h-4 w-4" />
            Enterprise Tech Sales Benchmarks
          </CardTitle>
          <CardDescription className="text-xs">Target metrics for SGC TECH AI enterprise deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">PoC-to-Deployment</div>
              <div className="font-semibold text-emerald-700">Target: 4 weeks</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Uptime SLA</div>
              <div className="font-semibold text-emerald-700">Target: 99.9%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">AI ROI Payback</div>
              <div className="font-semibold text-emerald-700">Target: 6 months</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">API Integration Time</div>
              <div className="font-semibold text-emerald-700">Target: 2 weeks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closing vs Objection sub-trend */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Closing vs Objection Handling Trend</CardTitle>
          <CardDescription className="text-xs">Enterprise deals require strong objection handling before closing</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="session" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="closing" stroke="#10B981" strokeWidth={2} dot={false} name="Closing Score" />
              <Line type="monotone" dataKey="objection" stroke="#34D399" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Objection Score" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
