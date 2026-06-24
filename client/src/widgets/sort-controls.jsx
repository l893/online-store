import { Button } from '../shared/ui';
import styles from './sort-controls.module.scss';

export const SortControls = ({ value = 'price_asc', onChange }) => {
  const isPriceAscendingActive = value === 'price_asc';
  const isPriceDescendingActive = value === 'price_desc';

  return (
    <div className={styles.sortControls}>
      <span className={styles.label}>Сортировать:</span>
      <Button
        type="button"
        variant={isPriceAscendingActive ? 'contained' : 'outlined'}
        onClick={() => onChange('price_asc')}
      >
        По цене ↑
      </Button>
      <Button
        type="button"
        variant={isPriceDescendingActive ? 'contained' : 'outlined'}
        onClick={() => onChange('price_desc')}
      >
        По цене ↓
      </Button>
    </div>
  );
};
