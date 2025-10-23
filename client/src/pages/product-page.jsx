import { useParams } from 'react-router-dom';

export const ProductPage = () => {
  const { slug } = useParams();

  return (
    <div className="p-4">
      Product page for: <b>{slug}</b>
    </div>
  );
};
