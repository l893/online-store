import { useEffect, useState } from 'react';

export function useDebouncedValue(sourceValue, delayMilliseconds = 400) {
  const [debouncedValue, setDebouncedValue] = useState(sourceValue);

  useEffect(() => {
    const timeoutIdentifier = window.setTimeout(() => {
      setDebouncedValue(sourceValue);
    }, delayMilliseconds);

    return () => {
      window.clearTimeout(timeoutIdentifier);
    };
  }, [sourceValue, delayMilliseconds]);

  return debouncedValue;
}
