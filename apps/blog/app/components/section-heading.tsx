import type { ReactNode } from 'react';

import styles from './section-heading.module.css';

export interface SectionHeadingProps {
  children: ReactNode;
  aside?: ReactNode;
}

/** Monospace section label in the mock style: `// articles ——— 5 posts`. */
export function SectionHeading({ children, aside }: SectionHeadingProps) {
  return (
    <div className={styles['heading']}>
      <span aria-hidden="true" className={styles['slashes']}>
        {'//'}
      </span>
      <span>{children}</span>
      <span aria-hidden="true" className={styles['rule']} />
      {aside ? <span>{aside}</span> : null}
    </div>
  );
}
