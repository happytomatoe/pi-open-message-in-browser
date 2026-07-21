# Fix PrismJS Syntax Highlighting Incrementally

## Overview

Add PrismJS language components for all programming languages in `test/all-languages-test.md` that have PrismJS support (~40 languages). Currently only 8 languages are loaded (javascript, typescript, css, markup, bash, python, json, yaml). Add languages one at a time with TDD verification: unit test for Prism tokenization + Playwright visual test with screenshot.

## Current State Analysis

- **PrismJS loading**: `packages/mdopen/src/assets.ts:49-77` - `PRISM_LANGUAGES` array with 8 languages
- **markdown-it config**: `packages/mdopen/src/compilers/markdown-it.ts:29` - `langPrefix: 'language-'`
- **Client-side highlighting**: `packages/mdopen/src/template.ts:620-623` - `Prism.highlightAll()` call
- **Test file**: `test/all-languages-test.md` - 60+ languages with code blocks
- **Visual testing**: Playwright tests in `packages/mdopen/tests/visual.spec.ts`
- **Prism components available**: ~250 language files in `node_modules/prismjs/components/`

## Desired End State

- All languages in `test/all-languages-test.md` that have PrismJS components show syntax highlighting
- Each language has a small test file and corresponding unit + visual test
- Screenshots captured for each language as verification
- Languages without PrismJS support are documented

### Key Discoveries:
- PrismJS components are named `prism-{language}.js` (e.g., `prism-rust.js`, `prism-go.js`)
- Some languages have different names in Prism vs markdown (e.g., `cpp` → `prism-cpp.js`, `csharp` → `prism-csharp.js`)
- Assembly: Prism has `prism-asm6502.js`, `prism-nasm.js` but test uses `asm` - need mapping
- Regex: Prism has `prism-regex.js`
- Diff: Prism has `prism-diff.js`
- Django/Jinja: Prism has `prism-django.js`
- Twig: Prism has `prism-twig.js`
- YAML already loaded (but test has extended YAML)
- Some languages need extra CSS (e.g., `css-extras`, `jsx`)

## What We're NOT Doing

- Migrating to Shiki (separate existing plan)
- Adding languages NOT in the test file
- Fixing PrismJS grammar bugs (report and continue)
- Changing the markdown-it compiler or theme system
- Modifying mermaid integration

## Implementation Approach

**Incremental TDD per language:**
1. Add language to `PRISM_LANGUAGES` in `assets.ts`
2. Create small test markdown file for that language
3. Write unit test: load Prism, tokenize sample code, verify token types
4. Write visual test: convert markdown to HTML, load in Playwright, check for token classes, capture screenshot
5. Run both tests, verify, move to next language

## Phase 1: Audit & Test Infrastructure

### Overview
Map all test file languages to PrismJS components, create reusable test infrastructure.

### Changes Required:

#### 1. Audit Languages
**File**: (analysis task - no code change)
**Output**: `thoughts/shared/research/prism-language-mapping.md`
Map each language in test file to Prism component file or mark unsupported.

