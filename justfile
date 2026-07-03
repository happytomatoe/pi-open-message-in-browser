install:
    cd packages/mdopen && bun run build && npm install -g "$(pwd)"
