import { api } from '../../../shared/lib/api';

export const adminProductsApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    adminListProducts: endpointBuilder.query({
      query: ({ search = '', page = 1, limit = 20 } = {}) => ({
        url: '/admin/products',
        params: { search, page, limit },
      }),
      providesTags: (productsResponse) =>
        productsResponse?.items
          ? [
              ...productsResponse.items.map((product) => ({
                type: 'AdminProduct',
                id: product._id,
              })),
              { type: 'AdminProduct', id: 'LIST' },
            ]
          : [{ type: 'AdminProduct', id: 'LIST' }],
    }),
    adminCreateProduct: endpointBuilder.mutation({
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
    adminUpdateProduct: endpointBuilder.mutation({
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
    adminDeleteProduct: endpointBuilder.mutation({
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
