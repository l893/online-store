import { useEffect, useMemo, useState } from 'react';
import { useListCategoriesQuery } from '@entities/categories';
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
} from '@features/admin-products';
import { useQueryParams } from '@shared/hooks';
import { ConfirmDialog, Loader } from '@shared/ui';
import styles from './admin-products-page.module.scss';

export const AdminProductsPage = () => {
  const [queryParameters, setQueryParameters] = useQueryParams();
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormResetRevision, setProductFormResetRevision] = useState(0);
  const [productIdPendingDeletion, setProductIdPendingDeletion] =
    useState(null);

  const searchQuery = queryParameters.get('search') || '';
  const pageParameterValue = Number(queryParameters.get('page') || 1);
  const currentPage =
    Number.isInteger(pageParameterValue) && pageParameterValue > 0
      ? pageParameterValue
      : 1;

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    refetch: refetchProducts,
  } = useAdminListProductsQuery({
    search: searchQuery,
    page: currentPage,
    limit: 10,
  });
  const { data: categoriesResponse } = useListCategoriesQuery();

  const [
    createProduct,
    {
      isLoading: isCreatingProduct,
      error: createProductError,
      reset: resetCreateProductMutation,
    },
  ] = useAdminCreateProductMutation();
  const [
    updateProduct,
    {
      isLoading: isUpdatingProduct,
      error: updateProductError,
      reset: resetUpdateProductMutation,
    },
  ] = useAdminUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] =
    useAdminDeleteProductMutation();

  const categories = categoriesResponse?.items || categoriesResponse || [];
  const products = productsResponse?.items || [];
  const totalPages = productsResponse?.pages || 1;
  const isProductMutationPending =
    isCreatingProduct || isUpdatingProduct || isDeletingProduct;
  const isInitialProductsLoading = isProductsLoading && !productsResponse;
  const isProductsBackgroundRefreshing =
    isProductsFetching && Boolean(productsResponse);
  const isProductsStatusVisible =
    isProductMutationPending || isProductsBackgroundRefreshing;

  useEffect(() => {
    const isCurrentPageResponse = productsResponse?.page === currentPage;

    if (!isCurrentPageResponse || currentPage <= totalPages) {
      return;
    }

    setQueryParameters(
      {
        page: totalPages === 1 ? null : totalPages,
      },
      {
        replace: true,
      },
    );
  }, [currentPage, productsResponse, setQueryParameters, totalPages]);

  const productFormInitialValues = useMemo(
    () => createProductFormInitialValues(editingProduct),
    [editingProduct],
  );

  async function handleCreate(productFormValues) {
    resetProductMutationErrors();

    const productPayload = createProductPayload(productFormValues);
    await createProduct(productPayload).unwrap();
    setQueryParameters({ page: null });
    resetProductForm();
  }

  async function handleUpdate(productFormValues) {
    resetProductMutationErrors();

    const productPayload = createProductPayload(productFormValues);
    await updateProduct({
      id: editingProduct._id,
      ...productPayload,
    }).unwrap();
    resetProductForm();
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProductFormResetRevision(
      (currentProductFormResetRevision) => currentProductFormResetRevision + 1,
    );
    resetProductMutationErrors();
  }

  function resetProductMutationErrors() {
    resetCreateProductMutation();
    resetUpdateProductMutation();
  }

  async function handleDeleteConfirm() {
    if (!productIdPendingDeletion) {
      return;
    }

    await deleteProduct(productIdPendingDeletion).unwrap();
    setProductIdPendingDeletion(null);
  }

  function handleSearchQueryChange(nextSearchQuery) {
    setQueryParameters({
      search: nextSearchQuery,
      page: null,
    });
  }

  function handleProductsRefresh() {
    refetchProducts();
  }

  function handleEditButtonClick(product) {
    resetProductMutationErrors();
    setEditingProduct(product);
  }

  function handleDeleteButtonClick(event, productId) {
    event.currentTarget.blur();
    setProductIdPendingDeletion(productId);
  }

  function handlePreviousPageButtonClick() {
    const previousPage = Math.max(1, currentPage - 1);

    setQueryParameters(
      {
        page: previousPage === 1 ? null : previousPage,
      },
      {
        replace: false,
      },
    );
  }

  function handleNextPageButtonClick() {
    const nextPage = Math.min(totalPages, currentPage + 1);

    setQueryParameters(
      {
        page: nextPage === 1 ? null : nextPage,
      },
      {
        replace: false,
      },
    );
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
          formResetRevision={productFormResetRevision}
          categories={categories}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          submissionError={createProductError || updateProductError}
        />
      </div>
      <div className={styles.productsSection}>
        <AdminProductsToolbar
          searchQuery={searchQuery}
          isProductsRefreshing={isProductsFetching}
          onSearchQueryChange={handleSearchQueryChange}
          onProductsRefresh={handleProductsRefresh}
        />

        <div
          className={styles.productsResults}
          aria-busy={isProductsFetching || isProductMutationPending}
        >
          {isInitialProductsLoading ? (
            <div className={styles.initialProductsLoader}>
              <Loader label="Загружаем товары…" />
            </div>
          ) : (
            <>
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
            </>
          )}

          {isProductsStatusVisible && (
            <div
              className={styles.productsStatusIndicator}
              role="status"
              aria-live="polite"
            >
              <Loader
                label={
                  isProductMutationPending
                    ? 'Выполняется операция…'
                    : 'Обновляем товары…'
                }
              />
            </div>
          )}
        </div>

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
