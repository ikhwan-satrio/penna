# Penna

**Penna** is a fast, lightweight Markdown note-taking desktop application built with **Tauri** and a modern web frontend for a distraction-free, responsive writing workflow.

![License](https://img.shields.io/github/license/ikhwan-satrio/penna?style=flat-square)
![Release](https://img.shields.io/github/v/release/ikhwan-satrio/penna?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Linux-blue?style=flat-square)

---

## ✨ Key Features

* **Multi-Tab Editor:** Open and manage multiple Markdown documents side by side like a modern code editor.
* **Live Markdown Preview:** Inspect rendered Markdown formatting in real time as you write.
* **Lightweight Footprint:** Powered by a Rust backend via **Tauri**, offering smaller binaries and lower memory usage than Electron-based alternatives.
* **Fast Keyboard Shortcuts:** Save documents (`Ctrl+S`), switch tabs, and navigate files smoothly from the keyboard.
* **Unsaved Changes Protection:** Prompts for confirmation before closing tabs with unsaved edits.

---

## 🚀 Installation & Usage

### 1. Nix Flake (Recommended for NixOS / Nix)

Run directly without installing permanently:

```bash
nix run github:ikhwan-satrio/penna

```

Force Nix to refresh its flake evaluation cache before running:

```bash
nix run --refresh github:ikhwan-satrio/penna

```

Or add it as an input in your system or Home Manager `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    penna.url = "github:ikhwan-satrio/penna";
  };

  outputs = { self, nixpkgs, penna, ... }: {
    # Add penna.packages.${system}.default to your packages list
  };
}

```

### 2. Linux Release Packages (`.deb` / `.AppImage`)

Download the latest release bundles from the [GitHub Releases](https://github.com/ikhwan-satrio/penna/releases) page:

* **Debian / Ubuntu:**
```bash
sudo dpkg -i penna_*_amd64.deb
sudo apt-get install -f

```


* **AppImage (Other Linux Distributions):**
```bash
chmod +x penna_*_amd64.AppImage
./penna_*_amd64.AppImage

```



---

## 🛠️ Local Development

### Prerequisites

* [Bun](https://bun.sh/)
* [Rust & Cargo](https://www.rust-lang.org/tools/install)
* Tauri system dependencies (on Debian/Ubuntu):
```bash
sudo apt-get update && sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

```



### Run in Development Mode

1. **Clone the repository:**
```bash
git clone [https://github.com/ikhwan-satrio/penna.git](https://github.com/ikhwan-satrio/penna.git)
cd penna

```


2. **Install frontend dependencies:**
```bash
bun install

```


3. **Start the Tauri app:**
```bash
bun run tauri dev

```



### Build for Production

```bash
bun run tauri build

```

Generated bundles are placed under `src-tauri/target/release/bundle/`.

---

## 📦 Releases & CI/CD

GitHub Actions automates releases and flake updates:

1. Push a version tag (e.g., `git tag v1.4.1 && git push origin v1.4.1`) or trigger the release workflow manually via `workflow_dispatch`.
2. The pipeline syncs versions across Tauri configuration files, builds release bundles, publishes the GitHub Release with generated commit notes, and updates the SHA-256 hash and version metadata in `flake.nix`.

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](https://www.google.com/search?q=./LICENSE) file.
