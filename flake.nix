{
  description = "penna built from GitHub Release .deb";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        version = "1.0.0";
        debFileName = "penna-${version}-linux-x86_64.deb";

        releaseHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

        src = pkgs.fetchurl {
          url = "https://github.com/ikhwan-satrio/penna/releases/download/v${version}/penna_${version}_amd64.deb";
          hash = releaseHash;
        };
      in
      {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "penna";
          inherit version src;

          nativeBuildInputs = [
            pkgs.dpkg
            pkgs.autoPatchelfHook
          ];

          dontUnpack = true;

          installPhase = ''
            dpkg -x $src $out

            if [ -d "$out/usr" ]; then
              mv $out/usr/* $out/
              rmdir $out/usr 2>/dev/null || true
            fi

            chmod +x $out/bin/penna
          '';
        };
      }
    );
}
