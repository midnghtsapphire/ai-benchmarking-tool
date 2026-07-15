# AI Benchmarking Tool


<!-- AUTO-PACKAGE-BADGES:START -->
<!-- Auto-generated package badges -->

![npm version](https://img.shields.io/npm/v/ai-benchmarking-tool?style=flat-square&logo=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dw/ai-benchmarking-tool?style=flat-square&color=brightgreen) ![npm license](https://img.shields.io/npm/l/ai-benchmarking-tool?style=flat-square) [![Deployed](https://img.shields.io/badge/deployed-1.0.0-blue?style=flat-square)](https://www.npmjs.com/package/ai-benchmarking-tool)

<!-- AUTO-PACKAGE-BADGES:END -->
A production-ready web application for benchmarking AI models across providers. Compare speed, accuracy, and cost in real-time with an interactive dashboard.

**Live Demo:** [https://midnghtsapphire.github.io/ai-benchmarking-tool/](https://midnghtsapphire.github.io/ai-benchmarking-tool/)

## Features

- **Multi-Model Benchmarking** — Run custom prompts against 12+ AI models simultaneously
- **Real-Time Leaderboard** — Sortable rankings by speed, latency, cost, and success rate
- **Cost Calculator** — Estimate monthly/yearly costs for different usage scenarios with interactive sliders
- **Performance History** — Track and review all past benchmark runs
- **Side-by-Side Comparison** — View model responses, metrics, and speed bars in one view
- **Demo Mode** — Full functionality without an API key (simulated responses)
- **Live Mode** — Connect your OpenRouter API key for real benchmarks

## Models Supported

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o Mini |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku |
| Google | Gemini Pro 1.5, Gemini Flash 1.5 |
| Meta | Llama 3.1 70B, Llama 3.1 8B |
| Mistral | Mistral Large, Mistral Small |
| DeepSeek | DeepSeek V3 |
| Alibaba | Qwen 2.5 72B |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Build:** Vite 7
- **Charts:** Recharts
- **UI Components:** shadcn/ui + Radix UI
- **Routing:** Wouter (hash-based for GitHub Pages)
- **API:** OpenRouter (unified access to multiple AI providers)

## Design

- **Theme:** Volcanic Observatory — earthy dark palette with deep reds, forest greens, warm golds, and charcoal
- **Glassmorphism:** Translucent obsidian panels with warm thermal borders
- **Accessibility:** WCAG AAA compliant, neurodivergent-friendly, zero blue light
- **Typography:** DM Serif Display + Source Sans 3 + JetBrains Mono

## Getting Started

### Demo Mode (No API Key Required)

The app works out of the box in Demo Mode with simulated responses. Just visit the live demo link above.

### Live Mode (With API Key)

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Set the environment variable:
   ```bash
   VITE_OPENROUTER_API_KEY=your_key_here
   ```
3. Toggle off "Demo Mode" in the sidebar

### Local Development

```bash
# Clone
git clone https://github.com/MIDNGHTSAPPHIRE/ai-benchmarking-tool.git
cd ai-benchmarking-tool

# Install
pnpm install

# Dev server
pnpm dev

# Build for GitHub Pages
bash deploy-ghpages.sh
```

## Deployment

The app is deployed to GitHub Pages via the `gh-pages` branch. Run `bash deploy-ghpages.sh` to build and deploy.

The build uses `vite.config.ghpages.ts` which excludes all development-only plugins and sets the correct base path.

## License

MIT

---

## Test

| Feature | Status |
|---------|--------|
| Feature | ✅ Ready |

