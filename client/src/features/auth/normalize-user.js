export const normalizeUser = (user) => ({
  ...user,
  roles: user?.roles?.length ? user.roles : ['user'],
});
