import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../shared/ui';
import { useRegisterMutation } from '../features/auth';
import { useNavigate, Link } from 'react-router-dom';
import { parseApiError } from '../shared/lib/parse-api-error';

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
    const { passcheck, ...payload } = data; // passcheck не отправляем
    try {
      await registerUser(payload).unwrap();
      nav('/', { replace: true });
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-xl bg-white">
      <h1 className="text-xl font-semibold mb-4">Регистрация</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input placeholder="Email" {...register('email')} />
          {errors.email && (
            <div className="text-sm text-red-600">{errors.email.message}</div>
          )}
        </div>
        <div>
          <Input placeholder="Имя (необязательно)" {...register('name')} />
          {errors.name && (
            <div className="text-sm text-red-600">{errors.name.message}</div>
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
        <div>
          <Input
            type="password"
            placeholder="Повторите пароль"
            {...register('passcheck')}
          />
          {errors.passcheck && (
            <div className="text-sm text-red-600">
              {errors.passcheck.message}
            </div>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-600">{parseApiError(error)}</div>
        )}
        <Button disabled={isLoading} className="w-full">
          {isLoading ? 'Регистрируем…' : 'Зарегистрироваться'}
        </Button>
      </form>
      <div className="text-sm mt-3">
        Уже есть аккаунт?{' '}
        <Link className="underline" to="/login">
          Войти
        </Link>
      </div>
    </div>
  );
};
