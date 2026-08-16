import { Badge, Card, Link } from '@dev-blog/ui';
import { cva, type VariantProps } from 'class-variance-authority';

import type { Post } from '../lib/posts.server';

/*
 * The home used to write this card twice — once big for the featured post, once
 * small for the ones under it — and the two drifted: only the big one carried
 * the tags, and only the big one wrapped them. One component, two sizes.
 */

/** `group` so the title can react to a hover anywhere on the card link. */
const CARD_LINK = 'group block text-inherit no-underline';

const cardVariants = cva('flex flex-col gap-2.5', {
  variants: {
    variant: {
      featured: '',
      /* Tighter than the card default: these sit under the featured one. */
      compact: 'py-5',
    },
  },
  defaultVariants: { variant: 'compact' },
});

const titleVariants = cva(
  '[transition:var(--transition-color)] group-hover:text-primary',
  {
    variants: {
      variant: {
        featured: 'text-[26px] leading-[1.16] font-bold tracking-[-0.02em]',
        compact: 'text-lg leading-[1.3] font-semibold',
      },
    },
    defaultVariants: { variant: 'compact' },
  },
);

const excerptVariants = cva('text-muted-foreground', {
  variants: {
    variant: {
      featured: 'max-w-intro text-[14.5px] leading-copy',
      compact: 'text-[13px]',
    },
  },
  defaultVariants: { variant: 'compact' },
});

/** `2026-08-16` → `08-16`: the year is noise on a card next to today's post. */
function compactDate(date: string) {
  return date.slice(5);
}

export type PostCardVariants = VariantProps<typeof cardVariants>;

export interface PostCardProps extends PostCardVariants {
  post: Post;
  /** Marks the newest post: `★ latest` at the end of the meta line. */
  latest?: boolean;
}

export function PostCard({
  post,
  variant = 'compact',
  latest = false,
}: PostCardProps) {
  const isFeatured = variant === 'featured';

  return (
    <Link to={`/blog/${post.slug}`} variant="plain" className={CARD_LINK}>
      <Card as="article" interactive className={cardVariants({ variant })}>
        <div className="flex justify-between gap-4 font-mono text-2xs text-muted-foreground">
          {latest ? (
            <span className="whitespace-nowrap text-primary">★ latest</span>
          ) : null}
          <span className="whitespace-nowrap">
            {/* `time` so the date is a date to a machine too, not just to us. */}
            <time dateTime={post.date}>
              {isFeatured ? post.date : compactDate(post.date)}
            </time>{' '}
            · {post.minutes} min
          </span>
        </div>

        <h2 className={titleVariants({ variant })}>{post.title}</h2>
        <p className={excerptVariants({ variant })}>{post.excerpt}</p>

        {/* `flex-wrap`, or the chips run past the card edge on a phone: a flex
            row cannot shrink a word. */}
        <div className="mt-1.5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="tag">
              #{tag}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}