```markdown
| Test Language | Prism Component | Status |
|---------------|----------------|--------|
| javascript    | prism-javascript.js | ✅ Already loaded |
| typescript    | prism-typescript.js | ✅ Already loaded |
| css           | prism-css.js | ✅ Already loaded |
| html/markup   | prism-markup.js | ✅ Already loaded |
| bash          | prism-bash.js | ✅ Already loaded |
| python        | prism-python.js | ✅ Already loaded |
| json          | prism-json.js | ✅ Already loaded |
| yaml          | prism-yaml.js | ✅ Already loaded |
| c             | prism-c.js | 🔄 Add |
| cpp           | prism-cpp.js | 🔄 Add |
| csharp        | prism-csharp.js | 🔄 Add |
| go            | prism-go.js | 🔄 Add |
| rust          | prism-rust.js | 🔄 Add |
| java          | prism-java.js | 🔄 Add |
| kotlin        | prism-kotlin.js | 🔄 Add |
| ruby          | prism-ruby.js | 🔄 Add |
| php           | prism-php.js | 🔄 Add |
| swift         | prism-swift.js | 🔄 Add |
| scala         | prism-scala.js | 🔄 Add |
| r             | prism-r.js | 🔄 Add |
| dart          | prism-dart.js | 🔄 Add |
| lua           | prism-lua.js | 🔄 Add |
| perl          | prism-perl.js | 🔄 Add |
| elixir        | prism-elixir.js | 🔄 Add |
| haskell       | prism-haskell.js | 🔄 Add |
| clojure       | prism-clojure.js | 🔄 Add |
| ocaml         | prism-ocaml.js | 🔄 Add |
| fsharp        | prism-fsharp.js | 🔄 Add |
| erlang        | prism-erlang.js | 🔄 Add |
| julia         | prism-julia.js | 🔄 Add |
| zig           | prism-zig.js | 🔄 Add |
| sql           | prism-sql.js | 🔄 Add |
| graphql       | prism-graphql.js | 🔄 Add |
| dockerfile    | prism-docker.js | 🔄 Add |
| toml          | prism-toml.js | 🔄 Add |
| nginx         | prism-nginx.js | 🔄 Add |
| makefile      | prism-makefile.js | 🔄 Add |
| cmake         | prism-cmake.js | 🔄 Add |
| latex         | prism-latex.js | 🔄 Add |
| solidity      | prism-solidity.js | 🔄 Add |
| assembly      | prism-asm6502.js / prism-nasm.js | 🔄 Add |
| regex         | prism-regex.js | 🔄 Add |
| diff          | prism-diff.js | 🔄 Add |
| django/jinja  | prism-django.js | 🔄 Add |
| twig          | prism-twig.js | 🔄 Add |
```

#### 2. Create Unit Test Helper
**File**: `packages/mdopen/tests/prism-tokenization.test.ts`
**Changes**: Helper to load Prism and verify tokenization for a language

```typescript
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load Prism core
const prismCore = fs.readFileSync(
  require.resolve('prismjs'),
  'utf8'
);

// Helper to load a language component
function loadLanguage(lang: string): string {
  const prismDir = path.dirname(require.resolve('prismjs'));
  const langPath = path.join(prismDir, 'components', `prism-${lang}.js`);
  if (fs.existsSync(langPath)) {
    return fs.readFileSync(langPath, 'utf8');
  }
  throw new Error(`Language component not found: ${lang}`);
}

// Evaluate Prism with language
function evaluatePrism(lang: string): any {
  const context = {
    Prism: {},
    module: { exports: {} },
    exports: {},
  };
  // Note: In Node, we'd need a different approach - use Playwright browser context instead
}
```

**Better approach**: Use Playwright browser context for both unit + visual tests.

#### 3. Create Visual Test Infrastructure
**File**: `packages/mdopen/tests/language-highlighting.spec.ts`
**Changes**: Parameterized Playwright test that tests one language at a time

