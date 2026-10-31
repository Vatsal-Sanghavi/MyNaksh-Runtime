import React, { Component } from 'react';
import type { ErrorInfo, PropsWithChildren } from 'react';
import { FallbackCard } from './FallbackCard';

type BoundaryProps = PropsWithChildren<{
  onError: (error: unknown) => void;
  onRetry: () => void;
}>;

type BoundaryState = {
  error: unknown | null;
};

class BoundaryImplementation extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  render(): React.ReactNode {
    if (this.state.error) {
      const error = this.state.error;
      return (
        <FallbackCard
          kind="failed"
          detail={error instanceof Error ? error.message : String(error)}
          onRetry={this.props.onRetry}
        />
      );
    }
    return this.props.children;
  }
}

export function ExperienceBoundary(props: BoundaryProps): React.JSX.Element {
  return <BoundaryImplementation {...props} />;
}