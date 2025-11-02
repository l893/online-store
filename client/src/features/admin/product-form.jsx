import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../shared/ui';

const schema = yup.object({
  title: yup.string().required('Введите название'),
  slug: yup.string().required('Введите slug'),
  price: yup
    .number()
    .typeError('Введите число')
    .required('Введите цену')
    .min(0),
  categoryId: yup.string().nullable(),
  stock: yup.number().typeError('Введите число').min(0).default(0),
  image: yup.string().url('Нужен URL').nullable().optional(),
  description: yup.string().nullable(),
});

export const ProductForm = ({
  initial,
  onSubmit,
  submitText = 'Сохранить',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initial || {},
  });

  useEffect(() => {
    reset(initial || {});
  }, [initial, reset]);

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input placeholder="Название" {...register('title')} />
        {errors.title && (
          <div className="text-sm text-red-600">{errors.title.message}</div>
        )}
      </div>
      <div>
        <Input placeholder="Slug (для URL)" {...register('slug')} />
        {errors.slug && (
          <div className="text-sm text-red-600">{errors.slug.message}</div>
        )}
      </div>
      <div>
        <Input placeholder="Цена" {...register('price')} />
        {errors.price && (
          <div className="text-sm text-red-600">{errors.price.message}</div>
        )}
      </div>
      <div>
        <Input
          placeholder="ID категории (опционально)"
          {...register('categoryId')}
        />
        {errors.categoryId && (
          <div className="text-sm text-red-600">
            {errors.categoryId.message}
          </div>
        )}
      </div>
      <div>
        <Input placeholder="Остаток" {...register('stock')} />
        {errors.stock && (
          <div className="text-sm text-red-600">{errors.stock.message}</div>
        )}
      </div>
      <div>
        <Input placeholder="Картинка (URL)" {...register('image')} />
        {errors.image && (
          <div className="text-sm text-red-600">{errors.image.message}</div>
        )}
      </div>
      <div>
        <Input placeholder="Описание" {...register('description')} />
        {errors.description && (
          <div className="text-sm text-red-600">
            {errors.description.message}
          </div>
        )}
      </div>

      <Button disabled={isSubmitting} className="w-full">
        {submitText}
      </Button>
    </form>
  );
};
