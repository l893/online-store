import { Button } from '../../shared/ui';
import { useDispatch } from 'react-redux';
import { addItem } from '../../features/cart';
import { Link } from 'react-router-dom';

export const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  return (
    <div className="border rounded-xl p-4 bg-white flex gap-4 items-start">
      <div className="w-28 h-28 bg-amber-50 rounded-lg border flex items-center justify-center">
        Фото
      </div>
      <div className="flex-1">
        <Link to={`/product/${p.slug}`} className="font-semibold">
          {p.title}
        </Link>
        <div className="text-sm text-gray-500">id: {p._id}</div>
        <div className="mt-1 font-medium">{p.price} ₽</div>
      </div>
      <Button
        onClick={() =>
          dispatch(
            addItem({
              productId: p._id,
              title: p.title,
              price: p.price,
              image: p.images?.[0],
            }),
          )
        }
      >
        В корзину
      </Button>
    </div>
  );
};
