import { Link } from '@dev-blog/ui';
// NavLink stays a router primitive: the design-system Link has no notion of
// the aria-current active state the main nav needs.
import { NavLink } from 'react-router';

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
        <Link to="/" variant="plain" className={styles['logo']}>
          fabiomenchicchi<span className={styles['logoAccent']}>.com</span>
        </Link>
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
