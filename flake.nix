{
  description = "penna built from GitHub Release";

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
        releaseHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

        src = pkgs.fetchurl {
          url = "https://github.com/ikhwan-satrio/penna/releases/download/v${version}/penna-${version}-linux-x86_64.tar.gz";
          hash = releaseHash;
        };
      in
      {
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "penna";
          inherit version src;

          dontUnpack = true;
          installPhase = ''
            mkdir -p $out/bin
            tar -xzf $src -C $out/bin
            chmod +x $out/bin/penna
          '';
        };
      }
    );
}
