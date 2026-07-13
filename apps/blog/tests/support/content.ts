import { slugify } from '../../app/lib/markdown.server';
import { getPosts, type Post } from '../../app/lib/posts.server';

/**
 * The posts, read from the content itself.
 *
 * Tests used to name a post: its slug, its title, one of its headings. Publishing
 * anything then broke a dozen specs that had no opinion about publishing — and once
 * turned `main` red, because the e2e suite still expected a post that had been
 * deleted. A test that hardcodes content is not testing the site, it is testing that
 * the content has not changed.
 *
 * So the specs ask the content what it is, and assert on the BEHAVIOUR around it:
 * that the post renders, that its headings become a table of contents, that the
 * sitemap lists it. Rewrite every post tomorrow and none of that should move.
 */
export const posts = getPosts();

/** The newest post — the one the home page features and the specs navigate to. */
export function firstPost(): Post {
  const [post] = posts;
  if (!post) throw new Error('no posts: the specs need at least one to render');
  return post;
}

/** The `##` headings of a post, in order — what the table of contents is built from. */
export function sectionsOf(post: Post): string[] {
  return [...post.body.matchAll(/^## (.+)$/gm)].map((match) =>
    (match[1] ?? '').trim(),
  );
}

/*
 * The app's own slugify, not a copy of it: a second implementation in the tests is a
 * second dialect, and the day they drift the specs go green on anchors the site does
 * not generate.
 */
export { slugify };
