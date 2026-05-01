// EIGER MARVEL HR — KPI Analytics Dashboard
// Tracks HR-specific sales training performance metrics

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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendUp,
  Users,
  Target,
  ClockCountdown,
  CurrencyDollar,
  Trophy,
  ChartBar,
} from '@phosphor-icons/react';

export interface EigerSessionRecord {
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

interface EigerMarvelKPIsProps {
  sessions: EigerSessionRecord[];
}

const STAGE_ORDER = [
  'greeting',
  'discovery',
  'pain-quantification',
  'solution',
  'objection-handling',
  'closing',
];

const STAGE_LABELS: Record<string, string> = {
  greeting: 'Greeting',
  discovery: 'Discovery',
  'pain-quantification': 'Pain Quant.',
  solution: 'Solution',
  'objection-handling': 'Objections',
  closing: 'Closing',
};

const OBJECTION_LABELS: Record<string, string> = {
  cost: 'Budget/Cost',
  teamAdoption: 'Team Adoption',
  atsIntegration: 'ATS Integration',
  wpsCompliance: 'WPS Compliance',
  proofOfConcept: 'PoC Request',
  timeline: 'Timeline',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

export default function EigerMarvelKPIs({ sessions }: EigerMarvelKPIsProps) {
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
      adherence: s.scriptAdherence,
      objection: s.objectionHandling,
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
      name: name.split(' ')[0], // First name only
      avgScore: Math.round(avg(scores)),
      sessions: scores.length,
    }));

    return {
      avgScore, avgAdherence, avgObjection, avgRapport, avgClosing,
      totalSessions, avgDuration, stageRates, objections, trend, radar, personaBreakdown,
    };
  }, [sessions]);

  if (!stats) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <ChartBar className="h-5 w-5" /> EIGER MARVEL HR — Training Analytics
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
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Users className="h-6 w-6" />
            EIGER MARVEL HR — Sales Training KPIs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            HR recruitment & Odoo ERP sales performance
          </p>
        </div>
        <Badge variant={scoreBadgeVariant(stats.avgScore)} className="text-lg px-4 py-2">
          Avg Score: {stats.avgScore}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Overall Score</span>
            </div>
            <div className={`text-2xl font-bold ${scoreColor(stats.avgScore)}`}>
              {stats.avgScore}
            </div>
            <Progress value={stats.avgScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Script Adherence</span>
            </div>
            <div className={`text-2xl font-bold ${scoreColor(stats.avgAdherence)}`}>
              {stats.avgAdherence}%
            </div>
            <Progress value={stats.avgAdherence} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClockCountdown className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {stats.avgDuration}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">per session</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CurrencyDollar className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {stats.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp className="h-4 w-4 text-blue-500" />
              Score Trend (Last 8 Sessions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #dbeafe' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="overall" stroke="#3B82F6" strokeWidth={2} dot={false} name="Overall" />
                <Line type="monotone" dataKey="adherence" stroke="#60A5FA" strokeWidth={1.5} dot={false} name="Adherence" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="objection" stroke="#93C5FD" strokeWidth={1.5} dot={false} name="Objections" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skill Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={stats.radar}>
                <PolarGrid stroke="#dbeafe" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
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
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Call Stage Completion Rates</CardTitle>
            <CardDescription className="text-xs">% of sessions reaching each HR call stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.stageRates} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Completion']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Objection Frequency</CardTitle>
            <CardDescription className="text-xs">Most common HR buyer objections encountered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.objections.slice(0, 6).map(obj => (
              <div key={obj.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{obj.name}</span>
                <Progress value={obj.rate} className="flex-1 h-2" />
                <span className="text-xs font-medium w-10 text-right text-blue-700">{obj.rate}%</span>
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
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score by Prospect Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {stats.personaBreakdown.map(p => (
                <div key={p.name} className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className={`text-2xl font-bold ${scoreColor(p.avgScore)}`}>{p.avgScore}</div>
                  <div className="text-sm font-medium mt-1">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sessions} session{p.sessions !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HR-specific KPI benchmarks */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">HR Sales Benchmarks</CardTitle>
          <CardDescription className="text-xs">Target metrics for EIGER MARVEL HR deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Time-to-Hire Reduction</div>
              <div className="font-semibold text-blue-700">Target: 30%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Cost-per-Hire Reduction</div>
              <div className="font-semibold text-blue-700">Target: 20%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ROI Payback Period</div>
              <div className="font-semibold text-blue-700">Target: 90 days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Odoo ERP Adoption</div>
              <div className="font-semibold text-blue-700">Target: 85%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
