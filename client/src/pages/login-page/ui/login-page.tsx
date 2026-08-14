import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AUTH_EMAIL_MAX_LENGTH,
  AuthenticationForm,
  AuthenticationFormFieldError,
  isAuthenticationPasswordWithinByteLengthLimit,
  useLoginMutation,
} from '@features/auth';
import type { LoginRequest } from '@features/auth';
import { Input } from '@shared/ui';

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .required('Введите email')
    .email('Некорректный email')
    .max(AUTH_EMAIL_MAX_LENGTH, `Макс. ${AUTH_EMAIL_MAX_LENGTH} символов`),
  password: yup
    .string()
    .required('Введите пароль')
    .min(6, 'Мин. 6 символов')
    .test(
      'password-byte-length',
      'Пароль слишком длинный',
      isAuthenticationPasswordWithinByteLengthLimit,
    ),
});

type LoginFormValues = yup.InferType<typeof schema>;

interface RedirectLocation {
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRedirectLocation(state: unknown): RedirectLocation | null {
  if (!isRecord(state) || !isRecord(state.from)) {
    return null;
  }

  const redirectLocation = state.from;

  if (
    typeof redirectLocation.pathname !== 'string' ||
    typeof redirectLocation.search !== 'string' ||
    typeof redirectLocation.hash !== 'string'
  ) {
    return null;
  }

  return {
    pathname: redirectLocation.pathname,
    search: redirectLocation.search,
    hash: redirectLocation.hash,
  };
}

export const LoginPage = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectLocation = getRedirectLocation(location.state);
  const redirectPath = redirectLocation
    ? `${redirectLocation.pathname}${redirectLocation.search || ''}${
        redirectLocation.hash || ''
      }`
    : '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
  });

  const handleLoginFormSubmit = async (
    formValues: LoginFormValues,
  ): Promise<void> => {
    const loginRequest: LoginRequest = formValues;

    try {
      await login(loginRequest).unwrap();
      navigate(redirectPath, {
        replace: true,
      });
    } catch {
      // Ошибка отображается ниже через RTK Query mutation state.
    }
  };

  return (
    <AuthenticationForm
      title="Вход"
      onSubmit={handleSubmit(handleLoginFormSubmit)}
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
