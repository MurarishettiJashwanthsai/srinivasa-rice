import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an exception:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center my-6">
                    <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-500 mb-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-text-main mb-2">
                        {this.props.fallbackTitle || 'Component Temporary Failure'}
                    </h3>
                    <p className="text-sm text-text-muted mb-4 max-w-md mx-auto font-medium">
                        {this.props.fallbackMessage ||
                            'We encountered an issue rendering this section. Please refresh or try again.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Reloading Section
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
