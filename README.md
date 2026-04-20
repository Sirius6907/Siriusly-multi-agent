# Siriusly 👑

**The premiere control plane for autonomous AI organizations.**

---

### ⏱️ HR Scan (30-Second Summary)

*   **Problem:** Single-shot AI tools lack the memory, hierarchy, and governance required to run complex, multi-month business operations autonomously.
*   **The Value:** Siriusly is an **enterprise-grade orchestration platform** that instantiates virtual companies with a full hierarchy of agents (CEO, CTO, Engineers) working toward strategic goals.
*   **Business Impact:** Enables "Zero-Human" operations with deterministic oversight, auditable task ledgers, and strict budgetary governance.

---

### 🧠 Architectural Excellence (5-Minute Engineers' Deep Dive)

Siriusly operates as a **cybernetic control plane**, splitting concerns between a reactive UI, a persistent relational ledger, and an asynchronous heartbeat scheduler.

#### Key Architectural Decisions & Tradeoffs:
1.  **Heartbeat-Driven Autonomy:** Instead of waiting for human prompts, agents wake up on cron-based heartbeats to assess their environment and task queues. *Decision: Prioritized autonomous momentum over manual session management.*
2.  **Relational State Persistence:** Built on PostgreSQL (with Drizzle ORM) to manage complex agentic hierarchies, nested task dependencies, and fine-grained budget tracking.
3.  **Local-First / WASM-Ready:** Supports both cloud-hosted PostgreSQL and embedded zero-config **PGLite** (WASM) for instant local development without infrastructure overhead.

#### My Engineering Ownership:
*   **Lead Architect:** I designed the entire control plane architecture and the hierarchical agentic loop.
*   **State Management:** Engineered the relational schema to support deterministic, multi-tenant agent operations.
*   **UI/UX:** Built the 3D ASCII-rasterized dashboard and terminal-driven onboarding CLI.

---

### 🚀 Getting Started (Local Development)

1.  **Clone:** `git clone https://github.com/Sirius6907/Siriusly-multi-agent.git`
2.  **Install:** `pnpm install`
3.  **Run:** `pnpm dev`
4.  **Onboard:** In a new terminal, run `pnpm siriusly onboard` to launch your first virtual company.

---

### 🛠️ Tech Stack

*   **Runtime:** Node.js / Express
*   **Frontend:** React 18 / Vite / GSAP (for high-end interactions)
*   **DB/ORM:** PostgreSQL / Drizzle ORM / PGLite
*   **Interface:** WebSockets for real-time telemetry

---

### 🧬 Writing Custom Agent Adapters
Siriusly is unopinionated. You can wire up any LLM or external tool securely via `packages/adapters/`. Our model-agnostic heartbeat hook ensures seamless integration with OpenAI, Anthropic, or local inference engines.

---

### 📜 License
MIT License. Created by [Sirius](https://github.com/Sirius6907).

_“The future of companies is zero-human latency and 100% human governance.”_ 👑
