import { Button, Input } from '../../../shared/ui';
import styles from './admin-products-toolbar.module.scss';

export const AdminProductsToolbar = ({
  searchValue,
  isRefreshing,
  onSearchValueChange,
  onRefresh,
}) => {
  function handleSearchInputChange(event) {
    onSearchValueChange(event.target.value);
  }

  return (
    <div className={styles.toolbar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        value={searchValue}
        onChange={handleSearchInputChange}
      />

      <Button type="button" onClick={onRefresh} disabled={isRefreshing}>
        Обновить
      </Button>
    </div>
  );
};
