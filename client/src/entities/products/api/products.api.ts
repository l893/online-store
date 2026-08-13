import { api } from '@shared/lib';

import type { Product } from '../model/product.types';
import type {
  ProductAvailabilityResponse,
  ProductListQueryParameters,
  ProductListResponse,
} from './products.types';

export const productsApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    listProducts: endpointBuilder.query<
      ProductListResponse,
      ProductListQueryParameters
    >({
      query: (queryParameters) => ({
        url: '/products',
        params: queryParameters,
      }),
      keepUnusedDataFor: 60,
      providesTags: ['Product'],
    }),
    getProduct: endpointBuilder.query<Product, string>({
      query: (productSlug) => `/products/${productSlug}`,
      providesTags: ['Product'],
    }),
    getProductsAvailability: endpointBuilder.query<
      ProductAvailabilityResponse,
      readonly string[]
    >({
      query: (productIds) => ({
        url: '/products/availability',
        method: 'POST',
        body: {
          productIds,
        },
      }),
      providesTags: ['Product'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useGetProductsAvailabilityQuery,
} = productsApi;
