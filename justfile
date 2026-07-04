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

# Convert and open markdown file in brave
open file:
    node packages/mdopen/dist/cli.js {{file}} -b brave

# Convert all markdown files in current directory
open-all:
    for f in *.md; do node packages/mdopen/dist/cli.js "$f" -b brave; done

# Open with dark theme
dark file:
    node packages/mdopen/dist/cli.js {{file}} --theme github-dark -b brave

# Open with TOC sidebar
toc file:
    node packages/mdopen/dist/cli.js {{file}} --toc -b brave

# Open with MathJax support
math file:
    node packages/mdopen/dist/cli.js {{file}} --math -b brave

# Open with specific theme
theme file theme-name:
    node packages/mdopen/dist/cli.js {{file}} --theme {{theme-name}} -b brave

# Convert to HTML file (no browser)
convert file:
    node packages/mdopen/dist/cli.js {{file}} --no-open --out /tmp/$(basename {{file}} .md).html

# Test all features with all-markdown-elements.md
test:
    node packages/mdopen/dist/cli.js all-markdown-elements.md --math --toc -b brave
