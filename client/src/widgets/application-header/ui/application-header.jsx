import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../../features/auth';
import styles from './application-header.module.scss';

export const ApplicationHeader = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.includes('admin');

  async function handleLogoutButtonClick() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brandLink}>
        Shop
      </Link>

      <nav className={styles.navigation}>
        <Link to="/cart" className={`icon-cart ${styles.navigationLink}`}>
          Cart
        </Link>

        {!user && (
          <Link to="/login" className={`icon-login ${styles.navigationLink}`}>
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
  );
};
