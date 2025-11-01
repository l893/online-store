import { Button } from '../shared/ui';

export const SortControls = ({ value = 'price_asc', onChange }) => {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-600">Сортировать:</span>
      <Button
        onClick={() => onChange('price_asc')}
        className={value === 'price_asc' ? 'bg-amber-200' : ''}
      >
        По цене ↑
      </Button>
      <Button
        onClick={() => onChange('price_desc')}
        className={value === 'price_desc' ? 'bg-amber-200' : ''}
      >
        По цене ↓
      </Button>
    </div>
  );
};
