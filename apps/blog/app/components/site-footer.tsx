import { Link as RouterLink } from 'react-router';

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
          <RouterLink to="/colophon" className={styles['link']}>
            colophon
          </RouterLink>
          <RouterLink to="/uses" className={styles['link']}>
            uses
          </RouterLink>
        </nav>
      </div>
    </footer>
  );
}
