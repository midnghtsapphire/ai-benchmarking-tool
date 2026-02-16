/*
 * Leaderboard — Model Rankings
 * Sortable table of all benchmarked models
 * Design: Volcanic Observatory — geological strata table rows
 */
import { useState, useMemo } from "react";
import { useBenchmark, type LeaderboardEntry } from "@/contexts/BenchmarkContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  Timer,
} from "lucide-react";

type SortKey = keyof Pick<LeaderboardEntry, "avgTokensPerSec" | "avgLatencyMs" | "avgCostPer1kTokens" | "totalRuns" | "successRate" | "avgTimeToFirstToken">;

const COLUMNS: { key: SortKey; label: string; icon: React.ReactNode; unit: string }[] = [
  { key: "avgTokensPerSec", label: "Speed", icon: <Zap className="w-3.5 h-3.5" />, unit: "tok/s" },
  { key: "avgLatencyMs", label: "Latency", icon: <Clock className="w-3.5 h-3.5" />, unit: "ms" },
  { key: "avgTimeToFirstToken", label: "TTFT", icon: <Timer className="w-3.5 h-3.5" />, unit: "ms" },
  { key: "avgCostPer1kTokens", label: "Cost/1k", icon: <DollarSign className="w-3.5 h-3.5" />, unit: "$" },
  { key: "totalRuns", label: "Runs", icon: <FlaskConical className="w-3.5 h-3.5" />, unit: "" },
  { key: "successRate", label: "Success", icon: <CheckCircle2 className="w-3.5 h-3.5" />, unit: "%" },
];

export default function Leaderboard() {
  const { getLeaderboard } = useBenchmark();
  const [sortKey, setSortKey] = useState<SortKey>("avgTokensPerSec");
  const [sortAsc, setSortAsc] = useState(false);

  const leaderboard = getLeaderboard();

  const sorted = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      // For latency and cost, lower is better
      const lowerIsBetter = sortKey === "avgLatencyMs" || sortKey === "avgCostPer1kTokens" || sortKey === "avgTimeToFirstToken";
      const defaultAsc = lowerIsBetter;
      const ascending = sortAsc ? !defaultAsc : defaultAsc;
      return ascending ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [leaderboard, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const bestValues = useMemo(() => {
    if (leaderboard.length === 0) return null;
    return {
      avgTokensPerSec: Math.max(...leaderboard.map(e => e.avgTokensPerSec)),
      avgLatencyMs: Math.min(...leaderboard.map(e => e.avgLatencyMs)),
      avgTimeToFirstToken: Math.min(...leaderboard.map(e => e.avgTimeToFirstToken)),
      avgCostPer1kTokens: Math.min(...leaderboard.filter(e => e.avgCostPer1kTokens > 0).map(e => e.avgCostPer1kTokens)),
      successRate: Math.max(...leaderboard.map(e => e.successRate)),
    };
  }, [leaderboard]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Model rankings based on benchmark performance
          </p>
        </div>
        <Link href="/benchmark">
          <Button variant="outline" className="gap-2 bg-transparent border-border/60 hover:bg-accent/50">
            <FlaskConical className="w-4 h-4" />
            Run Benchmark
          </Button>
        </Link>
      </div>

      {leaderboard.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 text-center">
          <Trophy className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No Rankings Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Run benchmarks to populate the leaderboard with model performance data.
          </p>
          <Link href="/benchmark">
            <Button className="bg-[oklch(0.65_0.14_75)] text-[oklch(0.14_0.01_55)] hover:bg-[oklch(0.7_0.14_75)] gap-2">
              <FlaskConical className="w-4 h-4" />
              Start Benchmarking
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground w-8">#</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Model</th>
                    {COLUMNS.map(col => (
                      <th key={col.key} className="text-right px-4 py-3">
                        <button
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                          {col.icon}
                          {col.label}
                          {sortKey === col.key ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-[oklch(0.65_0.14_75)]" /> : <ArrowDown className="w-3 h-3 text-[oklch(0.65_0.14_75)]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((entry, i) => (
                    <tr
                      key={entry.modelId}
                      className="border-b border-border/20 hover:bg-[oklch(0.2_0.012_55_/_30%)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          i === 0 ? "bg-[oklch(0.65_0.14_75_/_20%)] text-[oklch(0.75_0.14_75)]" :
                          i === 1 ? "bg-[oklch(0.5_0.05_55_/_20%)] text-[oklch(0.7_0.03_55)]" :
                          i === 2 ? "bg-[oklch(0.45_0.1_30_/_20%)] text-[oklch(0.6_0.1_30)]" :
                          "text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{entry.modelName}</p>
                        <p className="text-xs text-muted-foreground">{entry.provider}</p>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        bestValues && entry.avgTokensPerSec === bestValues.avgTokensPerSec ? "text-[oklch(0.65_0.14_75)]" : "text-foreground"
                      }`}>
                        {entry.avgTokensPerSec} <span className="text-xs text-muted-foreground">tok/s</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        bestValues && entry.avgLatencyMs === bestValues.avgLatencyMs ? "text-[oklch(0.55_0.1_145)]" : "text-foreground"
                      }`}>
                        {entry.avgLatencyMs} <span className="text-xs text-muted-foreground">ms</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        bestValues && entry.avgTimeToFirstToken === bestValues.avgTimeToFirstToken ? "text-[oklch(0.55_0.1_145)]" : "text-foreground"
                      }`}>
                        {entry.avgTimeToFirstToken} <span className="text-xs text-muted-foreground">ms</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        bestValues && entry.avgCostPer1kTokens === bestValues.avgCostPer1kTokens ? "text-[oklch(0.55_0.1_145)]" : "text-foreground"
                      }`}>
                        ${entry.avgCostPer1kTokens.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        {entry.totalRuns}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        entry.successRate === 100 ? "text-[oklch(0.55_0.1_145)]" :
                        entry.successRate >= 80 ? "text-[oklch(0.65_0.14_75)]" :
                        "text-[oklch(0.5_0.18_25)]"
                      }`}>
                        {entry.successRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sorted.map((entry, i) => (
              <div key={entry.modelId} className="glass-panel rounded-xl p-4 ember-glow">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    i === 0 ? "bg-[oklch(0.65_0.14_75_/_20%)] text-[oklch(0.75_0.14_75)]" :
                    i === 1 ? "bg-[oklch(0.5_0.05_55_/_20%)] text-[oklch(0.7_0.03_55)]" :
                    "text-muted-foreground bg-[oklch(0.25_0.01_55)]"
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.modelName}</p>
                    <p className="text-xs text-muted-foreground">{entry.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-md bg-[oklch(0.16_0.01_55_/_50%)]">
                    <p className="text-[10px] text-muted-foreground">Speed</p>
                    <p className="text-sm font-mono text-[oklch(0.65_0.14_75)]">{entry.avgTokensPerSec} tok/s</p>
                  </div>
                  <div className="p-2 rounded-md bg-[oklch(0.16_0.01_55_/_50%)]">
                    <p className="text-[10px] text-muted-foreground">Latency</p>
                    <p className="text-sm font-mono text-foreground">{entry.avgLatencyMs}ms</p>
                  </div>
                  <div className="p-2 rounded-md bg-[oklch(0.16_0.01_55_/_50%)]">
                    <p className="text-[10px] text-muted-foreground">Cost/1k</p>
                    <p className="text-sm font-mono text-foreground">${entry.avgCostPer1kTokens.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
