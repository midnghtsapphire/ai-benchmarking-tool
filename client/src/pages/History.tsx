/*
 * History — Past Benchmark Runs
 * Chronological list of all benchmark runs with expandable details
 * Design: Volcanic Observatory — geological timeline
 */
import { useState } from "react";
import { useBenchmark, type BenchmarkRun } from "@/contexts/BenchmarkContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  History as HistoryIcon,
  FlaskConical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function History() {
  const { runs, clearHistory } = useBenchmark();
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {runs.length} benchmark run{runs.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <div className="flex gap-2">
          {runs.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              className="gap-2 bg-transparent border-border/60 hover:bg-[oklch(0.5_0.18_25_/_10%)] hover:border-[oklch(0.5_0.18_25_/_30%)] hover:text-[oklch(0.65_0.18_25)] text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
          <Link href="/benchmark">
            <Button variant="outline" className="gap-2 bg-transparent border-border/60 hover:bg-accent/50">
              <FlaskConical className="w-4 h-4" />
              New Run
            </Button>
          </Link>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 text-center">
          <HistoryIcon className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No History Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Your benchmark runs will appear here. Run your first benchmark to get started.
          </p>
          <Link href="/benchmark">
            <Button className="bg-[oklch(0.65_0.14_75)] text-[oklch(0.14_0.01_55)] hover:bg-[oklch(0.7_0.14_75)] gap-2">
              <FlaskConical className="w-4 h-4" />
              Start Benchmarking
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map(run => (
            <RunCard
              key={run.id}
              run={run}
              isExpanded={expandedRun === run.id}
              onToggle={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RunCard({ run, isExpanded, onToggle }: { run: BenchmarkRun; isExpanded: boolean; onToggle: () => void }) {
  const successCount = run.results.filter(r => r.status === "success").length;
  const errorCount = run.results.filter(r => r.status === "error").length;
  const totalCost = run.results.reduce((s, r) => s + r.costUsd, 0);
  const avgSpeed = successCount > 0
    ? Math.round(run.results.filter(r => r.status === "success").reduce((s, r) => s + r.tokensPerSecond, 0) / successCount * 10) / 10
    : 0;
  const duration = run.completedAt ? run.completedAt - run.startedAt : 0;

  const statusIcon = run.status === "completed"
    ? <CheckCircle2 className="w-4 h-4 text-[oklch(0.5_0.12_145)]" />
    : run.status === "partial"
    ? <AlertTriangle className="w-4 h-4 text-[oklch(0.55_0.18_45)]" />
    : <Clock className="w-4 h-4 text-[oklch(0.65_0.14_75)] animate-pulse" />;

  return (
    <div className="glass-panel rounded-xl overflow-hidden ember-glow">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[oklch(0.2_0.012_55_/_30%)] transition-colors"
      >
        {statusIcon}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{run.prompt}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{new Date(run.startedAt).toLocaleString()}</span>
            <span>·</span>
            <span>{run.results.length} model{run.results.length !== 1 ? "s" : ""}</span>
            {duration > 0 && (
              <>
                <span>·</span>
                <span>{(duration / 1000).toFixed(1)}s</span>
              </>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs font-mono">
          {avgSpeed > 0 && (
            <span className="flex items-center gap-1 text-[oklch(0.65_0.14_75)]">
              <Zap className="w-3 h-3" /> {avgSpeed} tok/s
            </span>
          )}
          {totalCost > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3 h-3" /> ${totalCost.toFixed(5)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[oklch(0.5_0.12_145)]" /> {successCount}
            {errorCount > 0 && (
              <>
                <XCircle className="w-3 h-3 text-[oklch(0.5_0.18_25)] ml-1" /> {errorCount}
              </>
            )}
          </span>
        </div>

        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {isExpanded && (
        <div className="border-t border-border/30 p-4 space-y-2 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          {/* Prompt */}
          <div className="p-3 rounded-lg bg-[oklch(0.14_0.01_55)] border border-border/20 mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Prompt</p>
            <p className="text-sm text-foreground">{run.prompt}</p>
          </div>

          {/* Results */}
          {run.results.map((result, i) => (
            <div
              key={result.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                result.status === "error"
                  ? "bg-[oklch(0.5_0.18_25_/_8%)] border border-[oklch(0.5_0.18_25_/_15%)]"
                  : "bg-[oklch(0.16_0.01_55_/_50%)]"
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground bg-[oklch(0.25_0.01_55)] shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{result.modelName}</p>
                <p className="text-xs text-muted-foreground">{result.provider}</p>
              </div>
              {result.status === "success" ? (
                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  <span className="text-[oklch(0.65_0.14_75)]">{result.tokensPerSecond} tok/s</span>
                  <span className="text-muted-foreground">{result.latencyMs}ms</span>
                  <span className="text-muted-foreground">${result.costUsd.toFixed(5)}</span>
                </div>
              ) : (
                <span className="text-xs text-[oklch(0.5_0.18_25)] font-mono shrink-0">
                  {result.errorMessage || "Error"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
