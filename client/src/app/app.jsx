import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  RequireAuth,
  RequireRole,
  useLogoutMutation,
  useRefreshMutation,
} from '../features/auth';
import { ScrollToTop } from '../shared/lib';
import { Loader } from '../shared/ui';
import {
  CatalogPage,
  ProductPage,
  CartPage,
  LoginPage,
  RegisterPage,
  AdminProductsPage,
  NotFoundPage,
} from '../pages';
import './styles/icons.scss';
import styles from './app.module.scss';

export const App = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const [refresh] = useRefreshMutation();
  const navigate = useNavigate();
  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false);
  const authRefreshRequestPromiseRef = useRef(null);
  const isAdmin = user?.roles?.includes('admin');

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const hasStoredAccessToken = Boolean(localStorage.getItem('accessToken'));

      if (!hasStoredAccessToken) {
        if (isMounted) {
          setIsAuthBootstrapped(true);
        }

        return;
      }

      try {
        if (!authRefreshRequestPromiseRef.current) {
          authRefreshRequestPromiseRef.current = refresh().unwrap();
        }

        await authRefreshRequestPromiseRef.current;
      } catch {
        // Невалидная refresh-сессия очищается в auth.api refresh flow.
      } finally {
        if (isMounted) {
          setIsAuthBootstrapped(true);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const handleLogoutButtonClick = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!isAuthBootstrapped) {
    return (
      <div className={styles.appShell}>
        <main className={styles.mainContent}>
          <Loader label="Восстанавливаем сессию…" />
        </main>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className={styles.appShell}>
        <header className={styles.header}>
          <Link to="/" className={styles.brandLink}>
            Shop
          </Link>

          <nav className={styles.navigation}>
            <Link to="/cart" className={`icon-cart ${styles.navigationLink}`}>
              Cart
            </Link>
            {!user && (
              <Link
                to="/login"
                className={`icon-login ${styles.navigationLink}`}
              >
                Login
              </Link>
            )}
            {!user && (
              <Link
                to="/register"
                className={`icon-account-reg ${styles.navigationLink}`}
              >
                Register
              </Link>
            )}
            {user && (
              <>
                <span className={`icon-person-fill ${styles.userName}`}>
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogoutButtonClick}
                  className={`icon-logout ${styles.logoutButton}`}
                >
                  Logout
                </button>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin/products"
                className={`icon-person-fill-gear ${styles.navigationLink}`}
              >
                Admin
              </Link>
            )}
          </nav>
        </header>

        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin/products"
              element={
                <RequireAuth>
                  <RequireRole role="admin">
                    <AdminProductsPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
};
