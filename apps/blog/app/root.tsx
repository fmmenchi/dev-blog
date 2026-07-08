import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  type LinksFunction,
} from 'react-router';

import themeStylesheetUrl from '@dev-blog/theme/styles/theme.css?url';
import { Link } from '@dev-blog/ui';

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
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
    <html lang="en" data-accent="yellow">
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

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className={styles['error']}>
      <p className={styles['errorLabel']}>
        <span aria-hidden="true" className={styles['errorAccent']}>
          $
        </span>{' '}
        {notFound ? '404 — NOT FOUND' : 'UNEXPECTED ERROR'}
      </p>
      <h1 className={styles['errorTitle']}>
        {notFound ? (
          <>
            This page doesn't{' '}
            <span className={styles['errorAccent']}>exist</span>.
          </>
        ) : (
          <>
            Something <span className={styles['errorAccent']}>broke</span>.
          </>
        )}
      </h1>
      <p className={styles['errorText']}>
        {notFound
          ? 'Maybe it never did, maybe it moved. Either way, the good stuff is on the homepage.'
          : 'Not your fault. Try again in a moment, or head back home.'}
      </p>
      <Link to="/" variant="plain" className={styles['errorLink']}>
        ← back to the blog
      </Link>
    </main>
  );
}
