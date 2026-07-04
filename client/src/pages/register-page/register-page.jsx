import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../shared/ui';
import { useRegisterMutation } from '../../features/auth';
import { useNavigate, Link } from 'react-router-dom';
import { parseApiError } from '../../shared/lib/parse-api-error';
import styles from '../auth-form.module.scss';

const schema = yup.object({
  email: yup.string().required('Введите email').email('Некорректный email'),
  name: yup.string().nullable(),
  password: yup.string().required('Введите пароль').min(6, 'Мин. 6 символов'),
  passcheck: yup
    .string()
    .required('Повторите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
});

export const RegisterPage = () => {
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    const payload = { ...data };
    delete payload.passcheck;

    try {
      await registerUser(payload).unwrap();
      nav('/', { replace: true });
    } catch {
      // Ошибка отображается ниже через RTK Query mutation state.
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>Регистрация</h1>
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
            placeholder="Имя (необязательно)"
            autoComplete="name"
            {...register('name')}
          />
          {errors.name && (
            <div className={styles.fieldError}>{errors.name.message}</div>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Пароль"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <div className={styles.fieldError}>{errors.password.message}</div>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Повторите пароль"
            autoComplete="new-password"
            {...register('passcheck')}
          />
          {errors.passcheck && (
            <div className={styles.fieldError}>{errors.passcheck.message}</div>
          )}
        </div>
        {error && (
          <div className={styles.formError}>{parseApiError(error)}</div>
        )}
        <Button disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Регистрируем…' : 'Зарегистрироваться'}
        </Button>
      </form>
      <div className={styles.footerText}>
        Уже есть аккаунт?{' '}
        <Link className={styles.footerLink} to="/login">
          Войти
        </Link>
      </div>
    </div>
  );
};
