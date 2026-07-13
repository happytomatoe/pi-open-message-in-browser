import { expect, test, describe } from 'bun:test';
import { extractMermaidBlocks } from '../src/compilers/mermaid-utils';

describe('extractMermaidBlocks', () => {
  test('extracts standard mermaid blocks', () => {
    const md = '```mermaid\ngraph TD\n  A --> B\n```';
    expect(extractMermaidBlocks(md)).toEqual(['graph TD\n  A --> B']);
  });

  test('extracts multiple mermaid blocks', () => {
    const md = '```mermaid\nB1\n```\n\nSome text\n\n```mermaid\nB2\n```';
    expect(extractMermaidBlocks(md)).toEqual(['B1', 'B2']);
  });

  test('extracts indented mermaid blocks (up to 3 spaces)', () => {
    const md = '  ```mermaid\nIndented\n```';
    expect(extractMermaidBlocks(md)).toEqual(['Indented']);
    
    const md2 = '   ```mermaid\nThreeSpaces\n```';
    expect(extractMermaidBlocks(md2)).toEqual(['ThreeSpaces']);
  });

  test('ignores blocks with > 3 spaces of indentation', () => {
    const md = '    ```mermaid\nTooManySpaces\n```';
    expect(extractMermaidBlocks(md)).toEqual([]);
  });

  test('extracts blocks using tildes', () => {
    const md = '~~~mermaid\nGraph with tildes\n~~~';
    expect(extractMermaidBlocks(md)).toEqual(['Graph with tildes']);
  });

  test('extracts blocks with 4+ backticks', () => {
    const md = '````mermaid\nFour backticks\n````';
    expect(extractMermaidBlocks(md)).toEqual(['Four backticks']);
  });

  test('ignores non-mermaid blocks', () => {
    const md = '```javascript\nconst x = 1;\n```';
    expect(extractMermaidBlocks(md)).toEqual([]);
  });

  test('trims content of blocks', () => {
    const md = '```mermaid\n\n  content  \n\n```';
    expect(extractMermaidBlocks(md)).toEqual(['content']);
  });
});
