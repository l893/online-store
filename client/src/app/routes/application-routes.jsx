import { Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@features/auth';
import {
  AdminProductsPage,
  CartPage,
  CatalogPage,
  LoginPage,
  NotFoundPage,
  ProductPage,
  RegisterPage,
} from '@pages';

export const ApplicationRoutes = () => {
  return (
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
  );
};
