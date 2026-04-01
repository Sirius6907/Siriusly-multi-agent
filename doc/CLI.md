# CLI Reference

Sirius EcoSystem CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm siriusly --help
```

First-time local bootstrap + run:

```sh
pnpm siriusly run
```

Choose local instance:

```sh
pnpm siriusly run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `siriusly onboard` and `siriusly configure --section server` set deployment mode in config
- runtime can override mode with `SIRIUS_DEPLOYMENT_MODE`
- `siriusly run` and `siriusly doctor` do not yet expose a direct `--mode` flag

Target behavior (planned) is documented in `doc/DEPLOYMENT-MODES.md` section 5.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm siriusly allowed-hostname dotta-macbook-pro
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.sirius`:

```sh
pnpm siriusly run --data-dir ./tmp/sirius-dev
pnpm siriusly issue list --data-dir ./tmp/sirius-dev
```

## Context Profiles

Store local defaults in `~/.sirius/context.json`:

```sh
pnpm siriusly context set --api-base http://localhost:3100 --company-id <company-id>
pnpm siriusly context show
pnpm siriusly context list
pnpm siriusly context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm siriusly context set --api-key-env-var-name SIRIUS_API_KEY
export SIRIUS_API_KEY=...
```

## Company Commands

```sh
pnpm siriusly company list
pnpm siriusly company get <company-id>
pnpm siriusly company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm siriusly company delete PAP --yes --confirm PAP
pnpm siriusly company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `SIRIUS_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `SIRIUS_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm siriusly issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm siriusly issue get <issue-id-or-identifier>
pnpm siriusly issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm siriusly issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm siriusly issue comment <issue-id> --body "..." [--reopen]
pnpm siriusly issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm siriusly issue release <issue-id>
```

## Agent Commands

```sh
pnpm siriusly agent list --company-id <company-id>
pnpm siriusly agent get <agent-id>
pnpm siriusly agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a Sirius EcoSystem agent:

- creates a new long-lived agent API key
- installs missing Sirius EcoSystem skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `SIRIUS_API_URL`, `SIRIUS_COMPANY_ID`, `SIRIUS_AGENT_ID`, and `SIRIUS_API_KEY`

Example for shortname-based local setup:

```sh
pnpm siriusly agent local-cli codexcoder --company-id <company-id>
pnpm siriusly agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm siriusly approval list --company-id <company-id> [--status pending]
pnpm siriusly approval get <approval-id>
pnpm siriusly approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm siriusly approval approve <approval-id> [--decision-note "..."]
pnpm siriusly approval reject <approval-id> [--decision-note "..."]
pnpm siriusly approval request-revision <approval-id> [--decision-note "..."]
pnpm siriusly approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm siriusly approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm siriusly activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm siriusly dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm siriusly heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.sirius/instances/default`:

- config: `~/.sirius/instances/default/config.json`
- embedded db: `~/.sirius/instances/default/db`
- logs: `~/.sirius/instances/default/logs`
- storage: `~/.sirius/instances/default/data/storage`
- secrets key: `~/.sirius/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
SIRIUS_HOME=/custom/home SIRIUS_INSTANCE_ID=dev pnpm siriusly run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm siriusly configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
