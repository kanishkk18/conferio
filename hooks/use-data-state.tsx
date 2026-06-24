'use client';

import * as React from 'react';

type DataStateValue = string | boolean | null;

function parseDatasetValue(value: string | null): DataStateValue {
  if (value === null) return null;
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function useDataState<T extends HTMLElement = HTMLElement>(
  key: string,
  forwardedRef?: React.Ref<T | null>,
  onChange?: (value: DataStateValue) => void,
): [DataStateValue, React.RefObject<T | null>] {
  const localRef = React.useRef<T | null>(null);
  const onChangeRef = React.useRef(onChange);

  // Keep callback ref fresh without triggering re-subscription
  React.useImperativeHandle(forwardedRef, () => localRef.current as T);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const getSnapshot = React.useCallback((): DataStateValue => {
    const el = localRef.current;
    return el ? parseDatasetValue(el.getAttribute(`data-${key}`)) : null;
  }, [key]);

  // 🔴 REMOVED: useEffect(() => { onChange?.(value) }, [value, onChange]);

  // ✅ CHANGED: Call onChange inside subscribe when MutationObserver fires
  const subscribe = React.useCallback((callback: () => void) => {
    const el = localRef.current;
    if (!el) return () => {};

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.attributeName === `data-${key}`) {
          // Notify parent callback directly from subscription
          const newValue = parseDatasetValue(el.getAttribute(`data-${key}`));
          onChangeRef.current?.(newValue);
          callback();
          break;
        }
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: [`data-${key}`],
    });

    return () => observer.disconnect();
  }, [key]);

  const value = React.useSyncExternalStore(subscribe, getSnapshot);

  return [value, localRef];
}

export { useDataState, type DataStateValue };