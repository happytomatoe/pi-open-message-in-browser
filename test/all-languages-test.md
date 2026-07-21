# All Languages Syntax Highlighting Test

This file tests code blocks for many languages to verify PrismJS highlighting.

---

## Languages Currently Loaded in assets.ts

These **should** have syntax highlighting:

### JavaScript
```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

### TypeScript
```typescript
interface User {
  name: string;
  age: number;
}
const user: User = { name: "Alice", age: 30 };
```

### CSS
```css
body {
  font-family: sans-serif;
  background: #f5f5f5;
}
```

### HTML/Markup
```html
<div class="container">
  <h1>Title</h1>
  <p>Paragraph</p>
</div>
```

### Bash
```bash
#!/bin/bash
echo "Hello from bash"
for i in {1..5}; do
  echo "Count: $i"
done
```

### Python
```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
```

### JSON
```json
{
  "name": "test",
  "version": "1.0.0",
  "dependencies": {}
}
```

### YAML
```yaml
server:
  host: localhost
  port: 8080
database:
  name: mydb
```

---

## Common Languages NOT Currently Loaded

These will **NOT** have syntax highlighting unless added to `assets.ts`:

### C
```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

### C++
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    for (const auto& n : nums) {
        std::cout << n << " ";
    }
    return 0;
}
```

### C#
```csharp
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}
```

### Go
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

### Rust
```rust
fn main() {
    let numbers: Vec<i32> = (1..=10).collect();
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Kotlin
```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    println(doubled)
}
```

### Ruby
```ruby
def greet(name)
  "Hello, #{name}!"
end

puts greet("World")
```

### PHP
```php
<?php
function factorial(int $n): int {
    return $n <= 1 ? 1 : $n * factorial($n - 1);
}
echo factorial(5);
?>
```

### Swift
```swift
import Foundation

func fibonacci(_ n: Int) -> Int {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2)
}

print(fibonacci(10))
```

### Scala
```scala
object Main extends App {
  val numbers = List(1, 2, 3, 4, 5)
  val doubled = numbers.map(_ * 2)
  println(doubled)
}
```

### R
```r
# Fibonacci function
fibonacci <- function(n) {
  if (n <= 1) return(n)
  return(fibonacci(n - 1) + fibonacci(n - 2))
}

print(fibonacci(10))
```

### Dart
```dart
void main() {
  var numbers = [1, 2, 3, 4, 5];
  var doubled = numbers.map((n) => n * 2).toList();
  print(doubled);
}
```

### Lua
```lua
function fibonacci(n)
  if n <= 1 then return n end
  return fibonacci(n - 1) + fibonacci(n - 2)
end

print(fibonacci(10))
```

### Perl
```perl
use strict;
use warnings;

sub fibonacci {
  my ($n) = @_;
  return $n if $n <= 1;
  return fibonacci($n - 1) + fibonacci($n - 2);
}

print fibonacci(10), "\n";
```

### Elixir
```elixir
defmodule Math do
  def fibonacci(0), do: 0
  def fibonacci(1), do: 1
  def fibonacci(n), do: fibonacci(n - 1) + fibonacci(n - 2)
end

IO.puts(Math.fibonacci(10))
```

### Haskell
```haskell
fibonacci :: Int -> Int
fibonacci 0 = 0
fibonacci 1 = 1
fibonacci n = fibonacci (n - 1) + fibonacci (n - 2)

main :: IO ()
main = print (fibonacci 10)
```

### Clojure
```clojure
(defn fibonacci [n]
  (if (<= n 1)
    n
    (+ (fibonacci (- n 1)) (fibonacci (- n 2)))))

(println (fibonacci 10))
```

### OCaml
```ocaml
let rec fibonacci n =
  if n <= 1 then n
  else fibonacci (n - 1) + fibonacci (n - 2)

let () = print_int (fibonacci 10)
```

### F#
```fsharp
let rec fibonacci n =
    if n <= 1 then n
    else fibonacci (n - 1) + fibonacci (n - 2)

printfn "%d" (fibonacci 10)
```

### Erlang
```erlang
-module(math).
-export([fibonacci/1]).

fibonacci(0) -> 0;
fibonacci(1) -> 1;
fibonacci(N) -> fibonacci(N - 1) + fibonacci(N - 2).
```

### Julia
```julia
function fibonacci(n::Int)::Int
    n <= 1 && return n
    return fibonacci(n - 1) + fibonacci(n - 2)
end

println(fibonacci(10))
```

### Zig
```zig
const std = @import("std");

fn fibonacci(n: u32) u32 {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{}", .{fibonacci(10)});
}
```

### SQL
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE
);

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

