import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons'

/**
 * ErrorBoundary - Catches JavaScript errors in child components and displays a fallback UI.
 *
 * This prevents the entire app from crashing when an unexpected error occurs.
 * In production, you may want to log errors to an external service like Sentry.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
        // Bind methods to this instance
        this.handleReload = this.handleReload.bind(this)
        this.handleRetry = this.handleRetry.bind(this)
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        this.setState({ errorInfo })

        // In production, log to an external error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo })
        if (typeof console !== 'undefined' && console.error) {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }
    }

    handleReload() {
        // Clear error state and attempt to reload the page
        window.location.reload()
    }

    handleRetry() {
        // Clear error state to attempt re-render
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI when an error is caught
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="text-3xl text-red-600 dark:text-red-400"
                                aria-hidden="true"
                            />
                        </div>

                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Something went wrong
                        </h1>

                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            We&apos;re sorry, but something unexpected happened.
                            Please try refreshing the page or come back later.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={this.handleRetry}
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-white px-6 py-3 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:border-emerald-500 dark:bg-gray-800 dark:text-emerald-400 dark:hover:bg-gray-700"
                            >
                                Try Again
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                            >
                                <FontAwesomeIcon
                                    icon={faRedo}
                                    className="mr-2"
                                    aria-hidden="true"
                                />
                                Reload Page
                            </button>
                        </div>

                        {/* Show error details in development mode only */}
                        {import.meta.env?.DEV && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    Error Details (Development Only)
                                </summary>
                                <div className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-900">
                                    <pre className="whitespace-pre-wrap text-xs text-red-600 dark:text-red-400">
                                        {this.state.error.toString()}
                                    </pre>
                                    {this.state.errorInfo?.componentStack && (
                                        <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        // When there's no error, render children normally
        return this.props.children
    }
}

export default ErrorBoundary
