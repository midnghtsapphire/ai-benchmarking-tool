/*
 * Dashboard — Observatory Overview
 * Quick stats, recent runs, model overview, hero section
 * Design: Volcanic Observatory — warm obsidian glassmorphism
 */
import { useBenchmark } from "@/contexts/BenchmarkContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Trophy,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const HERO_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/PE2XMsfyY5sNodsiKMtTbc/sandbox/9aF9z3I9BMePlVXkhICOnd-img-2_1771264616000_na1fn_aGVyby1iZW5jaG1hcmstYWJzdHJhY3Q.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUEUyWE1zZnlZNXNOb2RzaUtNdFRiYy9zYW5kYm94LzlhRjl6M0k5Qk1lUGxWWGtoSUNPbmQtaW1nLTJfMTc3MTI2NDYxNjAwMF9uYTFmbl9hR1Z5YnkxaVpXNWphRzFoY21zdFlXSnpkSEpoWTNRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VrOjUkKmxjEuUcsyHRzmf1G0HRY8I1Xoro7-cpH8sITWnODF~vK6uAuncXnTAQOqJAPwCs2PBhFXLqERItlubFPXbpqvlbf3WnCWU4lNhG4dYEsOod1Z7rLWDOj1rShBXi2KTlyXRNIrV6lJZFaIUTd26KtYCNWQ7QS~aQgfo833cxDcs94rMNb2Z~eTXPckQyHVa31zfHXUJH7lbDzOwXXJRrJOq9q1pGLGGMVnTIIdVWo9T839DfciXaMK87dZoAsoTxpe~~qREDqvbO37IaKDWWVxJZqE3ERb2J9Yfp7UzXU5n9FvWxD~orp9R1zZqKBqWuRuvPFv7Xr5-DKBPg__";

