import { useState, useEffect } from 'react';
import { Input } from '../shared/ui';
import { useDebouncedValue } from '../shared/hooks';

export const SearchBar = ({ value, onChange }) => {
  const [local, setLocal] = useState(value || '');
  const debounced = useDebouncedValue(local, 500);

  useEffect(() => {
    onChange?.(debounced);
  }, [debounced]);

  return (
    <div className="mt-4">
      <Input
        placeholder="Поиск по названию…"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  );
};
