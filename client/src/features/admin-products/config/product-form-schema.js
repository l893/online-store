import * as yup from 'yup';

export const productFormSchema = yup.object({
  title: yup.string().required('Введите название'),
  slug: yup.string().required('Введите slug'),
  price: yup
    .number()
    .typeError('Введите число')
    .required('Введите цену')
    .min(0, 'Цена не может быть отрицательной'),
  categoryId: yup.string().nullable(),
  stock: yup
    .number()
    .typeError('Введите число')
    .min(0, 'Остаток не может быть отрицательным')
    .default(0),
  image: yup.string().url('Нужен URL').nullable().optional(),
  description: yup.string().nullable(),
});
