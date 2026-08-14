import { api } from '@shared/lib';

import type {
  AdminCreateProductResponse,
  AdminDeleteProductResponse,
  AdminProductPayload,
  AdminProductsListQuery,
  AdminProductsListResponse,
  AdminUpdateProductRequest,
  AdminUpdateProductResponse,
} from './products.types';

interface AdminProductTag {
  readonly type: 'AdminProduct';
  readonly id: string;
}

function createAdminProductTag(id: string): AdminProductTag {
  return {
    type: 'AdminProduct',
    id,
  };
}

export const adminProductsApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    adminListProducts: endpointBuilder.query<
      AdminProductsListResponse,
      AdminProductsListQuery | void
    >({
      query: (queryParameters) => {
        const { search = '', page = 1, limit = 20 } = queryParameters ?? {};

        return {
          url: '/admin/products',
          params: { search, page, limit },
        };
      },
      providesTags: (productsResponse) =>
        productsResponse?.items
          ? [
              ...productsResponse.items.map((product) =>
                createAdminProductTag(product._id),
              ),
              createAdminProductTag('LIST'),
            ]
          : [createAdminProductTag('LIST')],
    }),
    adminCreateProduct: endpointBuilder.mutation<
      AdminCreateProductResponse,
      AdminProductPayload
    >({
      query: (productPayload) => ({
        url: '/admin/products',
        method: 'POST',
        body: productPayload,
      }),
      invalidatesTags: [
        {
          type: 'AdminProduct',
          id: 'LIST',
        },
        'Product',
      ],
    }),
    adminUpdateProduct: endpointBuilder.mutation<
      AdminUpdateProductResponse,
      AdminUpdateProductRequest
    >({
      query: ({ id: productId, ...productChanges }) => ({
        url: `/admin/products/${productId}`,
        method: 'PATCH',
        body: productChanges,
      }),
      invalidatesTags: (response, error, queryArgument) => [
        {
          type: 'AdminProduct',
          id: queryArgument.id,
        },
        {
          type: 'AdminProduct',
          id: 'LIST',
        },
        'Product',
      ],
    }),
    adminDeleteProduct: endpointBuilder.mutation<
      AdminDeleteProductResponse,
      string
    >({
      query: (productId) => ({
        url: `/admin/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        {
          type: 'AdminProduct',
          id: 'LIST',
        },
        'Product',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminListProductsQuery,
  useAdminCreateProductMutation,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} = adminProductsApi;
