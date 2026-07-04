import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../shared/ui';
import { useLoginMutation } from '../../features/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { parseApiError } from '../../shared/lib/parse-api-error';
import styles from '../auth-form.module.scss';

const schema = yup.object({
  email: yup.string().required('Введите email').email('Некорректный email'),
  password: yup.string().required('Введите пароль').min(6, 'Мин. 6 символов'),
});

export const LoginPage = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login(data).unwrap();
      nav(from, { replace: true });
    } catch {
      // Ошибка отображается ниже через RTK Query mutation state.
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>Вход</h1>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input
            placeholder="Email"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <div className={styles.fieldError}>{errors.email.message}</div>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <div className={styles.fieldError}>{errors.password.message}</div>
          )}
        </div>
        {error && (
          <div className={styles.formError}>{parseApiError(error)}</div>
        )}
        <Button disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <div className={styles.footerText}>
        Нет аккаунта?{' '}
        <Link className={styles.footerLink} to="/register">
          Регистрация
        </Link>
      </div>
    </div>
  );
};
