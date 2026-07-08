import { api } from '../../../shared/lib/api';

export const adminProductsApi = api.injectEndpoints({
  endpoints: (build) => ({
    adminListProducts: build.query({
      query: ({ search = '', page = 1, limit = 20 } = {}) => ({
        url: '/admin/products',
        params: { search, page, limit },
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((p) => ({ type: 'AdminProduct', id: p._id })),
              { type: 'AdminProduct', id: 'LIST' },
            ]
          : [{ type: 'AdminProduct', id: 'LIST' }],
    }),
    adminCreateProduct: build.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminProduct', id: 'LIST' }],
    }),
    adminUpdateProduct: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: 'AdminProduct', id: arg.id },
        { type: 'AdminProduct', id: 'LIST' },
      ],
    }),
    adminDeleteProduct: build.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminProduct', id: 'LIST' }],
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
