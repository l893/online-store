import { Button } from '@shared/ui';
import styles from './sort-controls.module.scss';

export const SortControls = ({ sortValue = 'price_asc', onSortChange }) => {
  const isPriceAscendingActive = sortValue === 'price_asc';
  const isPriceDescendingActive = sortValue === 'price_desc';

  return (
    <div className={styles.sortControls}>
      <span className={styles.label}>Сортировать:</span>
      <Button
        type="button"
        variant={isPriceAscendingActive ? 'contained' : 'outlined'}
        onClick={() => onSortChange('price_asc')}
      >
        По цене ↑
      </Button>
      <Button
        type="button"
        variant={isPriceDescendingActive ? 'contained' : 'outlined'}
        onClick={() => onSortChange('price_desc')}
      >
        По цене ↓
      </Button>
    </div>
  );
};
