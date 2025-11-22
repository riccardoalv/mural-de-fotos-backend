{
  description = "NixOS environment";

  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable"; };

  outputs = { self, nixpkgs, }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell.${system} = with pkgs;
        mkShell {
          packages = [
            nodejs_22
            yarn
            nodePackages.typescript
            nodePackages.typescript-language-server
            openssl
            pkg-config
            pre-commit
            cmake
            pkgs.poetry
            pkgs.python312Packages.pip
            pkgs.python312
            pkgs.pyright
            pkgs.pre-commit
            pkgs.commitizen
            pkgs.postgresql
            pkgs.git
            pkgs.docker-compose
            pkgs.ruff
            pkgs.gettext
          ];
          shellHook = ''
            export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
            export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
            export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
            npx husky
          '';
        };
    };
}
