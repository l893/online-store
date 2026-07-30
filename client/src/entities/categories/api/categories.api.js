import { api } from '../../../shared/lib';

export const categoriesApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    listCategories: endpointBuilder.query({
      query: () => '/categories',
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useListCategoriesQuery } = categoriesApi;
