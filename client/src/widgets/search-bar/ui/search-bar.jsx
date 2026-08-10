import { useEffect, useRef, useState } from 'react';
import { Input } from '../../../shared/ui';
import { useDebouncedValue } from '../../../shared/hooks';
import { PRODUCT_SEARCH_QUERY_MAX_LENGTH } from '../../../shared/lib';
import styles from './search-bar.module.scss';

export const SearchBar = ({ searchQuery = '', onSearchQueryChange }) => {
  const [inputSearchQuery, setInputSearchQuery] = useState(searchQuery);
  const onSearchQueryChangeReference = useRef(onSearchQueryChange);
  const isSynchronizingExternalSearchQueryReference = useRef(false);
  const debouncedSearchQuery = useDebouncedValue(inputSearchQuery, 500);

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

    onSearchQueryChangeReference.current?.(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchQuery]);

  return (
    <div className={styles.searchBar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        inputProps={{
          maxLength: PRODUCT_SEARCH_QUERY_MAX_LENGTH,
        }}
        value={inputSearchQuery}
        onChange={(event) => setInputSearchQuery(event.target.value)}
      />
    </div>
  );
};
