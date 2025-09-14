import React from "react";
import styled from "styled-components";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorContent>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or going back to the home page.
            </ErrorMessage>

            <ErrorActions>
              <ErrorButton onClick={this.handleReload}>
                🔄 Refresh Page
              </ErrorButton>
              <ErrorButton secondary onClick={this.handleGoHome}>
                🏠 Go Home
              </ErrorButton>
            </ErrorActions>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <ErrorDetails>
                <details>
                  <summary>Error Details (Development)</summary>
                  <pre>{this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              </ErrorDetails>
            )}
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Styled components
const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
`;

const ErrorContent = styled.div`
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h1`
  color: #dc3545;
  margin-bottom: 16px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 30px;
  line-height: 1.6;
  font-size: 1rem;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ErrorButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "secondary",
})`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${(props) => (props.secondary ? "#6c757d" : "#007bff")};
  color: white;

  &:hover {
    background-color: ${(props) => (props.secondary ? "#5a6268" : "#0056b3")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorDetails = styled.div`
  margin-top: 20px;
  text-align: left;

  details {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 16px;
    background-color: #f8f9fa;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #495057;
    margin-bottom: 12px;
  }

  pre {
    background-color: #e9ecef;
    padding: 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    overflow-x: auto;
    color: #495057;
    margin: 8px 0;
  }
`;

export default ErrorBoundary;
