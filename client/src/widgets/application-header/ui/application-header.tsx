import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { selectAuthenticatedUser, useLogoutMutation } from '@features/auth';

import styles from './application-header.module.scss';

export const ApplicationHeader = () => {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const user = useSelector(selectAuthenticatedUser);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.includes('admin');

  function handleNavigationToggle(): void {
    setIsNavigationOpen((isOpen) => !isOpen);
  }

  function handleNavigationSelection(): void {
    setIsNavigationOpen(false);
  }

  async function handleLogoutButtonClick(): Promise<void> {
    setIsNavigationOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <header className={styles.header}>
      <Link
        to="/"
        className={styles.brandLink}
        onClick={handleNavigationSelection}
      >
        Neon
      </Link>

      {user?.name && (
        <span className={`icon-person-fill ${styles.userName}`}>
          {user.name}
        </span>
      )}

      <button
        type="button"
        className={styles.menuButton}
        aria-label={isNavigationOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-controls="application-navigation"
        aria-expanded={isNavigationOpen}
        onClick={handleNavigationToggle}
      >
        <span aria-hidden="true">☰</span>
      </button>

      <nav
        id="application-navigation"
        className={`${styles.navigation} ${
          isNavigationOpen ? styles.navigationOpen : ''
        }`}
      >
        <Link
          to="/cart"
          className={`icon-cart ${styles.navigationLink}`}
          onClick={handleNavigationSelection}
        >
          Cart
        </Link>

        {!user && (
          <Link
            to="/login"
            className={`icon-login ${styles.navigationLink}`}
            onClick={handleNavigationSelection}
          >
            Login
          </Link>
        )}

        {!user && (
          <Link
            to="/register"
            className={`icon-account-reg ${styles.navigationLink}`}
            onClick={handleNavigationSelection}
          >
            Register
          </Link>
        )}

        {user && (
          <button
            type="button"
            onClick={handleLogoutButtonClick}
            className={`icon-logout ${styles.logoutButton}`}
          >
            Logout
          </button>
        )}

        {isAdmin && (
          <Link
            to="/admin/products"
            className={`icon-person-fill-gear ${styles.navigationLink}`}
            onClick={handleNavigationSelection}
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
};
