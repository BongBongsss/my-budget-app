import { Component, ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UI section failed to render', { message: error.message, componentStack: errorInfo.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="component-error" role="alert">
          <strong>{this.props.title || '화면을 불러오지 못했습니다.'}</strong>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type="button" className="btn btn-secondary" onClick={this.handleRetry}>다시 시도</button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
