install:
    cd packages/mdopen && bun run build && bun link

install-extension:
    pi install packages/pi-open-message-in-browser

install-all:
    just install
    just install-extension

# Build mdopen
build:
    cd packages/mdopen && bun run build

open file:
    node packages/mdopen/dist/cli.js '{{file}}'
