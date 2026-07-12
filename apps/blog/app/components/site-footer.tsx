import { Link } from '@dev-blog/ui';

import { socials } from '../lib/content';
import styles from './site-footer.module.css';

export function SiteFooter() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['inner']}>
        <span>© 2026 fabiomenchicchi.com</span>
        <nav aria-label="Secondary" className={styles['links']}>
          {socials.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              variant="plain"
              className={styles['link']}
            >
              {label}
            </Link>
          ))}
          {/* rss.xml is a resource route — a real document request on purpose */}
          <a href="/rss.xml" className={styles['link']}>
            rss
          </a>
          <Link to="/colophon" variant="plain" className={styles['link']}>
            colophon
          </Link>
          <Link to="/uses" variant="plain" className={styles['link']}>
            uses
          </Link>
        </nav>
      </div>
    </footer>
  );
}
