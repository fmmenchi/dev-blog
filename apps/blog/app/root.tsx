import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from 'react-router';

import themeStylesheetUrl from '@dev-blog/theme/styles/theme.css?url';

import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import { seoMeta } from './lib/seo';
import { SITE_NAME, SITE_URL } from './lib/site';
import styles from './root.module.css';

export function loader() {
  return { origin: SITE_URL };
}

export const meta = ({
  loaderData,
  location,
}: {
  loaderData?: ReturnType<typeof loader>;
  location: { pathname: string };
}) =>
  seoMeta({
    origin: loaderData?.origin ?? SITE_URL,
    path: location.pathname,
    title: `${SITE_NAME} — software, systems and decisions`,
    description:
      'No hype, no thread-boy takes. Honest post-mortems, architecture, TypeScript and developer experience.',
  });

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
  },
  { rel: 'stylesheet', href: themeStylesheetUrl },
  {
    rel: 'alternate',
    type: 'application/rss+xml',
    title: SITE_NAME,
    href: '/rss.xml',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-accent="giallo">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className={styles['shell']}>
          <SiteHeader />
          <div id="content" className={styles['content']}>
            {children}
          </div>
          <SiteFooter />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
