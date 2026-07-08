import styles from './site-footer.module.css';

export function SiteFooter() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['inner']}>
        <span>© 2026 fabio.dev · fatto con troppo caffè</span>
        <nav aria-label="Secondaria" className={styles['links']}>
          <a href="/rss.xml" className={styles['link']}>
            rss
          </a>
          <a href="/colophon" className={styles['link']}>
            colophon
          </a>
          <a href="/uses" className={styles['link']}>
            uses
          </a>
        </nav>
      </div>
    </footer>
  );
}
