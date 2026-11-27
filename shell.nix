{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pkg-config
    bun
  ];

  buildInputs = with pkgs; [
    gtk3
    glib
    cairo
    pango
    gdk-pixbuf
    atk
    libsoup_3
    webkitgtk_4_1
    librsvg
    openssl
  ];

  # Often needed on NixOS so GSettings schemas and WebKit/GTK work cleanly at runtime.
  # Set in shellHook so "$XDG_DATA_DIRS" is expanded by the shell, not stored literally.
  shellHook = ''
    export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS"
  '';
}
