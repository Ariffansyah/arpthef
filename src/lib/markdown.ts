import { Marked } from 'marked';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// breaks: a single newline is a line break, like the old plain-text details.
// Raw HTML and javascript: links are neutralised, so even a stolen admin
// session can't put scripts on public pages.
const md = new Marked({
	breaks: true,
	renderer: {
		html: ({ text }) => escape(text),
		link({ href, tokens }) {
			return /^\s*(javascript|data|vbscript):/i.test(href)
				? this.parser.parseInline(tokens)
				: false;
		}
	}
});

export const renderMarkdown = (src: string) => md.parse(src, { async: false });
