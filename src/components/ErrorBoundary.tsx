import { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <pre className="bg-gray-800 p-4 rounded">{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
