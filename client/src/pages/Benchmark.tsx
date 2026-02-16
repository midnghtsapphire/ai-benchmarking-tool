/*
 * Benchmark — Run custom prompts against multiple models
 * Side-by-side comparison with real-time results
 * Design: Volcanic Observatory — thermal data visualization
 */
import { useState, useMemo } from "react";
import { useBenchmark, type BenchmarkResult } from "@/contexts/BenchmarkContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical,
  Play,
  Loader2,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const PRESET_PROMPTS = [
  { label: "Creative Writing", prompt: "Write a short story about a robot discovering emotions for the first time. Include vivid sensory details and metaphors." },
  { label: "Code Generation", prompt: "Write a TypeScript function that implements a binary search tree with insert, delete, and search operations. Include proper typing and comments." },
  { label: "Reasoning", prompt: "A farmer has 17 sheep. All but 9 die. How many sheep does the farmer have left? Explain your reasoning step by step." },
  { label: "Summarization", prompt: "Explain quantum computing to a 10-year-old in exactly 3 sentences. Make it fun and accurate." },
  { label: "Analysis", prompt: "Compare the pros and cons of microservices vs monolithic architecture for a startup with 5 engineers building a SaaS product." },
];

export default function Benchmark() {
  const { models, runBenchmark, isRunning, currentRun } = useBenchmark();
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-flash-1.5", "meta-llama/llama-3.1-70b-instruct"])
  );
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleModel = (id: string) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedModels(new Set(models.map(m => m.id)));
  const selectNone = () => setSelectedModels(new Set());

  const handleRun = async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt to benchmark");
      return;
    }
    if (selectedModels.size === 0) {
      toast.error("Select at least one model");
      return;
    }
    await runBenchmark(prompt.trim(), Array.from(selectedModels));
    toast.success("Benchmark complete!");
  };

  const progress = currentRun && isRunning
    ? Math.round((currentRun.results.length / currentRun.models.length) * 100)
    : 0;

  const copyResponse = async (result: BenchmarkResult) => {
    await navigator.clipboard.writeText(result.response);
    setCopiedId(result.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort results by tokens/sec descending
  const sortedResults = useMemo(() => {
    if (!currentRun) return [];
    return [...currentRun.results].sort((a, b) => b.tokensPerSecond - a.tokensPerSecond);
  }, [currentRun]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof models> = {};
    for (const m of models) {
      if (!groups[m.provider]) groups[m.provider] = [];
      groups[m.provider].push(m);
    }
    return groups;
  }, [models]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground">Run Benchmark</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Test AI models side-by-side with custom prompts
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Prompt + Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Prompt input */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <Label className="text-sm font-medium text-foreground">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your benchmark prompt..."
              className="min-h-[120px] bg-[oklch(0.14_0.01_55)] border-border/40 text-foreground placeholder:text-muted-foreground/50 resize-y focus-visible:ring-[oklch(0.65_0.14_75_/_40%)]"
            />

            {/* Preset prompts */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setPrompt(p.prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-[oklch(0.65_0.14_75_/_40%)] hover:bg-[oklch(0.65_0.14_75_/_8%)] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model selection */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Models ({selectedModels.size}/{models.length})
              </Label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[11px] text-[oklch(0.65_0.14_75)] hover:underline">All</button>
                <button onClick={selectNone} className="text-[11px] text-muted-foreground hover:underline">None</button>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {Object.entries(grouped).map(([provider, providerModels]) => (
                <div key={provider}>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                    {provider}
                  </p>
                  <div className="space-y-0.5">
                    {providerModels.map(model => (
                      <label
                        key={model.id}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/30 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedModels.has(model.id)}
                          onCheckedChange={() => toggleModel(model.id)}
                          className="border-border/60 data-[state=checked]:bg-[oklch(0.65_0.14_75)] data-[state=checked]:border-[oklch(0.65_0.14_75)]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground">{model.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          ${model.inputCostPer1M}/M
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Run button */}
          <Button
            onClick={handleRun}
            disabled={isRunning || !prompt.trim() || selectedModels.size === 0}
            className="w-full h-12 bg-[oklch(0.65_0.14_75)] text-[oklch(0.14_0.01_55)] hover:bg-[oklch(0.7_0.14_75)] font-semibold text-base gap-2 shadow-lg shadow-[oklch(0.65_0.14_75_/_20%)] disabled:opacity-40"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running... ({currentRun?.results.length || 0}/{selectedModels.size})
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Benchmark
              </>
            )}
          </Button>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5 bg-[oklch(0.2_0.01_55)]" />
              <p className="text-xs text-muted-foreground text-center font-mono">{progress}%</p>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {sortedResults.length === 0 && !isRunning ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <FlaskConical className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">Ready to Benchmark</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Select models, enter a prompt, and hit Run to see side-by-side performance comparisons.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedResults.map((result, i) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  rank={i + 1}
                  isExpanded={expandedResult === result.id}
                  onToggle={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                  onCopy={() => copyResponse(result)}
                  isCopied={copiedId === result.id}
                  bestSpeed={sortedResults[0]?.tokensPerSecond || 1}
                />
              ))}

              {/* Pending models */}
              {isRunning && currentRun && (
                <>
                  {currentRun.models
                    .filter(id => !currentRun.results.find(r => r.modelId === id))
                    .map(modelId => {
                      const model = models.find(m => m.id === modelId);
                      return (
                        <div key={modelId} className="glass-panel rounded-xl p-4 opacity-60 animate-pulse">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-[oklch(0.65_0.14_75)] animate-spin" />
                            <span className="text-sm text-foreground">{model?.name || modelId}</span>
                            <span className="text-xs text-muted-foreground ml-auto font-mono">Pending...</span>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────────────
function ResultCard({
  result,
  rank,
  isExpanded,
  onToggle,
  onCopy,
  isCopied,
  bestSpeed,
}: {
  result: BenchmarkResult;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  isCopied: boolean;
  bestSpeed: number;
}) {
  const isError = result.status === "error";
  const speedPct = bestSpeed > 0 ? (result.tokensPerSecond / bestSpeed) * 100 : 0;

  return (
    <div className={`glass-panel rounded-xl overflow-hidden ember-glow ${isError ? "border-[oklch(0.5_0.18_25_/_30%)]" : ""}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[oklch(0.2_0.012_55_/_30%)] transition-colors"
      >
        {/* Rank */}
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
          rank === 1 ? "bg-[oklch(0.65_0.14_75_/_20%)] text-[oklch(0.75_0.14_75)]" :
          rank === 2 ? "bg-[oklch(0.5_0.05_55_/_20%)] text-[oklch(0.7_0.03_55)]" :
          rank === 3 ? "bg-[oklch(0.45_0.1_30_/_20%)] text-[oklch(0.6_0.1_30)]" :
          "bg-[oklch(0.25_0.01_55)] text-muted-foreground"
        }`}>
          {rank}
        </span>

        {/* Model info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{result.modelName}</span>
            {isError ? (
              <XCircle className="w-3.5 h-3.5 text-[oklch(0.5_0.18_25)]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.5_0.12_145)]" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{result.provider}</span>
        </div>

        {/* Key metrics */}
        {!isError && (
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <MetricBadge icon={<Zap className="w-3 h-3" />} value={`${result.tokensPerSecond}`} unit="tok/s" color="gold" />
            <MetricBadge icon={<Clock className="w-3 h-3" />} value={`${result.latencyMs}`} unit="ms" color="ember" />
            <MetricBadge icon={<DollarSign className="w-3 h-3" />} value={`$${result.costUsd.toFixed(5)}`} color="moss" />
          </div>
        )}

        {isError && (
          <span className="text-xs text-[oklch(0.5_0.18_25)] font-mono shrink-0">Error</span>
        )}

        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Speed bar */}
      {!isError && (
        <div className="px-4 pb-2">
          <div className="h-1.5 rounded-full bg-[oklch(0.2_0.01_55)] overflow-hidden">
            <div
              className="h-full rounded-full lava-flow transition-all duration-500"
              style={{ width: `${speedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border/30 p-4 space-y-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          {isError ? (
            <div className="p-3 rounded-lg bg-[oklch(0.5_0.18_25_/_10%)] border border-[oklch(0.5_0.18_25_/_20%)]">
              <p className="text-sm text-[oklch(0.65_0.18_25)]">{result.errorMessage || "Unknown error"}</p>
            </div>
          ) : (
            <>
              {/* Detailed metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DetailMetric label="Tokens/sec" value={result.tokensPerSecond.toString()} />
                <DetailMetric label="Total Latency" value={`${result.latencyMs}ms`} />
                <DetailMetric label="Time to First Token" value={`${result.timeToFirstToken}ms`} />
                <DetailMetric label="Cost" value={`$${result.costUsd.toFixed(6)}`} />
                <DetailMetric label="Input Tokens" value={result.inputTokens.toString()} />
                <DetailMetric label="Output Tokens" value={result.outputTokens.toString()} />
                <DetailMetric label="Total Tokens" value={result.totalTokens.toString()} />
                <DetailMetric label="Status" value={result.status} />
              </div>

              {/* Response */}
              {result.response && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Response</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCopy(); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[oklch(0.5_0.12_145)]" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-[oklch(0.14_0.01_55)] border border-border/20 text-sm text-foreground/90 leading-relaxed max-h-[300px] overflow-y-auto font-sans">
                    {result.response}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBadge({ icon, value, unit, color }: { icon: React.ReactNode; value: string; unit?: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-mono text-foreground">{value}</span>
      {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-md bg-[oklch(0.16_0.01_55_/_50%)]">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-mono text-foreground">{value}</p>
    </div>
  );
}
