# Penna

A Markdown note-taking desktop app built with [SvelteKit](https://kit.svelte.dev) and [Tauri v2](https://v2.tauri.app/).

## Tech Stack

- **Frontend**: SvelteKit + Svelte 5 (runes mode), TailwindCSS v4, TypeScript
- **Backend**: Rust via Tauri v2
- **Package manager**: bun
- **Static adapter** — SPA mode (SSR disabled)

## Developing

```sh
bun run dev        # Vite dev server on localhost:5173
```

## Building

```sh
bun run build      # Production build to build/
bun run preview    # Preview production build
```

### Tauri (Desktop)

```sh
bun run tauri dev   # Run desktop app in dev mode
bun run tauri build # Build desktop app for distribution
```

Tauri auto-runs `bun dev` before dev and `bun run build` before build.

## Validation

```sh
bun run lint       # prettier --check .
bun run format     # prettier --write .
bun run check      # svelte-check typecheck
```

Order: `lint` → `check`
