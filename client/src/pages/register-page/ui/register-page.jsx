import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import {
  AuthenticationForm,
  AuthenticationFormFieldError,
  useRegisterMutation,
} from '../../../features/auth';
import { Input } from '../../../shared/ui';

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
    <AuthenticationForm
      title="Регистрация"
      onSubmit={handleSubmit(onSubmit)}
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
