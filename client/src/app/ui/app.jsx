import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '../../features/auth';
import { ScrollToTop } from '../../shared/lib';
import { Loader } from '../../shared/ui';
import { useAuthBootstrap } from '../model/use-auth-bootstrap';
import { ApplicationRoutes } from '../routes/application-routes';
import '../styles/icons.scss';
import styles from './app.module.scss';

export const App = () => {
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const isAuthBootstrapped = useAuthBootstrap();
  const isAdmin = user?.roles?.includes('admin');

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
          <ApplicationRoutes />
        </main>
      </div>
    </>
  );
};