```typescript
import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MDOPEN_BIN = path.join(PROJECT_ROOT, 'bin', 'mdopen');
const OUTPUT_DIR = '/tmp/mdopen-lang-test';

// Test languages to add (in priority order)
const TEST_LANGUAGES = [
  { name: 'c', prismName: 'c', code: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },
  { name: 'cpp', prismName: 'cpp', code: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5};\n    for (const auto& n : nums) {\n        std::cout << n << " ";\n    }\n    return 0;\n}` },
  { name: 'csharp', prismName: 'csharp', code: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}` },
  { name: 'go', prismName: 'go', code: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}` },
  { name: 'rust', prismName: 'rust', code: `fn main() {\n    let numbers: Vec<i32> = (1..=10).collect();\n    let sum: i32 = numbers.iter().sum();\n    println!("Sum: {}", sum);\n}` },
  { name: 'java', prismName: 'java', code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}` },
  { name: 'kotlin', prismName: 'kotlin', code: `fun main() {\n    val numbers = listOf(1, 2, 3, 4, 5)\n    val doubled = numbers.map { it * 2 }\n    println(doubled)\n}` },
  { name: 'ruby', prismName: 'ruby', code: `def greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")` },
  { name: 'php', prismName: 'php', code: `<?php\nfunction factorial(int $n): int {\n    return $n <= 1 ? 1 : $n * factorial($n - 1);\n}\necho factorial(5);\n?>` },
  { name: 'swift', prismName: 'swift', code: `import Foundation\n\nfunc fibonacci(_ n: Int) -> Int {\n    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nprint(fibonacci(10))` },
  { name: 'scala', prismName: 'scala', code: `object Main extends App {\n  val numbers = List(1, 2, 3, 4, 5)\n  val doubled = numbers.map(_ * 2)\n  println(doubled)\n}` },
  { name: 'r', prismName: 'r', code: `# Fibonacci function\nfibonacci <- function(n) {\n  if (n <= 1) return(n)\n  return(fibonacci(n - 1) + fibonacci(n - 2))\n}\n\nprint(fibonacci(10))` },
  { name: 'dart', prismName: 'dart', code: `void main() {\n  var numbers = [1, 2, 3, 4, 5];\n  var doubled = numbers.map((n) => n * 2).toList();\n  print(doubled);\n}` },
  { name: 'lua', prismName: 'lua', code: `function fibonacci(n)\n  if n <= 1 then return n end\n  return fibonacci(n - 1) + fibonacci(n - 2)\nend\n\nprint(fibonacci(10))` },
  { name: 'perl', prismName: 'perl', code: `use strict;\nuse warnings;\n\nsub fibonacci {\n  my ($n) = @_;\n  return $n if $n <= 1;\n  return fibonacci($n - 1) + fibonacci($n - 2);\n}\n\nprint fibonacci(10), "\\n";` },
  { name: 'elixir', prismName: 'elixir', code: `defmodule Math do\n  def fibonacci(0), do: 0\n  def fibonacci(1), do: 1\n  def fibonacci(n), do: fibonacci(n - 1) + fibonacci(n - 2)\nend\n\nIO.puts(Math.fibonacci(10))` },
  { name: 'haskell', prismName: 'haskell', code: `fibonacci :: Int -> Int\nfibonacci 0 = 0\nfibonacci 1 = 1\nfibonacci n = fibonacci (n - 1) + fibonacci (n - 2)\n\nmain :: IO ()\nmain = print (fibonacci 10)` },
  { name: 'clojure', prismName: 'clojure', code: `(defn fibonacci [n]\n  (if (<= n 1)\n    n\n    (+ (fibonacci (- n 1)) (fibonacci (- n 2)))))\n\n(println (fibonacci 10))` },
  { name: 'ocaml', prismName: 'ocaml', code: `let rec fibonacci n =\n  if n <= 1 then n\n  else fibonacci (n - 1) + fibonacci (n - 2)\n\nlet () = print_int (fibonacci 10)` },
  { name: 'fsharp', prismName: 'fsharp', code: `let rec fibonacci n =\n    if n <= 1 then n\n    else fibonacci (n - 1) + fibonacci (n - 2)\n\nprintfn "%d" (fibonacci 10)` },
  { name: 'erlang', prismName: 'erlang', code: `-module(math).\n-export([fibonacci/1]).\n\nfibonacci(0) -> 0;\nfibonacci(1) -> 1;\nfibonacci(N) -> fibonacci(N - 1) + fibonacci(N - 2).` },
  { name: 'julia', prismName: 'julia', code: `function fibonacci(n::Int)::Int\n    n <= 1 && return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\nend\n\nprintln(fibonacci(10))` },
  { name: 'zig', prismName: 'zig', code: `const std = @import("std");\n\nfn fibonacci(n: u32) u32 {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\npub fn main() !void {\n    const stdout = std.io.getStdOut().writer();\n    try stdout.print("{}", .{fibonacci(10)});\n}` },
  { name: 'sql', prismName: 'sql', code: `CREATE TABLE users (\n    id SERIAL PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE\n);\n\nINSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');\n\nSELECT * FROM users WHERE name LIKE 'A%';` },
  { name: 'graphql', prismName: 'graphql', code: `type User {\n  id: ID!\n  name: String!\n  email: String!\n}\n\ntype Query {\n  users: [User!]!\n  user(id: ID!): User\n}` },
  { name: 'dockerfile', prismName: 'docker', code: `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]` },
  { name: 'toml', prismName: 'toml', code: `[server]\nhost = "localhost"\nport = 8080\n\n[database]\nname = "mydb"\ndriver = "postgres"` },
  { name: 'nginx', prismName: 'nginx', code: `server {\n    listen 80;\n    server_name example.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n    }\n}` },
  { name: 'makefile', prismName: 'makefile', code: `CC=gcc\nCFLAGS=-Wall -Wextra\n\nall: myapp\n\nmyapp: main.o\n\t$(CC) $(CFLAGS) -o myapp main.o\n\nclean:\n\trm -f myapp *.o` },
  { name: 'cmake', prismName: 'cmake', code: `cmake_minimum_required(VERSION 3.20)\nproject(MyApp LANGUAGES CXX)\n\nset(CMAKE_CXX_STANDARD 17)\n\nadd_executable(myapp main.cpp)\ntarget_link_libraries(myapp PRIVATE pthread)` },
  { name: 'latex', prismName: 'latex', code: `\\documentclass{article}\n\\usepackage{amsmath}\n\n\\begin{document}\n\\section{Introduction}\nThe quadratic formula is:\n\\[\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n\\]\n\\end{document}` },
  { name: 'solidity', prismName: 'solidity', code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Counter {\n    uint256 public count;\n\n    function increment() public {\n        count++;\n    }\n}` },
  { name: 'assembly', prismName: 'asm6502', code: `section .data\n    msg db "Hello, World!", 10\n    len equ $ - msg\n\nsection .text\n    global _start\n\n_start:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len\n    syscall` },
  { name: 'regex', prismName: 'regex', code: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$` },
  { name: 'diff', prismName: 'diff', code: `- const oldFunction = () => {};\n+ const newFunction = () => {\n+   console.log("updated");\n+ };` },
  { name: 'django', prismName: 'django', code: `{% extends "base.html" %}\n\n{% block content %}\n<h1>{{ title }}</h1>\n{% for item in items %}\n  <p>{{ item.name }}: {{ item.value }}</p>\n{% endfor %}\n{% endblock %}` },
  { name: 'twig', prismName: 'twig', code: `{% extends "base.html.twig" %}\n\n{% block body %}\n<h1>{{ title }}</h1>\n{% for item in items %}\n  <p>{{ item.name }}: {{ item.value }}</p>\n{% endfor %}\n{% endblock %}` },
];

