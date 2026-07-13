import { cn } from '../../internal/cn';
import { Badge } from '../badge/badge.component';

export interface BadgeListProps {
  /** Names the group for assistive tech, e.g. "Skills". */
  label: string;
  items: string[];
  className?: string;
}

/**
 * A labelled row of badges.
 *
 * A real list, not a row of coloured `<span>`s: a screen reader announces "Skills,
 * list, 9 items" and lets the reader skip it (WCAG 1.3.1). Sighted readers get the
 * grouping for free from the layout — this is how everyone else gets it.
 *
 * Content-free on purpose, like `IconLinks`: it takes its items as props and reads
 * nothing. The design system must not know that this blog has skills.
 */
export function BadgeList({ label, items, className }: BadgeListProps) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-1.75', className)}>
      {items.map((item) => (
        <li key={item}>
          <Badge>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}
