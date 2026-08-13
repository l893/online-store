import { useEffect, useState } from 'react';

export function useDebouncedValue<Value>(
  sourceValue: Value,
  delayMilliseconds = 400,
): Value {
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
