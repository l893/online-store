export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface AuthState {
  user: AuthenticatedUser | null;
}
