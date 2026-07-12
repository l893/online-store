import { useState, useMemo } from 'react';
import { useListCategoriesQuery } from '../../entities/categories';
import {
  AdminProductsTable,
  ProductForm,
  createProductFormInitialValues,
  createProductPayload,
  useAdminCreateProductMutation,
  useAdminListProductsQuery,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} from '../../features/admin-products';
import { useQueryParams } from '../../shared/hooks';
import { Button, ConfirmDialog, Input, Loader } from '../../shared/ui';
import { parseApiError } from '../../shared/lib';
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

  function handleSearchInputChange(event) {
    setSearch(event.target.value);
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
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>
            {editing ? 'Редактирование' : 'Добавление товара'}
          </h2>
          <ProductForm
            initial={productFormInitialValues}
            categories={categories}
            onSubmit={editing ? handleUpdate : handleCreate}
            submitText={editing ? 'Сохранить' : 'Добавить'}
          />
          {(createError || updateError) && (
            <div className={styles.formError}>
              {parseApiError(createError || updateError)}
            </div>
          )}
        </div>
      </div>

      <div className={styles.productsSection}>
        <div className={styles.toolbar}>
          <Input
            placeholder="Поиск по названию…"
            autoComplete="off"
            value={search}
            onChange={handleSearchInputChange}
          />
          <Button
            type="button"
            onClick={handleRefreshButtonClick}
            disabled={isFetching}
          >
            Обновить
          </Button>
        </div>

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
          <div className={styles.pagination}>
            <Button
              type="button"
              onClick={handlePreviousPageButtonClick}
              disabled={page <= 1}
            >
              Назад
            </Button>
            <span className={styles.paginationText}>
              Стр. {page} из {pages}
            </span>
            <Button
              type="button"
              onClick={handleNextPageButtonClick}
              disabled={page >= pages}
            >
              Вперёд
            </Button>
          </div>
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
