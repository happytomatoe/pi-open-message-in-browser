declare module 'commonmark' {
  export class Parser {
    parse(src: string): Node;
  }
  
  export class HtmlRenderer {
    constructor(options?: { safe?: boolean; smart?: boolean });
    render(node: Node): string;
  }
  
  export interface Node {
    type: string;
    children?: Node[];
    literal?: string;
  }
}

declare module 'remarkable' {
  export class Remarkable {
    constructor(preset?: string, options?: any);
    render(src: string): string;
  }
}

declare module 'markdown-it-abbr' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-attrs' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginWithOptions<any>;
  export default plugin;
}

declare module 'markdown-it-footnote' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-ins' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-mark' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-sub' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-sup' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-task-lists' {
  import MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginWithOptions<any>;
  export default plugin;
}
