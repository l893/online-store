import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

import { RequireAuth, RequireGuest, RequireRole } from '@features/auth';
import { Loader } from '@shared/ui';

const CatalogPage = lazy(() =>
  import('@pages/catalog-page').then(({ CatalogPage }) => ({
    default: CatalogPage,
  })),
);

const ProductPage = lazy(() =>
  import('@pages/product-page').then(({ ProductPage }) => ({
    default: ProductPage,
  })),
);

const CartPage = lazy(() =>
  import('@pages/cart-page').then(({ CartPage }) => ({
    default: CartPage,
  })),
);

const LoginPage = lazy(() =>
  import('@pages/login-page').then(({ LoginPage }) => ({
    default: LoginPage,
  })),
);

const RegisterPage = lazy(() =>
  import('@pages/register-page').then(({ RegisterPage }) => ({
    default: RegisterPage,
  })),
);

const AdminProductsPage = lazy(() =>
  import('@pages/admin-products-page').then(({ AdminProductsPage }) => ({
    default: AdminProductsPage,
  })),
);

const NotFoundPage = lazy(() =>
  import('@pages/not-found-page').then(({ NotFoundPage }) => ({
    default: NotFoundPage,
  })),
);

export const ApplicationRoutes = (): ReactElement => {
  return (
    <Suspense fallback={<Loader label="Загружаем страницу…" />}>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <RegisterPage />
            </RequireGuest>
          }
        />
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
    </Suspense>
  );
};
