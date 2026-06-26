import { Routes, Route, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RequireAuth, RequireRole, useLogoutMutation } from '../features/auth';
import { ScrollToTop } from '../shared/lib';
import {
  CatalogPage,
  ProductPage,
  CartPage,
  LoginPage,
  RegisterPage,
  AdminProductsPage,
  NotFoundPage,
} from '../pages';
import '../styles/custom.scss';
import styles from './app.module.scss';

export const App = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const handleLogoutButtonClick = async () => {
    await logout();
    window.location.href = '/';
  };

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
            {user?.role === 'admin' && (
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
