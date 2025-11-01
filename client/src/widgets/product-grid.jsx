import { ProductCard } from '../entities/products';

export const ProductGrid = ({ items }) => {
  return (
    <div className="space-y-4">
      {items?.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  );
};
