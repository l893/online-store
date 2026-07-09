import { useState, useMemo } from 'react';
import { useListCategoriesQuery } from '../../entities/categories';
import {
  useAdminCreateProductMutation,
  useAdminListProductsQuery,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} from '../../features/admin-products';
import { ProductForm } from '../../features/admin-products';
import { Button, ConfirmDialog, Input, Loader } from '../../shared/ui';
import { parseApiError } from '../../shared/lib';
import styles from './admin-products-page.module.scss';

export const AdminProductsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
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
  const items = data?.items || [];
  const pages = data?.pages || 1;
  const initial = useMemo(
    () =>
      editing
        ? {
            ...editing,
            image: editing.images?.[0] || '',
          }
        : null,
    [editing],
  );

  async function handleCreate(values) {
    const body = { ...values, images: values.image ? [values.image] : [] };
    await createProduct(body).unwrap();
    setPage(1);
    setEditing(null);
    refetch();
  }

  async function handleUpdate(values) {
    const body = { ...values, images: values.image ? [values.image] : [] };
    await updateProduct({ id: editing._id, ...body }).unwrap();
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
    setPage(1);
  }

  function handleDeleteButtonClick(event, productId) {
    event.currentTarget.blur();
    setConfirmId(productId);
  }

  return (
    <div className={styles.adminProductsLayout}>
      <div className={styles.formSection}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>
            {editing ? 'Редактирование' : 'Добавление товара'}
          </h2>
          <ProductForm
            initial={initial}
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
          <Button type="button" onClick={() => refetch()} disabled={isFetching}>
            Обновить
          </Button>
        </div>

        {(creating || updating || deleting) && (
          <div className={styles.operationLoader}>
            <Loader label="Выполняется операция…" />
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.productsTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={`${styles.tableHeadCell} ${styles.leftCell}`}>
                  Название
                </th>
                <th className={styles.tableHeadCell}>Цена</th>
                <th className={styles.tableHeadCell}>Категория</th>
                <th className={styles.tableHeadCell}>Ост.</th>
                <th className={styles.tableHeadCell}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {product.title}
                    <div className={styles.productSlug}>{product.slug}</div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.centerCell}`}>
                    {product.price} ₽
                  </td>
                  <td className={`${styles.tableCell} ${styles.centerCell}`}>
                    {product.categoryName || ''}
                  </td>
                  <td className={`${styles.tableCell} ${styles.centerCell}`}>
                    {product.stock ?? 0}
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                    <div className={styles.actions}>
                      <Button type="button" onClick={() => setEditing(product)}>
                        Ред.
                      </Button>
                      <Button
                        type="button"
                        color="error"
                        onClick={(event) =>
                          handleDeleteButtonClick(event, product._id)
                        }
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className={styles.emptyCell} colSpan={5}>
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className={styles.pagination}>
            <Button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={page <= 1}
            >
              Назад
            </Button>
            <span className={styles.paginationText}>
              Стр. {page} из {pages}
            </span>
            <Button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.min(pages, currentPage + 1))
              }
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
          onCancel={() => setConfirmId(null)}
          onConfirm={confirmDelete}
          confirmText="Удалить"
        />
      </div>
    </div>
  );
};
