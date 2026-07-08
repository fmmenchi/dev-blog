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
  const withIds = html.replace(/<h2>([^<]+)<\/h2>/g, (_match, text) => {
    const id = slugify(text);
    toc.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  });
  return { html: withIds, toc };
}
