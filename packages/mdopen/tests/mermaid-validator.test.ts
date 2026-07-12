import { expect, test, describe } from 'bun:test';
import { validateMermaid } from '../src/mermaid-validator';

describe('validateMermaid', () => {
  test('validates a single valid block', async () => {
    const blocks = ['graph TD\n  A --> B'];
    const result = await validateMermaid(blocks);
    expect(result.total).toBe(1);
    expect(result.passed).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
  });

  test('validates multiple valid blocks', async () => {
    const blocks = [
      'graph TD\n  A --> B',
      'sequenceDiagram\n  Alice->>Bob: Hello'
    ];
    const result = await validateMermaid(blocks);
    expect(result.total).toBe(2);
    expect(result.passed).toBe(2);
    expect(result.failed).toBe(0);
  });

  test('detects a single invalid block', async () => {
    const blocks = ['graph TD\n  A[Start']; // Missing closing bracket
    const result = await validateMermaid(blocks);
    expect(result.total).toBe(1);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0].index).toBe(0);
    expect(result.errors[0].error).toBeDefined();
  });

  test('detects invalid syntax in sequence diagrams', async () => {
    const blocks = ['sequenceDiagram\n  Invalid Syntax Here'];
    const result = await validateMermaid(blocks);
    expect(result.failed).toBe(1);
  });

  test('handles a mix of valid and invalid blocks', async () => {
    const blocks = [
      'graph TD\n  A --> B',
      'invalid mermaid code',
      'sequenceDiagram\n  Alice->>Bob: Hello'
    ];
    const result = await validateMermaid(blocks);
    expect(result.total).toBe(3);
    expect(result.passed).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.errors[0].index).toBe(1);
  });

  test('handles empty blocks list', async () => {
    const result = await validateMermaid([]);
    expect(result.total).toBe(0);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
  });

  test('handles empty string as block', async () => {
    const blocks = [''];
    const result = await validateMermaid(blocks);
    // Depending on mermaid-parser-bundle, empty string might be valid or invalid.
    // But it should not crash.
    expect(result.total).toBe(1);
  });
});
