import * as yup from 'yup';

const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productFormSchema = yup.object({
  title: yup.string().required('Введите название'),
  slug: yup
    .string()
    .required('Введите slug')
    .matches(
      PRODUCT_SLUG_PATTERN,
      'Используйте строчные латинские буквы, цифры и дефисы',
    ),
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
