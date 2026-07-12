import { marked } from 'marked';

export interface TocEntry {
  id: string;
  text: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ENTITY: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * The heading text is read back out of marked's HTML, where it is already
 * escaped. React then renders the table of contents as a text node and escapes
 * it again, so `What doesn't` reached the page as `What doesn&#39;t`. Inside the
 * <h2> the entity is correct and the browser decodes it; only the TOC, which
 * leaves HTML and becomes text, needs it undone.
 */
function decodeEntities(text: string): string {
  return text.replace(
    /&(?:amp|lt|gt|quot|#39);/g,
    (match) => ENTITY[match] ?? match,
  );
}

/**
 * Renders trusted markdown (our own content) to HTML, assigning ids to h2
 * headings and returning them as a table of contents.
 */
export function renderMarkdown(body: string): {
  html: string;
  toc: TocEntry[];
} {
  const toc: TocEntry[] = [];
  const html = marked.parse(body, { async: false }) as string;
  const withIds = html.replace(/<h2>([^<]+)<\/h2>/g, (_match, escaped) => {
    const text = decodeEntities(escaped);
    const id = slugify(text);
    toc.push({ id, text });
    return `<h2 id="${id}">${escaped}</h2>`;
  });
  return { html: withIds, toc };
}
