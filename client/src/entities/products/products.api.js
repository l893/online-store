import { api } from '../../shared/lib/api';

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query({
      query: (params) => ({ url: '/products', params }),
      keepUnusedDataFor: 60,
    }),
    getProduct: build.query({
      query: (slug) => `/products/${slug}`,
    }),
  }),
  overrideExisting: false,
});

export const { useListProductsQuery, useGetProductQuery } = productsApi;
