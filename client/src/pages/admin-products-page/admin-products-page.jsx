import { useListCategoriesQuery } from '../../entities/categories';
import { useState, useMemo } from 'react';
import {
  useAdminCreateProductMutation,
  useAdminListProductsQuery,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} from '../../features/admin';
import { ProductForm } from '../../features/admin';
import { Button, ConfirmDialog, Input, Loader } from '../../shared/ui';
import { parseApiError } from '../../shared/lib';

export const AdminProductsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching, refetch } = useAdminListProductsQuery({
    search,
    page,
    limit: 10,
  });
  const { data: categoriesRes } = useListCategoriesQuery();
  const categories = categoriesRes?.items || categoriesRes || []; // на случай разной структуры

  const [createProduct, { isLoading: creating, error: createError }] =
    useAdminCreateProductMutation();
  const [updateProduct, { isLoading: updating, error: updateError }] =
    useAdminUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] =
    useAdminDeleteProductMutation();

  const [editing, setEditing] = useState(null); // текущий редактируемый товар
  const [confirmId, setConfirmId] = useState(null);

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

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-4">
        <div className="border rounded-xl p-4 bg-white">
          <h2 className="font-semibold mb-3">
            {editing ? 'Редактирование' : 'Добавление товара'}
          </h2>
          <ProductForm
            initial={initial}
            categories={categories}
            onSubmit={editing ? handleUpdate : handleCreate}
            submitText={editing ? 'Сохранить' : 'Добавить'}
          />
          {(createError || updateError) && (
            <div className="text-sm text-red-600 mt-2">
              {parseApiError(createError || updateError)}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 md:col-span-8 space-y-4">
        <div className="border rounded-xl p-3 bg-gray-50 flex items-center gap-3">
          <Input
            placeholder="Поиск по названию…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Button onClick={() => refetch()} disabled={isFetching}>
            Обновить
          </Button>
        </div>

        <div className="border rounded-xl bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Название</th>
                <th className="p-3">Цена</th>
                <th className="p-3">Категория</th>
                <th className="p-3">Ост.</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    {p.title}
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </td>
                  <td className="p-3 text-center">{p.price} ₽</td>
                  <td className="p-3 text-center">{p.categoryName || ''}</td>
                  <td className="p-3 text-center">{p.stock ?? 0}</td>
                  <td className="p-3 space-x-2 text-center">
                    <Button onClick={() => setEditing(p)}>Ред.</Button>
                    <Button
                      onClick={() => setConfirmId(p._id)}
                      className="bg-red-100 hover:bg-red-200 border-red-300"
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={5}>
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Назад
            </Button>
            <span className="text-sm text-gray-600">
              Стр. {page} из {pages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
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

        {(creating || updating || deleting) && (
          <div className="mt-3">
            <Loader label="Выполняется операция…" />
          </div>
        )}
      </div>
    </div>
  );
};
