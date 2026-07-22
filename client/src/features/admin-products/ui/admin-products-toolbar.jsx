import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../../shared/hooks';
import { Button, Input } from '../../../shared/ui';
import styles from './admin-products-toolbar.module.scss';

const ADMIN_PRODUCTS_SEARCH_DELAY_MILLISECONDS = 500;

export const AdminProductsToolbar = ({
  searchValue,
  isRefreshing,
  onSearchValueChange,
  onRefresh,
}) => {
  const onSearchValueChangeReference = useRef(onSearchValueChange);
  const isSynchronizingExternalSearchValueReference = useRef(false);

  const [inputSearchValue, setInputSearchValue] = useState(searchValue);

  const debouncedSearchValue = useDebouncedValue(
    inputSearchValue,
    ADMIN_PRODUCTS_SEARCH_DELAY_MILLISECONDS,
  );

  useEffect(() => {
    onSearchValueChangeReference.current = onSearchValueChange;
  }, [onSearchValueChange]);

  useEffect(() => {
    isSynchronizingExternalSearchValueReference.current = true;
    setInputSearchValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (isSynchronizingExternalSearchValueReference.current) {
      if (debouncedSearchValue === searchValue) {
        isSynchronizingExternalSearchValueReference.current = false;
      }

      return;
    }

    if (debouncedSearchValue === searchValue) {
      return;
    }

    onSearchValueChangeReference.current(debouncedSearchValue);
  }, [debouncedSearchValue, searchValue]);

  function handleSearchInputChange(event) {
    setInputSearchValue(event.target.value);
  }

  return (
    <div className={styles.toolbar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        value={inputSearchValue}
        onChange={handleSearchInputChange}
      />

      <Button type="button" onClick={onRefresh} disabled={isRefreshing}>
        Обновить
      </Button>
    </div>
  );
};
