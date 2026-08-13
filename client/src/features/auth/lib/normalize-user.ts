import type { AuthenticationUserDto } from '../api/auth.types';
import type { AuthenticatedUser } from '../model/auth.types';

export const normalizeUser = (
  user: AuthenticationUserDto,
): AuthenticatedUser => ({
  ...user,
  roles: user?.roles?.length ? [...user.roles] : ['user'],
});