export default function Dashboard() {
  const { runs, models, isDemoMode, getLeaderboard } = useBenchmark();

  const totalBenchmarks = runs.length;
  const totalResults = runs.reduce((sum, r) => sum + r.results.length, 0);
  const successResults = runs.reduce((sum, r) => sum + r.results.filter(res => res.status === "success").length, 0);
  const leaderboard = getLeaderboard();
  const topModel = leaderboard[0];

  const allResults = runs.flatMap(r => r.results).filter(r => r.status === "success");
  const avgSpeed = allResults.length
    ? Math.round(allResults.reduce((s, r) => s + r.tokensPerSecond, 0) / allResults.length * 10) / 10
    : 0;
  const totalCost = allResults.reduce((s, r) => s + r.costUsd, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Hero section */}
      <section className="relative rounded-2xl overflow-hidden h-[220px] sm:h-[260px]">
        <img
          src={HERO_IMG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[oklch(0.65_0.14_75)] mb-2">
            {isDemoMode ? "Demo Mode Active" : "Live Mode"}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-3">
            AI Model Observatory
          </h2>
          <p className="text-muted-foreground max-w-lg text-sm sm:text-base leading-relaxed">
            Benchmark, compare, and analyze AI models across providers.
            Measure speed, accuracy, and cost in real-time.
          </p>
          <div className="flex gap-3 mt-5">
            <Link href="/benchmark">
              <Button className="bg-[oklch(0.65_0.14_75)] text-[oklch(0.14_0.01_55)] hover:bg-[oklch(0.7_0.14_75)] font-semibold gap-2 shadow-lg shadow-[oklch(0.65_0.14_75_/_20%)]">
                <FlaskConical className="w-4 h-4" />
                Run Benchmark
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="border-border/60 gap-2 bg-transparent hover:bg-accent/50">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Runs"
          value={totalBenchmarks.toString()}
          icon={<FlaskConical className="w-4 h-4" />}
          color="gold"
        />
        <StatCard
          label="Avg Speed"
          value={avgSpeed > 0 ? `${avgSpeed}` : "—"}
          unit="tok/s"
          icon={<Zap className="w-4 h-4" />}
          color="ember"
        />
        <StatCard
          label="Success Rate"
          value={totalResults > 0 ? `${Math.round((successResults / totalResults) * 100)}` : "—"}
          unit="%"
          icon={<TrendingUp className="w-4 h-4" />}
          color="moss"
        />
        <StatCard
          label="Total Cost"
          value={totalCost > 0 ? `$${totalCost.toFixed(4)}` : "$0.00"}
          icon={<DollarSign className="w-4 h-4" />}
          color="magma"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent runs */}
        <div className="lg:col-span-3 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Recent Runs</h3>
            {runs.length > 0 && (
              <Link href="/history">
                <button className="text-xs text-[oklch(0.65_0.14_75)] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            )}
          </div>

          {runs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No benchmark runs yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Run your first benchmark to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 5).map(run => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.16_0.01_55_/_50%)] hover:bg-[oklch(0.2_0.012_55_/_50%)] transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    run.status === "completed" ? "bg-[oklch(0.5_0.12_145)]" :
                    run.status === "running" ? "bg-[oklch(0.65_0.14_75)] animate-pulse" :
                    "bg-[oklch(0.55_0.18_45)]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{run.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {run.results.length} model{run.results.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(run.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[oklch(0.5_0.12_145)]" />
                    <span className="text-xs font-mono text-muted-foreground">
                      {run.results.filter(r => r.status === "success").length}/{run.results.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top models */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Top Models</h3>
            {leaderboard.length > 0 && (
              <Link href="/leaderboard">
                <button className="text-xs text-[oklch(0.65_0.14_75)] hover:underline flex items-center gap-1">
                  Full rankings <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            )}
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No rankings yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Run benchmarks to populate the leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div
                  key={entry.modelId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.16_0.01_55_/_50%)]"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    i === 0 ? "bg-[oklch(0.65_0.14_75_/_20%)] text-[oklch(0.75_0.14_75)]" :
                    i === 1 ? "bg-[oklch(0.5_0.05_55_/_20%)] text-[oklch(0.7_0.03_55)]" :
                    "bg-[oklch(0.3_0.01_55_/_30%)] text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{entry.modelName}</p>
                    <p className="text-xs text-muted-foreground">{entry.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono text-[oklch(0.65_0.14_75)]">
                      {entry.avgTokensPerSec} <span className="text-xs text-muted-foreground">tok/s</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Models overview */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="font-display text-lg text-foreground mb-4">Available Models</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {models.map(model => (
            <div
              key={model.id}
              className="p-3 rounded-lg bg-[oklch(0.16_0.01_55_/_50%)] border border-border/30 ember-glow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground truncate">{model.name}</span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                  model.category === "flagship"
                    ? "bg-[oklch(0.65_0.14_75_/_15%)] text-[oklch(0.75_0.14_75)]"
                    : model.category === "mid"
                    ? "bg-[oklch(0.55_0.18_45_/_15%)] text-[oklch(0.65_0.18_45)]"
                    : model.category === "budget"
                    ? "bg-[oklch(0.42_0.1_145_/_15%)] text-[oklch(0.55_0.1_145)]"
                    : "bg-[oklch(0.4_0.05_55_/_15%)] text-[oklch(0.6_0.03_55)]"
                }`}>
                  {model.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{model.provider}</p>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground">
                <span>${model.inputCostPer1M}/M in</span>
                <span>${model.outputCostPer1M}/M out</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  color: "gold" | "ember" | "moss" | "magma";
}) {
  const colorMap = {
    gold: { bg: "oklch(0.65_0.14_75_/_10%)", text: "oklch(0.75_0.14_75)", border: "oklch(0.65_0.14_75_/_25%)" },
    ember: { bg: "oklch(0.55_0.18_45_/_10%)", text: "oklch(0.65_0.18_45)", border: "oklch(0.55_0.18_45_/_25%)" },
    moss: { bg: "oklch(0.42_0.1_145_/_10%)", text: "oklch(0.55_0.1_145)", border: "oklch(0.42_0.1_145_/_25%)" },
    magma: { bg: "oklch(0.5_0.16_30_/_10%)", text: "oklch(0.6_0.16_30)", border: "oklch(0.5_0.16_30_/_25%)" },
  };
  const c = colorMap[color];

  return (
    <div
      className="glass-panel rounded-xl p-4 ember-glow"
      style={{ borderColor: c.border }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: c.bg, color: c.text }}
        >
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="metric-value text-xl sm:text-2xl" style={{ color: c.text }}>
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground font-mono">{unit}</span>}
      </div>
    </div>
  );
}
