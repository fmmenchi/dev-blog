import { NavLink, Link as RouterLink } from 'react-router';

import { AccentSwitcher } from './accent-switcher';
import styles from './site-header.module.css';

const NAV = [
  { to: '/', label: '/blog' },
  { to: '/progetti', label: '/progetti' },
  { to: '/about', label: '/about' },
] as const;

export function SiteHeader() {
  return (
    <header className={styles['header']}>
      <a href="#contenuto" className={styles['skip']}>
        Salta al contenuto
      </a>
      <div className={styles['inner']}>
        <RouterLink to="/" className={styles['logo']}>
          fabio<span className={styles['logoAccent']}>.dev</span>
        </RouterLink>
        <nav aria-label="Principale" className={styles['nav']}>
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive
                  ? `${styles['navlink']} ${styles['active']}`
                  : styles['navlink']
              }
            >
              {label}
            </NavLink>
          ))}
          <a href="/rss.xml" className={styles['navlink']}>
            /rss
          </a>
          <AccentSwitcher />
        </nav>
      </div>
    </header>
  );
}
