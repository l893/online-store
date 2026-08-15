import type { Request, RequestHandler } from 'express';

import { verifyAccess } from './jwt.js';

export function getAuthenticatedUserId(request: Request): string {
  const userId = request.user?.id;

  if (!userId) {
    throw new Error('Authenticated user context missing');
  }

  return userId;
}

export const requireAuth: RequestHandler = (
  request,
  response,
  nextMiddleware,
) => {
  const authorizationHeader = request.headers.authorization || '';
  const token = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : null;

  if (!token) {
    response.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const accessTokenClaims = verifyAccess(token);

    request.user = {
      id: accessTokenClaims.sub,
      roles: accessTokenClaims.roles || ['user'],
    };

    nextMiddleware();
  } catch {
    response.status(401).json({ message: 'Invalid token' });
  }
};

export function requireRole(role: string): RequestHandler {
  return (request, response, nextMiddleware) => {
    const roles = request.user?.roles || [];

    if (!roles.includes(role)) {
      response.status(403).json({ message: 'Forbidden' });
      return;
    }

    nextMiddleware();
  };
}
