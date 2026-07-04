install:
    cd packages/mdopen && bun run build && bun install /tmp/pi-open-message-in-browser/packages/mdopen

install-extension:
    pi install /tmp/pi-open-message-in-browser/packages/pi-open-message-in-browser

install-all:
    just install
    just install-extension