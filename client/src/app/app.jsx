import { Routes, Route, Link } from 'react-router-dom';
import CatalogPage from '../pages';
import ProductPage from '../pages';
import CartPage from '../pages';
import LoginPage from '../pages';
import RegisterPage from '../pages';
import AdminProductsPage from '../pages';

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
            <Route path="/admin/products" element={<AdminProductsPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
};
