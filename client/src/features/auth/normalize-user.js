export const normalizeUser = (user) => ({
  ...user,
  role: user?.roles?.[0] || 'user',
});
