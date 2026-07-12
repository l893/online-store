import { useEffect, useRef, useState } from 'react';
import { Input } from '../shared/ui';
import { useDebouncedValue } from '../shared/hooks';
import styles from './search-bar.module.scss';

export const SearchBar = ({ value = '', onChange }) => {
  const [searchValue, setSearchValue] = useState(value);
  const onChangeRef = useRef(onChange);
  const debouncedSearchValue = useDebouncedValue(searchValue, 500);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
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
