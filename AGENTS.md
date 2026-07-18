# AGENTS.md

## Project

Penna is a **SvelteKit + Tauri v2** desktop app (Markdown note app).

- **Frontend**: SvelteKit (Svelte 5 runes mode), TailwindCSS v4, TypeScript, shadcn-svelte (vega style, lucide icons)
- **Backend**: Rust via Tauri v2 (`src-tauri/`)
- **Package manager**: bun (lockfile: `bun.lock`)
- **Static adapter** — SPA mode: `prerender = true`, `csr = true`, `ssr = false` (`src/routes/+layout.ts`)

## Commands

All frontend commands use `bun run`:

```sh
bun run dev          # Vite dev server (port 5173)
bun run build        # Production build (outputs to build/)
bun run preview      # Preview production build
bun run check        # svelte-check typecheck (requires svelte-kit sync first)
bun run check:watch  # Typecheck in watch mode
bun run lint         # prettier --check .
bun run format       # prettier --write .
bun run tauri <cmd>  # Tauri CLI (e.g. bun run tauri dev, bun run tauri build)
```

Tauri auto-runs `bun dev` before dev and `bun run build` before build (see `src-tauri/tauri.conf.json`).

## Validation order

`bun run lint` → `bun run check` → test if tests exist

## Code style

- **Prettier**: tabs, single quotes, no trailing commas, 100 print width
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Svelte files use `parser: 'svelte'` override
- CSS files associated with TailwindCSS in `.vscode/settings.json`

## Structure

- `src/routes/` — SvelteKit pages (currently just the root page)
- `src/lib/` — shared Svelte code via `$lib` alias
  - `src/lib/components/ui/` — shadcn-svelte components (add via `bunx shadcn-svelte add <component>`)
  - `src/lib/stores/` — Svelte stores for state management
- `src-tauri/src/` — Rust backend entrypoints (`main.rs`, `lib.rs`)
- `build/` — frontend build output consumed by Tauri

## Installed shadcn-svelte components

Layout & Navigation: `tabs`, `resizable`, `scroll-area`, `separator`, `sidebar`, `collapsible`, `dropdown-menu`, `tooltip`
Form & Input: `button`, `input`, `textarea`, `toggle`, `toggle-group`
Feedback & Overlay: `dialog`, `badge`, `skeleton`, `sheet`

Add new components: `bunx shadcn-svelte@latest add <component-name>`

## Architecture (planned)

- **Tab system** — multiple notes open as tabs (use `tabs` + `dropdown-menu`)
- **Split view** — left side: text editor (Markdown), right side: Markdown preview (use `resizable`)
- Components should go in `src/lib/` as they're shared UI

## Tauri plugins

- `tauri-plugin-dialog` — native file dialogs (directory picker)
- `tauri-plugin-store` — persistent key-value storage
- `tauri-plugin-fs` — file system access

Config stored at: `{app_config_dir}/config.json`
