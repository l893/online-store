import { Routes, Route, Link } from 'react-router-dom';
import { RequireAuth, RequireRole } from '../features/auth';
import {
  CatalogPage,
  ProductPage,
  CartPage,
  LoginPage,
  RegisterPage,
  AdminProductsPage,
} from '../pages';

export const App = () => {
  return (
    <>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center p-4 border rounded-xl bg-gray-50 mt-6">
          <Link to="/" className="text-xl font-semibold">
            Shop
          </Link>
          <nav className="flex gap-4">
            <Link to="/cart">Cart</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
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
