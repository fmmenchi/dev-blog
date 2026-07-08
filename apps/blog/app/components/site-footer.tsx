import { Link } from '@dev-blog/ui';

import styles from './site-footer.module.css';

export function SiteFooter() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['inner']}>
        <span>© 2026 fabiomenchicchi.com · made with too much coffee</span>
        <nav aria-label="Secondary" className={styles['links']}>
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
