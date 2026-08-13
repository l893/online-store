import { api } from '@shared/lib';

import type { Category } from '../model/category.types';

export const categoriesApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    listCategories: endpointBuilder.query<readonly Category[], void>({
      query: () => '/categories',
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useListCategoriesQuery } = categoriesApi;
