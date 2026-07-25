import { api } from '../../../shared/lib/api';

export const productsApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    listProducts: endpointBuilder.query({
      query: (params) => ({ url: '/products', params }),
      keepUnusedDataFor: 60,
      providesTags: ['Product'],
    }),
    getProduct: endpointBuilder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
  }),
  overrideExisting: false,
});

export const { useListProductsQuery, useGetProductQuery } = productsApi;
