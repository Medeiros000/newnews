import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigPage } from '@/pages/ConfigPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { NewsPage } from '@/pages/NewsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute';
import { useNavigationStore, useUserStore } from '@/stores';

/**
 * Root application component.
 * Bootstraps global application state (navigation items and session restoration)
 * and establishes client-side page routing.
 */
export function App() {
  const loadNavigation = useNavigationStore((state) => state.loadNavigation);
  const initAuth = useUserStore((state) => state.initAuth);

  useEffect(() => {
    loadNavigation();
    initAuth();
  }, [loadNavigation, initAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug/:idPrefix" element={<NewsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