SELECT * FROM users WHERE name LIKE 'A%';
```

### GraphQL
```graphql
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  users: [User!]!
  user(id: ID!): User
}
```

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### TOML
```toml
[server]
host = "localhost"
port = 8080

[database]
name = "mydb"
driver = "postgres"
```

### Nginx Config
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### Makefile
```makefile
CC=gcc
CFLAGS=-Wall -Wextra

all: myapp

myapp: main.o
	$(CC) $(CFLAGS) -o myapp main.o

clean:
	rm -f myapp *.o
```

### CMake
```cmake
cmake_minimum_required(VERSION 3.20)
project(MyApp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)

add_executable(myapp main.cpp)
target_link_libraries(myapp PRIVATE pthread)
```

### LaTeX
```latex
\documentclass{article}
\usepackage{amsmath}

\begin{document}
\section{Introduction}
The quadratic formula is:
\[
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\]
\end{document}
```

### Solidity
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 public count;

    function increment() public {
        count++;
    }
}
```

### Assembly (x86)
```asm
section .data
    msg db "Hello, World!", 10
    len equ $ - msg

section .text
    global _start

_start:
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, len
    syscall
```

### Regex
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### Diff
```diff
- const oldFunction = () => {};
+ const newFunction = () => {
+   console.log("updated");
+ };
```

### YAML (Extended)
```yaml
kubernetes:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: my-app
  spec:
    replicas: 3
    selector:
      matchLabels:
        app: my-app
```

### Jinja/Django Templates
```django
{% extends "base.html" %}

{% block content %}
<h1>{{ title }}</h1>
{% for item in items %}
  <p>{{ item.name }}: {{ item.value }}</p>
{% endfor %}
{% endblock %}
```

### Twig
```twig
{% extends "base.html.twig" %}

{% block body %}
<h1>{{ title }}</h1>
{% for item in items %}
  <p>{{ item.name }}: {{ item.value }}</p>
{% endfor %}
{% endblock %}
```

---

## Summary

| Language | In assets.ts? | Highlighted? |
|----------|---------------|--------------|
| JavaScript | ✅ Yes | ? |
| TypeScript | ✅ Yes | ? |
| CSS | ✅ Yes | ? |
| HTML | ✅ Yes | ? |
| Bash | ✅ Yes | ? |
| Python | ✅ Yes | ? |
| JSON | ✅ Yes | ? |
| YAML | ✅ Yes | ? |
| C | ❌ No | ? |
| C++ | ❌ No | ? |
| C# | ❌ No | ? |
| Go | ❌ No | ? |
| Rust | ❌ No | ? |
| Java | ❌ No | ? |
| Kotlin | ❌ No | ? |
| Ruby | ❌ No | ? |
| PHP | ❌ No | ? |
| Swift | ❌ No | ? |
| Scala | ❌ No | ? |
| R | ❌ No | ? |
| Dart | ❌ No | ? |
| Lua | ❌ No | ? |
| Perl | ❌ No | ? |
| Elixir | ❌ No | ? |
| Haskell | ❌ No | ? |
| Clojure | ❌ No | ? |
| OCaml | ❌ No | ? |
| F# | ❌ No | ? |
| Erlang | ❌ No | ? |
| Julia | ❌ No | ? |
| Zig | ❌ No | ? |
| SQL | ❌ No | ? |
| GraphQL | ❌ No | ? |
| Dockerfile | ❌ No | ? |
| TOML | ❌ No | ? |
| Nginx | ❌ No | ? |
| Makefile | ❌ No | ? |
| CMake | ❌ No | ? |
| LaTeX | ❌ No | ? |
| Solidity | ❌ No | ? |
| Assembly | ❌ No | ? |
| Regex | ❌ No | ? |
| Diff | ❌ No | ? |
| Django | ❌ No | ? |
| Twig | ❌ No | ? |
