import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useQueryParams() {
  const { search: searchString, pathname } = useLocation();
  const navigate = useNavigate();

  const queryParameters = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );

  const setQueryParameters = useCallback(
    (queryParameterUpdates, { replace = true } = {}) => {
      const nextQueryParameters = new URLSearchParams(searchString);

      Object.entries(queryParameterUpdates).forEach(
        ([queryParameterName, queryParameterValue]) => {
          if (
            queryParameterValue === undefined ||
            queryParameterValue === null ||
            queryParameterValue === ''
          ) {
            nextQueryParameters.delete(queryParameterName);
            return;
          }

          nextQueryParameters.set(
            queryParameterName,
            String(queryParameterValue),
          );
        },
      );

      const nextSearchString = nextQueryParameters.toString();

      navigate(
        {
          pathname,
          search: nextSearchString ? `?${nextSearchString}` : '',
        },
        {
          replace,
        },
      );
    },
    [navigate, pathname, searchString],
  );

  return [queryParameters, setQueryParameters];
}
