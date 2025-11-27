import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductQuery } from '../../entities/products';
import { addItem } from '../../features/cart';
import { Button, Loader } from '../../shared/ui';

export const ProductPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductQuery(slug, {
    skip: !slug,
  });

  if (!slug) {
    return <div className="p-4">Товар не найден</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-red-600">
        Ошибка при загрузке товара:{' '}
        {error?.data?.message || 'неизвестная ошибка'}
      </div>
    );
  }

  if (!product) {
    return <div className="p-4">Товар не найден</div>;
  }

  const handleAddToCart = () => {
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
      }),
    );
  };

  return (
    <section className="mt-6">
      <div className="border rounded-xl bg-gray-50 p-6 flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        <div className="w-full md:w-56 h-56 bg-amber-50 rounded-lg border flex items-center justify-center">
          Фото
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold">{product.title}</h1>
            <p className="mt-1 text-xs text-gray-500">
              id товара: {product._id}
            </p>
          </div>

          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Количество:</span>{' '}
              {typeof product.stock === 'number' ? product.stock : '—'}
            </div>
            <div>
              <span className="font-medium">Стоимость:</span>{' '}
              {product.price?.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-700">{product.description}</p>
          )}
        </div>

        <div className="flex md:flex-col items-end justify-between gap-4">
          <Button onClick={handleAddToCart}>Купить</Button>
        </div>
      </div>
    </section>
  );
};
