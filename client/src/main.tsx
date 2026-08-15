import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { theme } from '@app/config/theme';
import { store } from '@app/store/store';

import '@app/styles/normalize.css';
import '@app/styles/global.css';

import { App } from '@app/ui/app';
import { RouteAwareErrorBoundary } from '@app/ui/route-aware-error-boundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <RouteAwareErrorBoundary>
          <Provider store={store}>
            <App />
          </Provider>
        </RouteAwareErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
