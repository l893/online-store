import { useEffect, useRef, useState } from 'react';
import { Input } from '../shared/ui';
import { useDebouncedValue } from '../shared/hooks';
import styles from './search-bar.module.scss';

export const SearchBar = ({ value, onChange }) => {
  const [local, setLocal] = useState(value || '');
  const onChangeRef = useRef(onChange);
  const debounced = useDebouncedValue(local, 500);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.(debounced);
  }, [debounced]);

  return (
    <div className={styles.searchBar}>
      <Input
        placeholder="Поиск по названию…"
        autoComplete="off"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
      />
    </div>
  );
};
