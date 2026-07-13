import type { ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { cn } from '../../internal/cn';
import { ErrorState } from '../error-state/error-state.component';

export interface RouteErrorCopy {
  title: string;
  description: string;
  /** Optional line above the title. Decorative — the message must stand alone. */
  prompt?: ReactNode;
  /** The way out. It differs per case: a 404 has nothing to retry. */
  actions?: ReactNode;
}

export interface RouteErrorBoundaryProps {
  className?: string;
  /** Copy per case. The defaults are generic; a route can say something better. */
  notFound?: RouteErrorCopy;
  unexpected?: RouteErrorCopy;
}

const DEFAULT_NOT_FOUND: RouteErrorCopy = {
  title: 'Page not found',
  description: 'The URL you are looking for does not exist.',
};

const DEFAULT_UNEXPECTED: RouteErrorCopy = {
  title: 'Something broke',
  description:
    'A server-side error. Try again in a moment; if it persists, it is on me.',
};

/**
 * The error boundary any route can export:
 * `export { RouteErrorBoundary as ErrorBoundary }`.
 *
 * A thrown 404 gets the not-found copy, anything else the generic one, and both
 * render through `ErrorState` — which owns the page and its `<h1>`, because on an
 * error page there is nothing else to be the heading.
 *
 * It exists because this logic was hardcoded in root.tsx, where no other route
 * could reach it: an error thrown deep in a route replaced the entire page
 * instead of the part that failed.
 */
export function RouteErrorBoundary({
  className,
  notFound = DEFAULT_NOT_FOUND,
  unexpected = DEFAULT_UNEXPECTED,
}: RouteErrorBoundaryProps) {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const copy = is404 ? notFound : unexpected;

  return (
    <main
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-8 py-16 text-center',
        className,
      )}
    >
      {copy.prompt ? (
        <p className="mb-7 font-mono text-xs text-muted-foreground">
          {copy.prompt}
        </p>
      ) : null}
      <ErrorState title={copy.title} description={copy.description}>
        {copy.actions}
      </ErrorState>
    </main>
  );
}
