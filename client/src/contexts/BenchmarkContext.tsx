/*
 * BenchmarkContext — Central state for AI model benchmarking
 * Manages model data, benchmark runs, history, and demo/live mode toggle
 */
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  category: "flagship" | "mid" | "budget" | "open-source";
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  modelName: string;
  provider: string;
  prompt: string;
  response: string;
  tokensPerSecond: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  timeToFirstToken: number;
  costUsd: number;
  timestamp: number;
  status: "success" | "error" | "timeout";
  errorMessage?: string;
}

export interface BenchmarkRun {
  id: string;
  prompt: string;
  models: string[];
  results: BenchmarkResult[];
  startedAt: number;
  completedAt?: number;
  status: "running" | "completed" | "partial";
}

interface BenchmarkContextType {
  models: ModelInfo[];
  runs: BenchmarkRun[];
  currentRun: BenchmarkRun | null;
  isRunning: boolean;
  isDemoMode: boolean;
  setDemoMode: (v: boolean) => void;
  runBenchmark: (prompt: string, modelIds: string[]) => Promise<void>;
  clearHistory: () => void;
  getLeaderboard: () => LeaderboardEntry[];
}

export interface LeaderboardEntry {
  modelId: string;
  modelName: string;
  provider: string;
  avgTokensPerSec: number;
  avgLatencyMs: number;
  avgCostPer1kTokens: number;
  totalRuns: number;
  successRate: number;
  avgTimeToFirstToken: number;
}

const BenchmarkContext = createContext<BenchmarkContextType | null>(null);

// ── Available Models ───────────────────────────────────────────────────
const MODELS: ModelInfo[] = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", contextWindow: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6, category: "budget" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", contextWindow: 200000, inputCostPer1M: 0.25, outputCostPer1M: 1.25, category: "budget" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google", contextWindow: 2000000, inputCostPer1M: 1.25, outputCostPer1M: 5, category: "flagship" },
  { id: "google/gemini-flash-1.5", name: "Gemini Flash 1.5", provider: "Google", contextWindow: 1000000, inputCostPer1M: 0.075, outputCostPer1M: 0.3, category: "budget" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta", contextWindow: 131072, inputCostPer1M: 0.52, outputCostPer1M: 0.75, category: "open-source" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "Meta", contextWindow: 131072, inputCostPer1M: 0.055, outputCostPer1M: 0.055, category: "open-source" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", contextWindow: 128000, inputCostPer1M: 2, outputCostPer1M: 6, category: "mid" },
  { id: "mistralai/mistral-small", name: "Mistral Small", provider: "Mistral", contextWindow: 32000, inputCostPer1M: 0.2, outputCostPer1M: 0.6, category: "budget" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek", contextWindow: 64000, inputCostPer1M: 0.14, outputCostPer1M: 0.28, category: "mid" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "Alibaba", contextWindow: 131072, inputCostPer1M: 0.35, outputCostPer1M: 0.4, category: "open-source" },
];

// ── Demo Data Generator ────────────────────────────────────────────────
function generateDemoResult(modelId: string, prompt: string): BenchmarkResult {
  const model = MODELS.find(m => m.id === modelId)!;
  const baseSpeed = model.category === "flagship" ? 45 : model.category === "mid" ? 65 : model.category === "budget" ? 90 : 55;
  const variance = () => 0.7 + Math.random() * 0.6;
  const tps = baseSpeed * variance();
  const outputTokens = 120 + Math.floor(Math.random() * 280);
  const inputTokens = Math.floor(prompt.length / 4);
  const latency = (outputTokens / tps) * 1000 + 200 + Math.random() * 800;
  const ttft = 100 + Math.random() * 600;
  const cost = (inputTokens * model.inputCostPer1M + outputTokens * model.outputCostPer1M) / 1_000_000;

  const responses: Record<string, string> = {
    "openai/gpt-4o": "GPT-4o provides a comprehensive analysis with strong reasoning capabilities and nuanced understanding of context...",
    "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet offers detailed, well-structured responses with careful attention to safety and accuracy...",
    "google/gemini-pro-1.5": "Gemini Pro 1.5 leverages its massive context window to provide thorough, multi-faceted responses...",
    "meta-llama/llama-3.1-70b-instruct": "Llama 3.1 70B delivers strong open-source performance with competitive reasoning abilities...",
  };

  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    modelId,
    modelName: model.name,
    provider: model.provider,
    prompt,
    response: responses[modelId] || `${model.name} generated a detailed response to the benchmark prompt with ${outputTokens} tokens...`,
    tokensPerSecond: Math.round(tps * 10) / 10,
    totalTokens: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
    latencyMs: Math.round(latency),
    timeToFirstToken: Math.round(ttft),
    costUsd: Math.round(cost * 1_000_000) / 1_000_000,
    timestamp: Date.now(),
    status: Math.random() > 0.05 ? "success" : "error",
    errorMessage: Math.random() > 0.05 ? undefined : "Rate limit exceeded",
  };
}

