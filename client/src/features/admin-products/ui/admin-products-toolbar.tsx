import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useDebouncedValue } from '@shared/hooks';
import { PRODUCT_SEARCH_QUERY_MAX_LENGTH } from '@shared/lib';
import { Button, Input } from '@shared/ui';

import styles from './admin-products-toolbar.module.scss';

const ADMIN_PRODUCTS_SEARCH_DELAY_MILLISECONDS = 500;

interface AdminProductsToolbarProps {
  readonly searchQuery: string;
  readonly isProductsRefreshing: boolean;
  readonly onSearchQueryChange: (searchQuery: string) => void;
  readonly onProductsRefresh: () => void;
}

export const AdminProductsToolbar = ({
  searchQuery,
  isProductsRefreshing,
  onSearchQueryChange,
  onProductsRefresh,
}: AdminProductsToolbarProps) => {
  const onSearchQueryChangeReference = useRef(onSearchQueryChange);
  const isSynchronizingExternalSearchQueryReference = useRef(false);

  const [inputSearchQuery, setInputSearchQuery] = useState(searchQuery);

  const debouncedSearchQuery = useDebouncedValue(
    inputSearchQuery,
    ADMIN_PRODUCTS_SEARCH_DELAY_MILLISECONDS,
  );

  useEffect(() => {
    onSearchQueryChangeReference.current = onSearchQueryChange;
  }, [onSearchQueryChange]);

  useEffect(() => {
    isSynchronizingExternalSearchQueryReference.current = true;
    setInputSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isSynchronizingExternalSearchQueryReference.current) {
      if (debouncedSearchQuery === searchQuery) {
        isSynchronizingExternalSearchQueryReference.current = false;
      }

      return;
    }

    if (debouncedSearchQuery === searchQuery) {
      return;
    }

    onSearchQueryChangeReference.current(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchQuery]);

  function handleSearchInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setInputSearchQuery(event.target.value);
  }

  return (
    <div className={styles.toolbar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        inputProps={{
          maxLength: PRODUCT_SEARCH_QUERY_MAX_LENGTH,
        }}
        value={inputSearchQuery}
        onChange={handleSearchInputChange}
      />

      <Button
        type="button"
        onClick={onProductsRefresh}
        disabled={isProductsRefreshing}
      >
        Обновить
      </Button>
    </div>
  );
};
