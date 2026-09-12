'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchMplads, type MpladsEndpoint } from './mplads';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useMplads<T = unknown>(
  endpoint: MpladsEndpoint,
  params?: string,
  enabled = true
): State<T> & { refresh: () => void } {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchMplads<T>(endpoint, params)
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (alive)
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          }));
      });
    return () => {
      alive = false;
    };
  }, [endpoint, params, enabled, tick]);

  return { ...state, refresh };
}
