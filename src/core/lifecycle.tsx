import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { PropsWithChildren } from 'react';
import type { LifecycleApi, LifecycleStatus } from './types';

type LifecycleState = {
  status: LifecycleStatus;
  error?: unknown;
  result?: unknown;
};

type LifecycleAction =
  | { type: 'loading' }
  | { type: 'ready' }
  | { type: 'complete'; result?: unknown }
  | { type: 'fail'; error: unknown };

type LifecycleContextValue = LifecycleState & LifecycleApi;

const initialState: LifecycleState = { status: 'initializing' };

export function lifecycleReducer(
  state: LifecycleState,
  action: LifecycleAction,
): LifecycleState {
  switch (action.type) {
    case 'loading':
      return { status: 'loading' };
    case 'ready':
      return { status: 'ready' };
    case 'complete':
      return { status: 'completed', result: action.result };
    case 'fail':
      return { status: 'failed', error: action.error };
  }
}

const LifecycleContext = createContext<LifecycleContextValue | null>(null);

export function LifecycleProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [state, dispatch] = useReducer(lifecycleReducer, initialState);
  const api = useMemo<LifecycleApi>(
    () => ({
      loading: () => dispatch({ type: 'loading' }),
      ready: () => dispatch({ type: 'ready' }),
      complete: result => dispatch({ type: 'complete', result }),
      fail: error => dispatch({ type: 'fail', error }),
    }),
    [],
  );
  const value = useMemo(() => ({ ...state, ...api }), [state, api]);

  return (
    <LifecycleContext.Provider value={value}>
      {children}
    </LifecycleContext.Provider>
  );
}

export function useExperienceLifecycle(): LifecycleContextValue {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error('Experience lifecycle is only available inside the runtime.');
  }
  return context;
}