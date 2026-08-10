import * as yup from 'yup';
import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_IMAGE_URL_MAX_LENGTH,
  PRODUCT_SLUG_MAX_LENGTH,
  PRODUCT_TITLE_MAX_LENGTH,
} from './product-form.constants';

const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productFormSchema = yup.object({
  title: yup
    .string()
    .required('Введите название')
    .max(
      PRODUCT_TITLE_MAX_LENGTH,
      `Макс. ${PRODUCT_TITLE_MAX_LENGTH} символов`,
    ),
  slug: yup
    .string()
    .required('Введите slug')
    .max(PRODUCT_SLUG_MAX_LENGTH, `Макс. ${PRODUCT_SLUG_MAX_LENGTH} символов`)
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
  image: yup
    .string()
    .max(
      PRODUCT_IMAGE_URL_MAX_LENGTH,
      `Макс. ${PRODUCT_IMAGE_URL_MAX_LENGTH} символов`,
    )
    .url('Нужен URL')
    .nullable()
    .optional(),
  description: yup
    .string()
    .max(
      PRODUCT_DESCRIPTION_MAX_LENGTH,
      `Макс. ${PRODUCT_DESCRIPTION_MAX_LENGTH} символов`,
    )
    .nullable(),
});
