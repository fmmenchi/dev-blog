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
import { Button, ErrorState, Link } from '@dev-blog/ui';

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
      <p className={styles['errorTerminal']}>
        {notFound
          ? '$ curl fabiomenchicchi.com/this-page '
          : '$ tail -f /var/log/fabiomenchicchi.com '}
        <span className={styles['errorAccent']}>
          → HTTP {notFound ? 404 : 500}
        </span>
      </p>
      {notFound ? (
        <ErrorState
          title="Page not found"
          description="The URL you're looking for doesn't exist — or I deleted it. Deleting code is an art form; deleting pages, an accident."
        >
          <Link to="/" variant="plain" className={styles['errorAction']}>
            Back to the blog
          </Link>
        </ErrorState>
      ) : (
        <ErrorState
          title="Something broke"
          description="A server-side error. The good news: this blog is 200 lines of code, so I'll find it quickly. Try again in a moment."
        >
          <Button onClick={() => window.location.reload()}>
            Reload the page
          </Button>
          <Link to="/" variant="plain" className={styles['errorSecondary']}>
            ← or back to the blog
          </Link>
        </ErrorState>
      )}
    </main>
  );
}
