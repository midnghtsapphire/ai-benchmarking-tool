/*
 * AppLayout — Observatory control panel layout
 * Persistent sidebar (instrument rack) + main viewport
 * Volcanic Observatory design: obsidian glass, warm glow accents
 */
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useBenchmark } from "@/contexts/BenchmarkContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FlaskConical,
  Trophy,
  Calculator,
  History,
  ChevronLeft,
  ChevronRight,
  Activity,
  Flame,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, description: "Overview & quick stats" },
  { path: "/benchmark", label: "Benchmark", icon: FlaskConical, description: "Run model tests" },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy, description: "Model rankings" },
  { path: "/cost-calculator", label: "Cost Calculator", icon: Calculator, description: "Estimate costs" },
  { path: "/history", label: "History", icon: History, description: "Past benchmark runs" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { isDemoMode, setDemoMode, isRunning } = useBenchmark();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          flex flex-col
          glass-panel-elevated
          transition-all duration-300 ease-out
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[oklch(0.5_0.16_30)] to-[oklch(0.65_0.14_75)] flex items-center justify-center shrink-0 shadow-lg shadow-[oklch(0.5_0.16_30_/_20%)]">
            <Flame className="w-5 h-5 text-[oklch(0.95_0.02_60)]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-normal tracking-tight text-foreground leading-none">
                AI Bench
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase tracking-widest">
                Observatory
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Tooltip key={item.path} delayDuration={collapsed ? 100 : 1000}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      group relative
                      ${isActive
                        ? "bg-[oklch(0.65_0.14_75_/_12%)] text-[oklch(0.85_0.08_75)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.28_0.01_55_/_50%)]"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[oklch(0.65_0.14_75)] shadow-[0_0_8px_oklch(0.65_0.14_75_/_40%)]" />
                    )}
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[oklch(0.65_0.14_75)]" : ""}`} />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="glass-panel text-foreground border-border">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-border/50 p-3 space-y-3 shrink-0">
          {/* Demo mode toggle */}
          {!collapsed && (
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="demo-mode" className="text-xs text-muted-foreground cursor-pointer">
                Demo Mode
              </Label>
              <Switch
                id="demo-mode"
                checked={isDemoMode}
                onCheckedChange={setDemoMode}
                className="data-[state=checked]:bg-[oklch(0.42_0.1_145)] data-[state=unchecked]:bg-[oklch(0.3_0.01_55)]"
              />
            </div>
          )}

          {/* Running indicator */}
          {isRunning && (
            <div className="flex items-center gap-2 px-1">
              <Activity className="w-3.5 h-3.5 text-[oklch(0.65_0.14_75)] animate-pulse" />
              {!collapsed && (
                <span className="text-xs text-[oklch(0.65_0.14_75)] font-mono">Running...</span>
              )}
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-xs"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 glass-panel border-b border-border/50">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[oklch(0.65_0.14_75)]" />
            <span className="font-display text-base">AI Bench</span>
          </div>
          {isDemoMode && (
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[oklch(0.42_0.1_145_/_15%)] text-[oklch(0.6_0.1_145)] border border-[oklch(0.42_0.1_145_/_30%)]">
              Demo
            </span>
          )}
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>

        {/* Footer attribution */}
        <footer className="border-t border-border/30 px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            AI Benchmarking Tool — powered by free sources and APIs via{" "}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.65_0.14_75)] hover:underline">
              OpenRouter
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
