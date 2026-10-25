import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigPage } from '@/pages/ConfigPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { NewsPage } from '@/pages/NewsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';
import { useUserStore, useNavigationStore } from '@/stores';

/**
 * Root application component.
 * Bootstraps global application state (user profile and navigation items)
 * and establishes client-side page routing.
 */
export function App() {
  const loadUserData = useUserStore((state) => state.loadUserData);
  const loadNavigation = useNavigationStore((state) => state.loadNavigation);

  // Bootstrap global state on app mount: load user session and navigation items
  useEffect(() => {
    loadUserData();
    loadNavigation();
  }, [loadUserData, loadNavigation]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news/:slug" element={<NewsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
