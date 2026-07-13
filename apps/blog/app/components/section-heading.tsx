import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  children: ReactNode;
  aside?: ReactNode;
}

/** Monospace section label in the mock style: `// posts ——— 5 posts`. */
export function SectionHeading({ children, aside }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
      <span aria-hidden="true" className="text-primary">
        {'//'}
      </span>
      <span>{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {aside ? <span>{aside}</span> : null}
    </div>
  );
}
