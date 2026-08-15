import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { ErrorBoundary } from './error-boundary';

interface RouteAwareErrorBoundaryProps {
  readonly children: ReactNode;
}

export const RouteAwareErrorBoundary = ({
  children,
}: RouteAwareErrorBoundaryProps) => {
  const { pathname, search } = useLocation();
  const locationKey = `${pathname}${search}`;

  return <ErrorBoundary key={locationKey}>{children}</ErrorBoundary>;
};
