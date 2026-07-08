import { NavLink, Link as RouterLink } from 'react-router';

import { AccentSwitcher } from './accent-switcher';
import styles from './site-header.module.css';

const NAV = [
  { to: '/', label: '/blog' },
  { to: '/projects', label: '/projects' },
  { to: '/about', label: '/about' },
] as const;

export function SiteHeader() {
  return (
    <header className={styles['header']}>
      <a href="#content" className={styles['skip']}>
        Skip to content
      </a>
      <div className={styles['inner']}>
        <RouterLink to="/" className={styles['logo']}>
          fabiomenchicchi<span className={styles['logoAccent']}>.com</span>
        </RouterLink>
        <nav aria-label="Main" className={styles['nav']}>
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
