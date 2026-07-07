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

build-bin:
    cd packages/mdopen && bun run build:bin

open file:
    ./packages/mdopen/bin/mdopen '{{file}}'

# Visual regression tests
test-visual:
    cd packages/mdopen && bun run build:bin && time npx playwright test tests/visual.spec.ts

# Update visual regression baselines
test-visual-update:
    cd packages/mdopen && bun run build:bin && npx playwright test tests/visual.spec.ts --update-snapshots

# Show visual regression test report
test-visual-report:
    cd packages/mdopen && npx playwright show-report tests/playwright-report
