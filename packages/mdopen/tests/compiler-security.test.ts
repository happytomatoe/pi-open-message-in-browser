import { expect, test, describe } from 'bun:test';
import { commonmarkCompiler } from '../src/compilers/commonmark';
import { markedCompiler } from '../src/compilers/marked';
import { remarkableCompiler } from '../src/compilers/remarkable';

const COMPILERS = [
  { name: 'commonmark', impl: commonmarkCompiler },
  { name: 'marked', impl: markedCompiler },
  { name: 'remarkable', impl: remarkableCompiler },
];

describe('Compiler Security / XSS Escaping', () => {
  const XSS_PAYLOAD = '<script>alert("xss")</script> & "quotes"';
  // We check for basic HTML escaping of <, >, and &. 
  // Some compilers might also escape quotes as &quot;, which is also acceptable.

  COMPILERS.forEach(({ name, impl }) => {
    describe(`${name} compiler`, () => {
      test('escapes mermaid code content', () => {
        const md = '```mermaid\n' + XSS_PAYLOAD + '\n```';
        const { html } = impl.compile(md);
        expect(html).toContain('&lt;script&gt;');
        expect(html).toContain('&lt;/script&gt;');
        expect(html).toContain('&amp;');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain(XSS_PAYLOAD);
      });

      test('escapes non-mermaid code content', () => {
        const md = '```javascript\n' + XSS_PAYLOAD + '\n```';
        const { html } = impl.compile(md);
        expect(html).toContain('&lt;script&gt;');
        expect(html).toContain('&lt;/script&gt;');
        expect(html).toContain('&amp;');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain(XSS_PAYLOAD);
      });
    });
  });
});
