# Plugin Authoring Smoke Example

A Sirius EcoSystem plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into Sirius EcoSystem

```bash
pnpm siriusly plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@siriusly/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
