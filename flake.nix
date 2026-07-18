{
  description = "Penna — Markdown note-taking app with wiki links";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        version = "1.0.0";
        pname = "penna";

        # Download .deb from GitHub releases
        deb = pkgs.fetchurl {
          url = "https://github.com/ikhwan-satrio/penna/releases/download/v${version}/${pname}_${version}_amd64.deb";
          hash = "sha256:65246fcd51edf439a4c8f796754af3d53b4affb184b04724fb42a80b8ab956ef"; # Fill in after first release: nix build to get the hash
        };
      in
      {
        packages = {
          default = pkgs.stdenv.mkDerivation {
            inherit pname version;

            src = deb;

            # Required to unpack .deb
            nativeBuildInputs = with pkgs; [
              dpkg
              autoPatchelfHook
              wrapGAppsHook4
            ];

            buildInputs = with pkgs; [
              webkitgtk_4_1
              gtk3
              glib
              glib-networking
              libsoup_3
              openssl
              sqlite
              libayatana-appindicator
              librsvg
            ];

            # Extract .deb
            unpackPhase = ''
              runHook preUnpack
              mkdir -p $out
              dpkg -x $src $out
              runHook postUnpack
            '';

            # No build phase needed
            dontBuild = true;

            # Fix binary and wrap with proper env
            installPhase = ''
              runHook preInstall

              # Move everything from deb extraction to proper Nix paths
              mkdir -p $out/bin
              cp -r $out/opt/Penna/* $out/bin/ 2>/dev/null || true

              # Find the main binary
              find $out -name "penna" -type f -executable | head -1

              runHook postInstall
            '';

            # Fix runtime library paths
            postFixup = ''
              # Wrap the binary with proper env vars
              wrapProgram $out/bin/penna \
                --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath [
                  pkgs.webkitgtk_4_1
                  pkgs.gtk3
                  pkgs.glib
                  pkgs.glib-networking
                  pkgs.libsoup_3
                  pkgs.openssl
                  pkgs.sqlite
                  pkgs.libayatana-appindicator
                  pkgs.librsvg
                ]}" \
                --set GDK_BACKEND "x11" \
                --set XDG_CURRENT_DESKTOP "GNOME"
            '';

            meta = with pkgs.lib; {
              description = "Markdown note-taking desktop app with wiki links and vim motions";
              homepage = "https://github.com/ikhwan-satrio/penna";
              license = licenses.mit;
              maintainers = [ ];
              platforms = [ "x86_64-linux" ];
              mainProgram = "penna";
            };
          };
        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            pkg-config
            wrapGAppsHook4
          ];

          buildInputs = with pkgs; [
            webkitgtk_4_1
            gtk3
            glib
            glib-networking
            libsoup_3
            openssl
            sqlite
            libayatana-appindicator
            librsvg
          ];

          shellHook = ''
            export XDG_DATA_DIRS="$GSETTINGS_SCHEMAS_PATH"
          '';
        };
      }
    );
}
