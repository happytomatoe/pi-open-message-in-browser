export function generateHtmlDocument(body: string, css: string, js: string, theme: 'light' | 'dark' | 'auto' = 'light'): string {
    const mermaidTheme = theme === 'dark' ? 'dark' : 'default';
    const htmlDataTheme = theme === 'auto' ? '' : ` data-theme="${theme}"`;
    const bgColor = theme === 'dark' ? '#0d1117' : theme === 'light' ? '#ffffff' : 'transparent';
    return `<!DOCTYPE html>
<html lang="en"${htmlDataTheme}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pi Assistant Response</title>
    <style>
        html {
            background-color: ${bgColor};
        }
        body.markdown-body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            text-align: center;
        }
        ${css}
    </style>
</head>
<body class="markdown-body">
    ${body}
    <script>
        ${js}
        mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
    </script>
</body>
</html>`;
}
