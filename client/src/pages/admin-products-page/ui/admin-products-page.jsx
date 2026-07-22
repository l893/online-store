import { useState, useMemo } from 'react';
import { useListCategoriesQuery } from '../../../entities/categories';
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
} from '../../../features/admin-products';
import { useQueryParams } from '../../../shared/hooks';
import { ConfirmDialog, Loader } from '../../../shared/ui';
import styles from './admin-products-page.module.scss';

export const AdminProductsPage = () => {
  const [queryParameters, setQueryParameters] = useQueryParams();
  const [searchValue, setSearchValue] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productIdPendingDeletion, setProductIdPendingDeletion] =
    useState(null);

  const pageParameterValue = Number(queryParameters.get('page') || 1);
  const currentPage =
    Number.isInteger(pageParameterValue) && pageParameterValue > 0
      ? pageParameterValue
      : 1;

  const {
    data: productsResponse,
    isFetching: isProductsFetching,
    refetch: refetchProducts,
  } = useAdminListProductsQuery({
    search: searchValue,
    page: currentPage,
    limit: 10,
  });
  const { data: categoriesResponse } = useListCategoriesQuery();

  const [
    createProduct,
    { isLoading: isCreatingProduct, error: createProductError },
  ] = useAdminCreateProductMutation();
  const [
    updateProduct,
    { isLoading: isUpdatingProduct, error: updateProductError },
  ] = useAdminUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] =
    useAdminDeleteProductMutation();

  const categories = categoriesResponse?.items || categoriesResponse || [];
  const products = productsResponse?.items || [];
  const totalPages = productsResponse?.pages || 1;

  const productFormInitialValues = useMemo(
    () => createProductFormInitialValues(editingProduct),
    [editingProduct],
  );

  async function handleCreate(productFormValues) {
    const productPayload = createProductPayload(productFormValues);
    await createProduct(productPayload).unwrap();
    setQueryParameters({ page: null });
    setEditingProduct(null);
    refetchProducts();
  }

  async function handleUpdate(productFormValues) {
    const productPayload = createProductPayload(productFormValues);
    await updateProduct({
      id: editingProduct._id,
      ...productPayload,
    }).unwrap();
    setEditingProduct(null);
    refetchProducts();
  }

  async function handleDeleteConfirm() {
    if (!productIdPendingDeletion) {
      return;
    }

    await deleteProduct(productIdPendingDeletion).unwrap();
    setProductIdPendingDeletion(null);
    refetchProducts();
  }

  function handleSearchValueChange(nextSearchValue) {
    setSearchValue(nextSearchValue);
    setQueryParameters({ page: null });
  }

  function handleRefreshButtonClick() {
    refetchProducts();
  }

  function handleEditButtonClick(product) {
    setEditingProduct(product);
  }

  function handleDeleteButtonClick(event, productId) {
    event.currentTarget.blur();
    setProductIdPendingDeletion(productId);
  }

  function handlePreviousPageButtonClick() {
    const previousPage = Math.max(1, currentPage - 1);

    setQueryParameters({
      page: previousPage === 1 ? null : previousPage,
    });
  }

  function handleNextPageButtonClick() {
    const nextPage = Math.min(totalPages, currentPage + 1);

    setQueryParameters({
      page: nextPage === 1 ? null : nextPage,
    });
  }

  function handleDeleteDialogCancel() {
    setProductIdPendingDeletion(null);
  }

  return (
    <div className={styles.adminProductsLayout}>
      <div className={styles.formSection}>
        <AdminProductFormPanel
          isEditing={Boolean(editingProduct)}
          initialValues={productFormInitialValues}
          categories={categories}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          submissionError={createProductError || updateProductError}
        />
      </div>
      <div className={styles.productsSection}>
        <AdminProductsToolbar
          searchValue={searchValue}
          isRefreshing={isProductsFetching}
          onSearchValueChange={handleSearchValueChange}
          onRefresh={handleRefreshButtonClick}
        />

        {(isCreatingProduct || isUpdatingProduct || isDeletingProduct) && (
          <div className={styles.operationLoader}>
            <Loader label="Выполняется операция…" />
          </div>
        )}

        <AdminProductsTable
          products={products}
          onEditProduct={handleEditButtonClick}
          onDeleteProduct={handleDeleteButtonClick}
        />

        {totalPages > 1 && (
          <AdminProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPageButtonClick}
            onNextPage={handleNextPageButtonClick}
          />
        )}

        <ConfirmDialog
          open={Boolean(productIdPendingDeletion)}
          title="Удалить товар?"
          description="Действие нельзя отменить."
          onCancel={handleDeleteDialogCancel}
          onConfirm={handleDeleteConfirm}
          confirmText="Удалить"
        />
      </div>
    </div>
  );
};
