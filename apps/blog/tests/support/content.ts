import { getPosts, type Post } from '../../app/lib/posts.server';

/**
 * The posts, read from the content itself.
 *
 * Tests used to name a post: its slug, its title, one of its headings. Publishing
 * anything then broke a dozen specs that had no opinion about publishing — and once
 * turned `main` red, because the e2e suite still expected a post that had been deleted.
 * A test that hardcodes content is not testing the site, it is testing that the content
 * has not changed.
 *
 * They ask the content what it is instead, and assert on the BEHAVIOUR around it.
 */
export const posts = getPosts();

/** The newest post — the one the home page features and the specs navigate to. */
export function firstPost(): Post {
  const [post] = posts;
  if (!post) throw new Error('no posts: the specs need at least one to render');
  return post;
}
