import { Routes, Route, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RequireAuth, RequireRole, useLogoutMutation } from '../features/auth';
import {
  CatalogPage,
  ProductPage,
  CartPage,
  LoginPage,
  RegisterPage,
  AdminProductsPage,
} from '../pages';

export const App = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center p-4 border rounded-xl bg-gray-50 mt-6">
          <Link to="/" className="text-xl font-semibold">
            Shop
          </Link>

          <nav className="flex gap-4 items-center">
            <Link to="/cart">Cart</Link>
            {!user && <Link to="/login">Login</Link>}
            {!user && <Link to="/register">Register</Link>}
            {user && (
              <>
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            )}
            <Link to="/admin/products">Admin</Link>
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
          </Routes>
        </main>
      </div>
    </>
  );
};