async function generateHtmlForLanguage(lang: typeof TEST_LANGUAGES[0]): Promise<string> {
  const markdown = `# Test ${lang.name}\n\n\`\`\`${lang.name}\n${lang.code}\n\`\`\``;
  const tmpFile = path.join(OUTPUT_DIR, `test-${lang.name}.md`);
  const htmlFile = path.join(OUTPUT_DIR, `test-${lang.name}.html`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(tmpFile, markdown, 'utf8');

  const { stdout } = await execPromise(`"${MDOPEN_BIN}" "${tmpFile}" --no-open --theme github --out "${htmlFile}" --no-validate-mermaid`, {
    timeout: 30000,
  });

  return htmlFile;
}

for (const lang of TEST_LANGUAGES) {
  test.describe(`${lang.name} syntax highlighting`, () => {
    let htmlPath: string;

    test.beforeAll(async () => {
      // First ensure language is in PRISM_LANGUAGES
      // This test will fail until language is added
      htmlPath = await generateHtmlForLanguage(lang);
    });

    test('renders with syntax highlighting tokens', async ({ page }) => {
      await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

      // Wait for Prism to highlight
      await page.waitForFunction(
        () => {
          const codeElements = document.querySelectorAll('pre code[class*="language-"]');
          if (codeElements.length === 0) return false;
          // Check if Prism has added token classes
          const code = codeElements[0];
          const tokens = code.querySelectorAll('.token');
          return tokens.length > 0;
        },
        { timeout: 10000 }
      );

      // Verify token classes exist
      const tokenClasses = await page.evaluate(() => {
        const code = document.querySelector('pre code[class*="language-"]')!;
        const tokens = Array.from(code.querySelectorAll('.token'));
        return tokens.map(t => Array.from(t.classList)).flat();
      });

      // Should have at least keyword, string, function, comment, or operator tokens
      const expectedTokenTypes = ['keyword', 'string', 'function', 'comment', 'operator', 'number', 'punctuation', 'class-name', 'tag', 'attr-name', 'attr-value'];
      const hasExpectedTokens = tokenClasses.some(t => expectedTokenTypes.includes(t));
      expect(hasExpectedTokens).toBe(true);

      // Take screenshot
      await expect(page).toHaveScreenshot(`${lang.name}-highlighting.png`, {
        fullPage: true,
      });
    });

    test('has correct language class', async ({ page }) => {
      await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

      const langClass = await page.evaluate(() => {
        const code = document.querySelector('pre code[class*="language-"]');
        return code?.className || '';
      });

      expect(langClass).toContain(`language-${lang.prismName === 'csharp' ? 'csharp' : lang.prismName === 'cpp' ? 'cpp' : lang.name}`);
    });
  });
}

// Also test existing languages
const EXISTING_LANGUAGES = [
  { name: 'javascript', prismName: 'javascript' },
  { name: 'typescript', prismName: 'typescript' },
  { name: 'css', prismName: 'css' },
  { name: 'html', prismName: 'markup' },
  { name: 'bash', prismName: 'bash' },
  { name: 'python', prismName: 'python' },
  { name: 'json', prismName: 'json' },
  { name: 'yaml', prismName: 'yaml' },
];

for (const lang of EXISTING_LANGUAGES) {
  test.describe(`Verify existing: ${lang.name} syntax highlighting`, () => {
    let htmlPath: string;

    test.beforeAll(async () => {
      const markdown = `# Test ${lang.name}\n\n\`\`\`${lang.name}\nconst x = 42;\nconsole.log(x);\n\`\`\``;
      const tmpFile = path.join(OUTPUT_DIR, `test-existing-${lang.name}.md`);
      const htmlFile = path.join(OUTPUT_DIR, `test-existing-${lang.name}.html`);

      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      fs.writeFileSync(tmpFile, markdown, 'utf8');

      const { stdout } = await execPromise(`"${MDOPEN_BIN}" "${tmpFile}" --no-open --theme github --out "${htmlFile}" --no-validate-mermaid`, {
        timeout: 30000,
      });

      htmlPath = htmlFile;
    });

    test('renders with syntax highlighting tokens', async ({ page }) => {
      await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });

      await page.waitForFunction(
        () => {
          const codeElements = document.querySelectorAll('pre code[class*="language-"]');
          if (codeElements.length === 0) return false;
          const code = codeElements[0];
          const tokens = code.querySelectorAll('.token');
          return tokens.length > 0;
        },
        { timeout: 10000 }
      );

      const tokenClasses = await page.evaluate(() => {
        const code = document.querySelector('pre code[class*="language-"]')!;
        const tokens = Array.from(code.querySelectorAll('.token'));
        return tokens.map(t => Array.from(t.classList)).flat();
      });

      const expectedTokenTypes = ['keyword', 'string', 'function', 'comment', 'operator', 'number', 'punctuation'];
      const hasExpectedTokens = tokenClasses.some(t => expectedTokenTypes.includes(t));
      expect(hasExpectedTokens).toBe(true);

      await expect(page).toHaveScreenshot(`existing-${lang.name}-highlighting.png`, {
        fullPage: true,
      });
    });
  });
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Language mapping document created
- [ ] Playwright test file created with parameterized tests
- [ ] Build succeeds: `bun run build`
- [ ] Existing language tests pass (verify they work)

