export interface AuthenticatedUserContext {
  readonly id: string;
  readonly roles: readonly string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}
