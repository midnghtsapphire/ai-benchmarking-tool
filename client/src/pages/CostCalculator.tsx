/*
 * Cost Calculator — Estimate costs for different usage scenarios
 * Interactive sliders for tokens, requests, and model comparison
 * Design: Volcanic Observatory — warm data visualization
 */
import { useState, useMemo } from "react";
import { useBenchmark } from "@/contexts/BenchmarkContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

const USAGE_PRESETS = [
  { label: "Light (Hobby)", inputTokensPerReq: 500, outputTokensPerReq: 200, requestsPerDay: 50 },
  { label: "Medium (Startup)", inputTokensPerReq: 1000, outputTokensPerReq: 500, requestsPerDay: 500 },
  { label: "Heavy (Enterprise)", inputTokensPerReq: 2000, outputTokensPerReq: 1000, requestsPerDay: 5000 },
  { label: "RAG Pipeline", inputTokensPerReq: 4000, outputTokensPerReq: 800, requestsPerDay: 2000 },
  { label: "Chatbot", inputTokensPerReq: 800, outputTokensPerReq: 400, requestsPerDay: 10000 },
];

const BAR_COLORS = [
  "oklch(0.65 0.14 75)",   // gold
  "oklch(0.5 0.16 30)",    // magma
  "oklch(0.42 0.1 145)",   // moss
  "oklch(0.55 0.18 45)",   // ember
  "oklch(0.6 0.12 100)",   // olive
  "oklch(0.5 0.12 60)",    // bronze
  "oklch(0.45 0.08 35)",   // rust
  "oklch(0.55 0.06 55)",   // warm gray
  "oklch(0.48 0.14 40)",   // terracotta
  "oklch(0.58 0.1 120)",   // sage
  "oklch(0.52 0.15 55)",   // copper
  "oklch(0.4 0.12 20)",    // dark red
];

export default function CostCalculator() {
  const { models } = useBenchmark();
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(500);
  const [selectedPreset, setSelectedPreset] = useState("Medium (Startup)");

  const applyPreset = (label: string) => {
    const preset = USAGE_PRESETS.find(p => p.label === label);
    if (preset) {
      setInputTokens(preset.inputTokensPerReq);
      setOutputTokens(preset.outputTokensPerReq);
      setRequestsPerDay(preset.requestsPerDay);
      setSelectedPreset(label);
    }
  };

  const costs = useMemo(() => {
    return models.map(model => {
      const costPerReq = (inputTokens * model.inputCostPer1M + outputTokens * model.outputCostPer1M) / 1_000_000;
      const dailyCost = costPerReq * requestsPerDay;
      const monthlyCost = dailyCost * 30;
      const yearlyCost = monthlyCost * 12;
      return {
        ...model,
        costPerReq,
        dailyCost,
        monthlyCost,
        yearlyCost,
      };
    }).sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [models, inputTokens, outputTokens, requestsPerDay]);

  const chartData = useMemo(() => {
    return costs.map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 12) + "…" : c.name,
      fullName: c.name,
      monthly: Math.round(c.monthlyCost * 100) / 100,
      provider: c.provider,
    }));
  }, [costs]);

  const cheapest = costs[0];
  const mostExpensive = costs[costs.length - 1];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground">Cost Calculator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate and compare costs across models for your usage scenario
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Preset selector */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <Label className="text-sm font-medium text-foreground">Usage Preset</Label>
            <Select value={selectedPreset} onValueChange={applyPreset}>
              <SelectTrigger className="bg-[oklch(0.14_0.01_55)] border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[oklch(0.2_0.014_55)] border-border/40">
                {USAGE_PRESETS.map(p => (
                  <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sliders */}
          <div className="glass-panel rounded-xl p-4 space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm text-foreground">Input Tokens / Request</Label>
                <span className="text-sm font-mono text-[oklch(0.65_0.14_75)]">{inputTokens.toLocaleString()}</span>
              </div>
              <Slider
                value={[inputTokens]}
                onValueChange={([v]) => setInputTokens(v)}
                min={100}
                max={10000}
                step={100}
                className="[&_[role=slider]]:bg-[oklch(0.65_0.14_75)] [&_[role=slider]]:border-[oklch(0.65_0.14_75)]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm text-foreground">Output Tokens / Request</Label>
                <span className="text-sm font-mono text-[oklch(0.65_0.14_75)]">{outputTokens.toLocaleString()}</span>
              </div>
              <Slider
                value={[outputTokens]}
                onValueChange={([v]) => setOutputTokens(v)}
                min={50}
                max={5000}
                step={50}
                className="[&_[role=slider]]:bg-[oklch(0.65_0.14_75)] [&_[role=slider]]:border-[oklch(0.65_0.14_75)]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm text-foreground">Requests / Day</Label>
                <span className="text-sm font-mono text-[oklch(0.65_0.14_75)]">{requestsPerDay.toLocaleString()}</span>
              </div>
              <Slider
                value={[requestsPerDay]}
                onValueChange={([v]) => setRequestsPerDay(v)}
                min={10}
                max={50000}
                step={10}
                className="[&_[role=slider]]:bg-[oklch(0.65_0.14_75)] [&_[role=slider]]:border-[oklch(0.65_0.14_75)]"
              />
            </div>
          </div>

          {/* Summary */}
          {cheapest && (
            <div className="glass-panel rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[oklch(0.55_0.1_145)]" />
                Best Value
              </h4>
              <div className="p-3 rounded-lg bg-[oklch(0.42_0.1_145_/_8%)] border border-[oklch(0.42_0.1_145_/_20%)]">
                <p className="text-sm font-medium text-foreground">{cheapest.name}</p>
                <p className="text-xs text-muted-foreground">{cheapest.provider}</p>
                <p className="text-lg font-mono text-[oklch(0.55_0.1_145)] mt-1">
                  ${cheapest.monthlyCost.toFixed(2)}<span className="text-xs text-muted-foreground">/mo</span>
                </p>
              </div>
              {mostExpensive && cheapest.monthlyCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.round(mostExpensive.monthlyCost / cheapest.monthlyCost)}x cheaper than {mostExpensive.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Chart + Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-display text-lg text-foreground mb-4">Monthly Cost Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 55)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.62 0.02 65)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="oklch(0.28 0.012 55)"
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.62 0.02 65)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    tickFormatter={v => `$${v}`}
                    stroke="oklch(0.28 0.012 55)"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "oklch(0.2 0.014 55)",
                      border: "1px solid oklch(0.35 0.015 55 / 30%)",
                      borderRadius: "8px",
                      color: "oklch(0.88 0.02 70)",
                      fontFamily: "JetBrains Mono",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Monthly"]}
                    labelFormatter={(label: string) => {
                      const item = chartData.find(d => d.name === label);
                      return item ? `${item.fullName} (${item.provider})` : label;
                    }}
                  />
                  <Bar dataKey="monthly" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed table */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Model</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Per Request</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Daily</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Monthly</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c, i) => (
                    <tr key={c.id} className="border-b border-border/20 hover:bg-[oklch(0.2_0.012_55_/_30%)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.provider} · {c.category}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${c.costPerReq.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${c.dailyCost.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${
                        i === 0 ? "text-[oklch(0.55_0.1_145)]" : "text-foreground"
                      }`}>
                        ${c.monthlyCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${c.yearlyCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
