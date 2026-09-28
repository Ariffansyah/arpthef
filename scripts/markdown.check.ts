// node --experimental-strip-types scripts/markdown.check.ts
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/lib/markdown.ts';

const html = renderMarkdown(`## Stack
- **Svelte**

line one
line two

<script>alert(1)</script>
<img src=x onerror=alert(1)>

[ok](https://example.com) [bad](javascript:alert(1)) [BAD]( JavaScript:alert(1))`);

assert.match(html, /<h2>Stack<\/h2>/);
assert.match(html, /<li><strong>Svelte<\/strong>/);
assert.match(html, /line one<br>line two/, 'single newline should become <br>');
assert.doesNotMatch(html, /<script|<img/i, 'raw HTML must be escaped');
assert.match(html, /<a href="https:\/\/example.com">ok<\/a>/);
assert.doesNotMatch(html, /href="\s*javascript/i, 'javascript: links must be dropped');
console.log('markdown ok');
