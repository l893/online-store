import { useState, useMemo } from 'react';
import { useListCategoriesQuery } from '../../entities/categories';
import {
  AdminProductFormPanel,
  AdminProductsPagination,
  AdminProductsTable,
  AdminProductsToolbar,
  createProductFormInitialValues,
  createProductPayload,
  useAdminCreateProductMutation,
  useAdminListProductsQuery,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} from '../../features/admin-products';
import { useQueryParams } from '../../shared/hooks';
import { ConfirmDialog, Loader } from '../../shared/ui';
import styles from './admin-products-page.module.scss';

export const AdminProductsPage = () => {
  const [queryParameters, setQueryParameters] = useQueryParams();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const pageParameter = Number(queryParameters.get('page') || 1);
  const page =
    Number.isInteger(pageParameter) && pageParameter > 0 ? pageParameter : 1;

  const { data, isFetching, refetch } = useAdminListProductsQuery({
    search,
    page,
    limit: 10,
  });
  const { data: categoriesResponse } = useListCategoriesQuery();

  const [createProduct, { isLoading: creating, error: createError }] =
    useAdminCreateProductMutation();
  const [updateProduct, { isLoading: updating, error: updateError }] =
    useAdminUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] =
    useAdminDeleteProductMutation();

  const categories = categoriesResponse?.items || categoriesResponse || [];
  const products = data?.items || [];
  const pages = data?.pages || 1;

  const productFormInitialValues = useMemo(
    () => createProductFormInitialValues(editing),
    [editing],
  );

  async function handleCreate(values) {
    const payload = createProductPayload(values);
    await createProduct(payload).unwrap();
    setQueryParameters({ page: null });
    setEditing(null);
    refetch();
  }

  async function handleUpdate(values) {
    const payload = createProductPayload(values);
    await updateProduct({ id: editing._id, ...payload }).unwrap();
    setEditing(null);
    refetch();
  }

  async function confirmDelete() {
    if (!confirmId) return;
    await deleteProduct(confirmId).unwrap();
    setConfirmId(null);
    refetch();
  }

  function handleSearchValueChange(searchValue) {
    setSearch(searchValue);
    setQueryParameters({ page: null });
  }

  function handleRefreshButtonClick() {
    refetch();
  }

  function handleEditButtonClick(product) {
    setEditing(product);
  }

  function handleDeleteButtonClick(event, productId) {
    event.currentTarget.blur();
    setConfirmId(productId);
  }

  function handlePreviousPageButtonClick() {
    const previousPage = Math.max(1, page - 1);

    setQueryParameters({
      page: previousPage === 1 ? null : previousPage,
    });
  }

  function handleNextPageButtonClick() {
    const nextPage = Math.min(pages, page + 1);

    setQueryParameters({
      page: nextPage === 1 ? null : nextPage,
    });
  }

  function handleDeleteDialogCancel() {
    setConfirmId(null);
  }

  return (
    <div className={styles.adminProductsLayout}>
      <div className={styles.formSection}>
        <AdminProductFormPanel
          isEditing={Boolean(editing)}
          initialValues={productFormInitialValues}
          categories={categories}
          onSubmit={editing ? handleUpdate : handleCreate}
          submissionError={createError || updateError}
        />
      </div>

      <div className={styles.productsSection}>
        <AdminProductsToolbar
          searchValue={search}
          isRefreshing={isFetching}
          onSearchValueChange={handleSearchValueChange}
          onRefresh={handleRefreshButtonClick}
        />

        {(creating || updating || deleting) && (
          <div className={styles.operationLoader}>
            <Loader label="Выполняется операция…" />
          </div>
        )}

        <AdminProductsTable
          products={products}
          onEditProduct={handleEditButtonClick}
          onDeleteProduct={handleDeleteButtonClick}
        />

        {pages > 1 && (
          <AdminProductsPagination
            currentPage={page}
            totalPages={pages}
            onPreviousPage={handlePreviousPageButtonClick}
            onNextPage={handleNextPageButtonClick}
          />
        )}

        <ConfirmDialog
          open={!!confirmId}
          title="Удалить товар?"
          description="Действие нельзя отменить."
          onCancel={handleDeleteDialogCancel}
          onConfirm={confirmDelete}
          confirmText="Удалить"
        />
      </div>
    </div>
  );
};
