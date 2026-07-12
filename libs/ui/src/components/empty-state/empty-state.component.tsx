import { ErrorState } from '../error-state/error-state.component';
import type { ErrorStateProps } from '../error-state/error-state.component';

export type EmptyStateProps = Omit<ErrorStateProps, 'variant'>;

/**
 * A list with nothing in it yet.
 *
 * It is `ErrorState`'s `empty` variant, not a second implementation of it: same
 * block, same styles, one job apart. The name exists because "the projects list
 * is empty" is not an error, and because the variant carries the thing that
 * actually differs — no `<h1>`, since the page around it already has one.
 */
export function EmptyState(props: EmptyStateProps) {
  return <ErrorState variant="empty" {...props} />;
}