// ── Provider ───────────────────────────────────────────────────────────
export function BenchmarkProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [currentRun, setCurrentRun] = useState<BenchmarkRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDemoMode, setDemoMode] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const runBenchmark = useCallback(async (prompt: string, modelIds: string[]) => {
    if (isRunning) return;
    setIsRunning(true);
    abortRef.current = new AbortController();

    const runId = `run-${Date.now()}`;
    const newRun: BenchmarkRun = {
      id: runId,
      prompt,
      models: modelIds,
      results: [],
      startedAt: Date.now(),
      status: "running",
    };
    setCurrentRun(newRun);

    const results: BenchmarkResult[] = [];

    for (const modelId of modelIds) {
      if (abortRef.current?.signal.aborted) break;

      try {
        let result: BenchmarkResult;

        if (isDemoMode) {
          // Simulate network delay
          await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
          result = generateDemoResult(modelId, prompt);
        } else {
          // Live OpenRouter API call
          const model = MODELS.find(m => m.id === modelId)!;
          const startTime = performance.now();
          let firstTokenTime = 0;

          const apiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';
          if (!apiKey) {
            result = {
              id: `err-${Date.now()}-${modelId}`,
              modelId,
              modelName: model.name,
              provider: model.provider,
              prompt,
              response: "",
              tokensPerSecond: 0,
              totalTokens: 0,
              inputTokens: 0,
              outputTokens: 0,
              latencyMs: 0,
              timeToFirstToken: 0,
              costUsd: 0,
              timestamp: Date.now(),
              status: "error",
              errorMessage: "No API key configured. Set VITE_OPENROUTER_API_KEY or use Demo Mode.",
            };
          } else {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "AI Benchmarking Tool",
              },
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
                stream: false,
              }),
              signal: abortRef.current?.signal,
            });

            const endTime = performance.now();
            const data = await res.json();

            if (data.error) {
              result = {
                id: `err-${Date.now()}-${modelId}`,
                modelId,
                modelName: model.name,
                provider: model.provider,
                prompt,
                response: "",
                tokensPerSecond: 0,
                totalTokens: 0,
                inputTokens: 0,
                outputTokens: 0,
                latencyMs: Math.round(endTime - startTime),
                timeToFirstToken: 0,
                costUsd: 0,
                timestamp: Date.now(),
                status: "error",
                errorMessage: data.error.message || "API error",
              };
            } else {
              const usage = data.usage || {};
              const totalMs = endTime - startTime;
              const outTokens = usage.completion_tokens || 0;
              const inTokens = usage.prompt_tokens || 0;
              const tps = outTokens > 0 ? (outTokens / (totalMs / 1000)) : 0;
              const cost = (inTokens * model.inputCostPer1M + outTokens * model.outputCostPer1M) / 1_000_000;

              result = {
                id: `live-${Date.now()}-${modelId}`,
                modelId,
                modelName: model.name,
                provider: model.provider,
                prompt,
                response: data.choices?.[0]?.message?.content || "",
                tokensPerSecond: Math.round(tps * 10) / 10,
                totalTokens: inTokens + outTokens,
                inputTokens: inTokens,
                outputTokens: outTokens,
                latencyMs: Math.round(totalMs),
                timeToFirstToken: Math.round(totalMs * 0.15),
                costUsd: Math.round(cost * 1_000_000) / 1_000_000,
                timestamp: Date.now(),
                status: "success",
              };
            }
          }
        }

        results.push(result);
        setCurrentRun(prev => prev ? { ...prev, results: [...results] } : null);
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        const model = MODELS.find(m => m.id === modelId)!;
        results.push({
          id: `err-${Date.now()}-${modelId}`,
          modelId,
          modelName: model.name,
          provider: model.provider,
          prompt,
          response: "",
          tokensPerSecond: 0,
          totalTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: 0,
          timeToFirstToken: 0,
          costUsd: 0,
          timestamp: Date.now(),
          status: "error",
          errorMessage: err.message || "Unknown error",
        });
        setCurrentRun(prev => prev ? { ...prev, results: [...results] } : null);
      }
    }

    const completedRun: BenchmarkRun = {
      ...newRun,
      results,
      completedAt: Date.now(),
      status: results.some(r => r.status === "error") ? "partial" : "completed",
    };
    setCurrentRun(completedRun);
    setRuns(prev => [completedRun, ...prev]);
    setIsRunning(false);
  }, [isRunning, isDemoMode]);

  const clearHistory = useCallback(() => {
    setRuns([]);
    setCurrentRun(null);
  }, []);

  const getLeaderboard = useCallback((): LeaderboardEntry[] => {
    const modelStats: Record<string, BenchmarkResult[]> = {};
    for (const run of runs) {
      for (const result of run.results) {
        if (!modelStats[result.modelId]) modelStats[result.modelId] = [];
        modelStats[result.modelId].push(result);
      }
    }

    return Object.entries(modelStats).map(([modelId, results]) => {
      const successes = results.filter(r => r.status === "success");
      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      return {
        modelId,
        modelName: results[0].modelName,
        provider: results[0].provider,
        avgTokensPerSec: Math.round(avg(successes.map(r => r.tokensPerSecond)) * 10) / 10,
        avgLatencyMs: Math.round(avg(successes.map(r => r.latencyMs))),
        avgCostPer1kTokens: successes.length
          ? Math.round(avg(successes.map(r => r.totalTokens > 0 ? (r.costUsd / r.totalTokens) * 1000 : 0)) * 1_000_000) / 1_000_000
          : 0,
        totalRuns: results.length,
        successRate: Math.round((successes.length / results.length) * 100),
        avgTimeToFirstToken: Math.round(avg(successes.map(r => r.timeToFirstToken))),
      };
    }).sort((a, b) => b.avgTokensPerSec - a.avgTokensPerSec);
  }, [runs]);

  return (
    <BenchmarkContext.Provider value={{
      models: MODELS,
      runs,
      currentRun,
      isRunning,
      isDemoMode,
      setDemoMode,
      runBenchmark,
      clearHistory,
      getLeaderboard,
    }}>
      {children}
    </BenchmarkContext.Provider>
  );
}

export function useBenchmark() {
  const ctx = useContext(BenchmarkContext);
  if (!ctx) throw new Error("useBenchmark must be used within BenchmarkProvider");
  return ctx;
}
