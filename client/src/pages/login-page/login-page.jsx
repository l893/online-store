import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AuthenticationForm,
  AuthenticationFormFieldError,
  useLoginMutation,
} from '../../features/auth';
import { Input } from '../../shared/ui';

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
    <AuthenticationForm
      title="Вход"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isLoading}
      submissionError={error}
      submitButtonLabel="Войти"
      submittingButtonLabel="Входим…"
      footerText="Нет аккаунта?"
      footerLinkText="Регистрация"
      footerLinkPath="/register"
    >
      <div>
        <Input
          placeholder="Email"
          autoComplete="email"
          {...register('email')}
        />
        <AuthenticationFormFieldError message={errors.email?.message} />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Пароль"
          autoComplete="current-password"
          {...register('password')}
        />
        <AuthenticationFormFieldError message={errors.password?.message} />
      </div>
    </AuthenticationForm>
  );
};
