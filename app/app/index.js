import React from 'react';
import { registerRootComponent } from 'expo';
import App from './src/App';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const RootApp = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

registerRootComponent(RootApp);
