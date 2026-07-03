export function generateHtmlDocument(body: string, css: string, js: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pi Assistant Response</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        ${css}
    </style>
</head>
<body class="markdown-body">
    ${body}
    <script type="module">
        ${js}
        mermaid.initialize({ startOnLoad: true });
    </script>
</body>
</html>`;
}
