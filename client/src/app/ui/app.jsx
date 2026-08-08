import { Loader } from '../../shared/ui';
import { ApplicationHeader } from '../../widgets/application-header';
import { useAuthBootstrap } from '../model/use-auth-bootstrap';
import { useAuthSessionSynchronization } from '../model/use-auth-session-synchronization';
import { useScrollManagement } from '../model/use-scroll-management';
import { ApplicationRoutes } from '../routes/application-routes';
import '../styles/icons.scss';
import styles from './app.module.scss';

export const App = () => {
  useScrollManagement();
  useAuthSessionSynchronization();

  const isAuthBootstrapped = useAuthBootstrap();

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
    <div className={styles.appShell}>
      <ApplicationHeader />

      <main className={styles.mainContent}>
        <ApplicationRoutes />
      </main>
    </div>
  );
};
