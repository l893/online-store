import { useEffect, useRef, useState } from 'react';
import { Input } from '../../../shared/ui';
import { useDebouncedValue } from '../../../shared/hooks';
import styles from './search-bar.module.scss';

export const SearchBar = ({ value = '', onChange }) => {
  const [searchValue, setSearchValue] = useState(value);
  const onChangeRef = useRef(onChange);
  const isSynchronizingExternalValueReference = useRef(false);
  const debouncedSearchValue = useDebouncedValue(searchValue, 500);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    isSynchronizingExternalValueReference.current = true;
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    if (isSynchronizingExternalValueReference.current) {
      if (debouncedSearchValue === value) {
        isSynchronizingExternalValueReference.current = false;
      }

      return;
    }

    if (debouncedSearchValue === value) {
      return;
    }

    onChangeRef.current?.(debouncedSearchValue);
  }, [debouncedSearchValue, value]);

  return (
    <div className={styles.searchBar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />
    </div>
  );
};
