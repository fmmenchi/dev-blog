import { data } from 'react-router';

/**
 * Catch-all: URLs matching no route become a clean thrown 404 (rendered by
 * the root ErrorBoundary) instead of React Router's internal
 * "No route matches URL" error log.
 */
export function loader() {
  throw data(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