#### Manual Verification:
- [ ] Review language mapping for completeness
- [ ] Verify test infrastructure runs

---

## Phase 2: Add Languages Incrementally (Repeat per Language)

### Overview
For each language in priority order:
1. Add to `PRISM_LANGUAGES` in `assets.ts`
2. Run visual test for that language
3. Verify token classes present + screenshot captured
4. If fails: report issue, continue to next

### Per-Language Changes Required:

#### 1. Update PRISM_LANGUAGES
**File**: `packages/mdopen/src/assets.ts`
**Changes**: Add language to the array

```typescript
const PRISM_LANGUAGES = [
    'javascript',
    'typescript',
    'css',
    'markup',
    'bash',
    'python',
    'json',
    'yaml',
    // ADD NEW LANGUAGE HERE (e.g., 'c', 'cpp', 'csharp', etc.)
];
```

#### 2. Rebuild Binary
```bash
cd packages/mdopen && bun run build:bin
```

#### 3. Run Visual Test for Language
```bash
cd packages/mdopen && npx playwright test tests/language-highlighting.spec.ts -g "LANGUAGE_NAME"
```

### Priority Order (most commonly used first):
1. **C** (`c`) - prism-c.js
2. **C++** (`cpp`) - prism-cpp.js
3. **C#** (`csharp`) - prism-csharp.js
4. **Go** (`go`) - prism-go.js
5. **Rust** (`rust`) - prism-rust.js
6. **Java** (`java`) - prism-java.js
7. **Kotlin** (`kotlin`) - prism-kotlin.js
8. **Ruby** (`ruby`) - prism-ruby.js
9. **PHP** (`php`) - prism-php.js
10. **Swift** (`swift`) - prism-swift.js
11. **Scala** (`scala`) - prism-scala.js
12. **R** (`r`) - prism-r.js
13. **Dart** (`dart`) - prism-dart.js
14. **Lua** (`lua`) - prism-lua.js
15. **Perl** (`perl`) - prism-perl.js
16. **Elixir** (`elixir`) - prism-elixir.js
17. **Haskell** (`haskell`) - prism-haskell.js
18. **Clojure** (`clojure`) - prism-clojure.js
19. **OCaml** (`ocaml`) - prism-ocaml.js
20. **F#** (`fsharp`) - prism-fsharp.js
21. **Erlang** (`erlang`) - prism-erlang.js
22. **Julia** (`julia`) - prism-julia.js
23. **Zig** (`zig`) - prism-zig.js
24. **SQL** (`sql`) - prism-sql.js
25. **GraphQL** (`graphql`) - prism-graphql.js
26. **Dockerfile** (`docker`) - prism-docker.js
27. **TOML** (`toml`) - prism-toml.js
28. **Nginx** (`nginx`) - prism-nginx.js
29. **Makefile** (`makefile`) - prism-makefile.js
30. **CMake** (`cmake`) - prism-cmake.js
31. **LaTeX** (`latex`) - prism-latex.js
32. **Solidity** (`solidity`) - prism-solidity.js
33. **Assembly** (`asm6502` or `nasm`) - prism-asm6502.js
34. **Regex** (`regex`) - prism-regex.js
35. **Diff** (`diff`) - prism-diff.js
36. **Django/Jinja** (`django`) - prism-django.js
37. **Twig** (`twig`) - prism-twig.js

