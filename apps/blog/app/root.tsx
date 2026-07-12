import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from 'react-router';

import themeStylesheetUrl from '@dev-blog/theme/styles/tailwind.css?url';
import { Button, Link, RouteErrorBoundary } from '@dev-blog/ui';

import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import { seoMeta } from './lib/seo';
import { SITE_NAME, SITE_URL } from './lib/site';

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
    description: 'Notes on architecture, tooling and developer experience.',
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
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div id="content" className="flex flex-1 flex-col">
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
  return (
    <RouteErrorBoundary
      notFound={{
        prompt: (
          <>
            $ curl fabiomenchicchi.com/this-page{' '}
            <span className="text-primary">→ HTTP 404</span>
          </>
        ),
        title: 'Page not found',
        description:
          "The URL you're looking for doesn't exist — or I deleted it. Deleting code is an art form; deleting pages, an accident.",
        actions: (
          <Button asChild>
            <Link to="/" variant="plain">
              Back to the blog
            </Link>
          </Button>
        ),
      }}
      unexpected={{
        prompt: (
          <>
            $ tail -f /var/log/fabiomenchicchi.com{' '}
            <span className="text-primary">→ HTTP 500</span>
          </>
        ),
        title: 'Something broke',
        description:
          'A server-side error on my side, not yours. Try again in a moment; if it keeps happening, it is worth telling me.',
        actions: (
          <>
            <Button onClick={() => window.location.reload()}>
              Reload the page
            </Button>
            <Link
              to="/"
              variant="plain"
              className="font-mono text-xs text-muted-foreground no-underline [transition:var(--transition-color)] hover:text-primary"
            >
              ← or back to the blog
            </Link>
          </>
        ),
      }}
    />
  );
}
