import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useQueryParams() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const setParams = (patch) => {
    const next = new URLSearchParams(search);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k);
      else next.set(k, String(v));
    });
    navigate({ pathname, search: `?${next.toString()}` }, { replace: true });
  };

  return [params, setParams];
}
