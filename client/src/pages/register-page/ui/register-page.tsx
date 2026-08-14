import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';

import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_NAME_MAX_LENGTH,
  AuthenticationForm,
  AuthenticationFormFieldError,
  isAuthenticationPasswordWithinByteLengthLimit,
  useRegisterMutation,
} from '@features/auth';
import type { RegisterRequest } from '@features/auth';
import { Input } from '@shared/ui';

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .required('Введите email')
    .email('Некорректный email')
    .max(AUTH_EMAIL_MAX_LENGTH, `Макс. ${AUTH_EMAIL_MAX_LENGTH} символов`),
  name: yup
    .string()
    .trim()
    .max(AUTH_NAME_MAX_LENGTH, `Макс. ${AUTH_NAME_MAX_LENGTH} символов`)
    .nullable(),
  password: yup
    .string()
    .required('Введите пароль')
    .min(6, 'Мин. 6 символов')
    .test(
      'password-byte-length',
      'Пароль слишком длинный',
      isAuthenticationPasswordWithinByteLengthLimit,
    ),
  passcheck: yup
    .string()
    .required('Повторите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
});

type RegisterFormValues = yup.InferType<typeof schema>;

interface RegisterFormInputValues {
  readonly email: string;
  readonly name: string | null | undefined;
  readonly password: string;
  readonly passcheck: string;
}

export const RegisterPage = () => {
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputValues, undefined, RegisterFormValues>({
    resolver: yupResolver(schema),
  });

  const handleRegisterFormSubmit = async (
    formValues: RegisterFormValues,
  ): Promise<void> => {
    const registerRequest: RegisterRequest = {
      email: formValues.email,
      password: formValues.password,
      name: formValues.name,
    };

    try {
      await registerUser(registerRequest).unwrap();
      navigate('/', { replace: true });
    } catch {
      // Ошибка отображается ниже через RTK Query mutation state.
    }
  };

  return (
    <AuthenticationForm
      title="Регистрация"
      onSubmit={handleSubmit(handleRegisterFormSubmit)}
      isSubmitting={isLoading}
      submissionError={error}
      submitButtonLabel="Зарегистрироваться"
      submittingButtonLabel="Регистрируем…"
      footerText="Уже есть аккаунт?"
      footerLinkText="Войти"
      footerLinkPath="/login"
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
          placeholder="Имя (необязательно)"
          autoComplete="name"
          {...register('name')}
        />
        <AuthenticationFormFieldError message={errors.name?.message} />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Пароль"
          autoComplete="new-password"
          {...register('password')}
        />
        <AuthenticationFormFieldError message={errors.password?.message} />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Повторите пароль"
          autoComplete="new-password"
          {...register('passcheck')}
        />
        <AuthenticationFormFieldError message={errors.passcheck?.message} />
      </div>
    </AuthenticationForm>
  );
};
