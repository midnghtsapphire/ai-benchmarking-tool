/*
 * AI Benchmarking Tool — Volcanic Observatory Design
 * Earthy dark theme: obsidian charcoal, magma red, forest moss, molten gold
 * NO blue light. WCAG AAA. Neurodivergent-friendly.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BenchmarkProvider } from "./contexts/BenchmarkContext";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Dashboard from "./pages/Dashboard";
import Benchmark from "./pages/Benchmark";
import Leaderboard from "./pages/Leaderboard";
import CostCalculator from "./pages/CostCalculator";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/benchmark" component={Benchmark} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/cost-calculator" component={CostCalculator} />
        <Route path="/history" component={History} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WouterRouter hook={useHashLocation}>
      <ThemeProvider defaultTheme="dark">
        <BenchmarkProvider>
          <TooltipProvider>
            <Toaster
              toastOptions={{
                style: {
                  background: 'oklch(0.2 0.014 55)',
                  border: '1px solid oklch(0.35 0.015 55 / 30%)',
                  color: 'oklch(0.88 0.02 70)',
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </BenchmarkProvider>
      </ThemeProvider>
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;