### Success Criteria (per language):

#### Automated Verification:
- [ ] Language added to `PRISM_LANGUAGES`
- [ ] Binary rebuilt: `bun run build:bin`
- [ ] Playwright test passes for that language: `npx playwright test -g "LANGUAGE"`
- [ ] Token classes verified (keyword, string, function, etc. present)
- [ ] Screenshot captured and saved

#### Manual Verification:
- [ ] Open generated HTML in browser and visually confirm highlighting
- [ ] If test fails: document issue, decide to fix or skip

### Blocker Rule:
**If a language fails**: Document the issue in `thoughts/shared/research/prism-language-issues.md` and continue to next language. Do not block on individual language failures.

---

## Phase 3: Verify All Languages & Final Report

### Overview
Run comprehensive test for all languages, generate summary report.

### Changes Required:

#### 1. Run Full Test Suite
```bash
cd packages/mdopen && npx playwright test tests/language-highlighting.spec.ts
```

#### 2. Generate Summary Report
**File**: `thoughts/shared/research/prism-highlighting-report.md`
Document which languages work, which have issues, screenshots captured.

### Success Criteria:

#### Automated Verification:
- [ ] All language tests run (some may fail - that's OK if documented)
- [ ] Screenshots generated for all passing languages
- [ ] Report generated with status of each language

#### Manual Verification:
- [ ] Review screenshots for visual correctness
- [ ] Verify report completeness

---

## Testing Strategy

### Unit Tests (via Playwright browser context):
- Load HTML in browser
- Execute `Prism.highlightAll()` 
- Check DOM for `.token` elements with expected classes
- Verify `language-*` class on `<code>` element

### Visual Tests:
- Full-page screenshot of rendered HTML
- Compare against baseline (update on first run)
- Verify code block is visible and colored

### Manual Testing Steps (for verification):
1. `cd packages/mdopen && bun run build:bin`
2. `mdopen test/small-test.md --no-open --theme github --out /tmp/test.html`
3. Open `/tmp/test.html` in browser
4. Verify code block has syntax colors
5. Test dark theme: `--theme github-dark`

---

## Performance Considerations

- Each language adds ~2-10KB to the JS bundle
- Total added: ~40 languages × ~5KB avg = ~200KB
- Current bundle: ~300KB (Prism core + 8 langs + Mermaid + Panzoom)
- New bundle: ~500KB - still acceptable

---

## Migration Notes

- No migration needed - additive only
- Existing 8 languages remain
- Backwards compatible

---

## References

- PrismJS components: `node_modules/prismjs/components/`
- Current assets: `packages/mdopen/src/assets.ts`
- Template: `packages/mdopen/src/template.ts`
- Visual test: `packages/mdopen/tests/visual.spec.ts`
- Test file: `test/all-languages-test.md`
- Existing Shiki migration plan: `thoughts/shared/plans/migrate-prismjs-to-shiki.md`