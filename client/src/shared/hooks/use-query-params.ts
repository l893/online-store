import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type QueryParameterValue = string | number | null | undefined;

export type QueryParameterUpdates = Record<string, QueryParameterValue>;

export interface SetQueryParametersOptions {
  readonly replace?: boolean;
  readonly navigationState?: unknown;
}

export type SetQueryParameters = (
  queryParameterUpdates: QueryParameterUpdates,
  options?: SetQueryParametersOptions,
) => void;

export type UseQueryParamsResult = readonly [
  queryParameters: URLSearchParams,
  setQueryParameters: SetQueryParameters,
];

export function useQueryParams(): UseQueryParamsResult {
  const { search: searchString, pathname } = useLocation();
  const navigate = useNavigate();

  const queryParameters = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );

  const setQueryParameters = useCallback(
    (
      queryParameterUpdates: QueryParameterUpdates,
      { replace = true, navigationState }: SetQueryParametersOptions = {},
    ): void => {
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
          state: navigationState,
        },
      );
    },
    [navigate, pathname, searchString],
  );

  return [queryParameters, setQueryParameters];
}
