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

export const App = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  return (
    <>
      <ScrollToTop />
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center p-4 border rounded-xl bg-gray-50 mt-6">
          <Link to="/" className="text-xl font-semibold">
            Shop
          </Link>

          <nav className="flex gap-4 items-center">
            {/* <Link to="/cart" className="icon-cart" /> */}
            <Link
              to="/cart"
              className="icon-cart flex justify-center items-center"
            >
              Cart
            </Link>
            {!user && (
              <Link
                to="/login"
                className="icon-login flex justify-center items-center"
              >
                Login
              </Link>
            )}
            {!user && (
              <Link
                to="/register"
                className="icon-account-reg flex justify-center items-center"
              >
                Register
              </Link>
            )}
            {user && (
              <>
                <span className="text-gray-700 font-medium icon-person-fill flex justify-center items-center">
                  {user.name}
                </span>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="text-red-600 hover:underline icon-logout flex justify-center items-center"
                >
                  Logout
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/products"
                className="icon-person-fill-gear flex justify-center items-center"
              >
                Admin
              </Link>
            )}
          </nav>
        </header>

        <main className="py-6">
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
