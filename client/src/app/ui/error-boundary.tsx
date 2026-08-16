import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { Button } from '@shared/ui';

import styles from './error-boundary.module.scss';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly resetKey?: string;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught application render error', error, errorInfo);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({
        hasError: false,
      });
    }
  }

  handleReloadButtonClick = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className={styles.errorBoundary} role="alert">
          <div className={styles.content}>
            <h1 className={styles.title}>Что-то пошло не так</h1>
            <p className={styles.description}>
              Не удалось отобразить приложение. Попробуйте перезагрузить
              страницу.
            </p>

            <Button type="button" onClick={this.handleReloadButtonClick}>
              Перезагрузить страницу
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
