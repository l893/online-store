import { api } from '../../shared/lib/api';

export const categoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCategories: build.query({
      query: () => '/categories',
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useListCategoriesQuery } = categoriesApi;
