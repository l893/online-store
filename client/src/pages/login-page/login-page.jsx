import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../shared/ui';
import { useLoginMutation } from '../../features/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { parseApiError } from '../../shared/lib/parse-api-error';

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
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-xl bg-white">
      <h1 className="text-xl font-semibold mb-4">Вход</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input placeholder="Email" {...register('email')} />
          {errors.email && (
            <div className="text-sm text-red-600">{errors.email.message}</div>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Пароль"
            {...register('password')}
          />
          {errors.password && (
            <div className="text-sm text-red-600">
              {errors.password.message}
            </div>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-600">{parseApiError(error)}</div>
        )}
        <Button disabled={isLoading} className="w-full">
          {isLoading ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <div className="text-sm mt-3">
        Нет аккаунта?{' '}
        <Link className="underline" to="/register">
          Регистрация
        </Link>
      </div>
    </div>
  );
};
