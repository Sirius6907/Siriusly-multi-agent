---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `siriusly run`

One-command bootstrap and start:

```sh
pnpm siriusly run
```

Does:

1. Auto-onboards if config is missing
2. Runs `siriusly doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm siriusly run --instance dev
```

## `siriusly onboard`

Interactive first-time setup:

```sh
pnpm siriusly onboard
```

If Sirius EcoSystem is already configured, rerunning `onboard` keeps the existing config in place. Use `siriusly configure` to change settings on an existing install.

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm siriusly onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm siriusly onboard --yes
```

On an existing install, `--yes` now preserves the current config and just starts Sirius EcoSystem with that setup.

## `siriusly doctor`

Health checks with optional auto-repair:

```sh
pnpm siriusly doctor
pnpm siriusly doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration
- Storage configuration
- Missing key files

## `siriusly configure`

Update configuration sections:

```sh
pnpm siriusly configure --section server
pnpm siriusly configure --section secrets
pnpm siriusly configure --section storage
```

## `siriusly env`

Show resolved environment configuration:

```sh
pnpm siriusly env
```

## `siriusly allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm siriusly allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.sirius/instances/default/config.json` |
| Database | `~/.sirius/instances/default/db` |
| Logs | `~/.sirius/instances/default/logs` |
| Storage | `~/.sirius/instances/default/data/storage` |
| Secrets key | `~/.sirius/instances/default/secrets/master.key` |

Override with:

```sh
SIRIUS_HOME=/custom/home SIRIUS_INSTANCE_ID=dev pnpm siriusly run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm siriusly run --data-dir ./tmp/sirius-dev
pnpm siriusly doctor --data-dir ./tmp/sirius-dev
```
