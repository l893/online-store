import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Button, Input } from '../../shared/ui';
import styles from './product-form.module.scss';

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

// Простая транслитерация ru->lat + очистка символов
function slugifyRu(value = '') {
  const map = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ь: '',
    ы: 'y',
    ъ: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    А: 'a',
    Б: 'b',
    В: 'v',
    Г: 'g',
    Д: 'd',
    Е: 'e',
    Ё: 'e',
    Ж: 'zh',
    З: 'z',
    И: 'i',
    Й: 'y',
    К: 'k',
    Л: 'l',
    М: 'm',
    Н: 'n',
    О: 'o',
    П: 'p',
    Р: 'r',
    С: 's',
    Т: 't',
    У: 'u',
    Ф: 'f',
    Х: 'h',
    Ц: 'ts',
    Ч: 'ch',
    Ш: 'sh',
    Щ: 'sch',
    Ь: '',
    Ы: 'y',
    Ъ: '',
    Э: 'e',
    Ю: 'yu',
    Я: 'ya',
  };
  const replaced = value
    .split('')
    .map((character) => map[character] ?? character)
    .join('');
  return replaced
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS = 5000;

export const ProductForm = ({
  initial,
  onSubmit,
  submitText = 'Сохранить',
  categories = [],
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initial || {},
  });

  const [success, setSuccess] = useState(false);

  const title = watch('title');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => initial?.categoryId || '',
  );

  useEffect(() => {
    reset(initial || {});
    setSelectedCategoryId(initial?.categoryId || '');
  }, [initial, reset]);

  const handleGenerateSlugButtonClick = () => {
    const generatedSlug = slugifyRu(title || '');

    if (generatedSlug) {
      setValue('slug', generatedSlug, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
  };

  // когда пользователь выбирает категорию — кладём categoryId в форму
  useEffect(() => {
    setValue('categoryId', selectedCategoryId, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [selectedCategoryId, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      setSuccess(true);
      setTimeout(
        () => setSuccess(false),
        SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS,
      );
    } catch {
      // Не обрабатываем здесь — ошибки уже идут из onSubmit или формы
    }
  };

  return (
    <form
      className={styles.productForm}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className={styles.field}>
        <Input placeholder="Название" {...register('title')} />
        {errors.title && (
          <div className={styles.fieldError}>{errors.title.message}</div>
        )}
      </div>

      <div className={styles.slugRow}>
        <div className={styles.slugField}>
          <Input placeholder="Slug (для URL)" {...register('slug')} />
          {errors.slug && (
            <div className={styles.fieldError}>{errors.slug.message}</div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleGenerateSlugButtonClick}
          className={styles.generateSlugButton}
        >
          Сгенерировать
        </Button>
      </div>

      <div className={styles.field}>
        <Input placeholder="Цена" {...register('price')} />
        {errors.price && (
          <div className={styles.fieldError}>{errors.price.message}</div>
        )}
      </div>

      {/* Категория */}
      <div className={styles.field}>
        <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
          <InputLabel id="product-category-label">Категория</InputLabel>
          <Select
            labelId="product-category-label"
            id="product-category"
            value={selectedCategoryId}
            label="Категория"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>Не выбрано</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          {errors.categoryId && (
            <FormHelperText>{errors.categoryId.message}</FormHelperText>
          )}
        </FormControl>
      </div>

      <div className={styles.field}>
        <Input placeholder="Остаток" {...register('stock')} />
        {errors.stock && (
          <div className={styles.fieldError}>{errors.stock.message}</div>
        )}
      </div>

      <div className={styles.field}>
        <Input placeholder="Картинка (URL)" {...register('image')} />
        {errors.image && (
          <div className={styles.fieldError}>{errors.image.message}</div>
        )}
      </div>

      <div className={styles.field}>
        <Input placeholder="Описание" {...register('description')} />
        {errors.description && (
          <div className={styles.fieldError}>{errors.description.message}</div>
        )}
      </div>

      <Button disabled={isSubmitting} className={styles.submitButton}>
        {submitText}
      </Button>

      {success && (
        <div className={styles.successMessage}>Товар сохранён ✅</div>
      )}
    </form>
  );
};
