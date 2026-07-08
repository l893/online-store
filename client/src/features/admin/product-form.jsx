import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Button, Input } from '../../shared/ui';
import { SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS } from './config/product-form.constants';
import { productFormSchema } from './config/product-form-schema';
import { slugifyRu } from './lib/slugify-ru';
import styles from './product-form.module.scss';

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
    resolver: yupResolver(productFormSchema),
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
        <Input
          placeholder="Название"
          autoComplete="off"
          {...register('title')}
        />
        {errors.title && (
          <div className={styles.fieldError}>{errors.title.message}</div>
        )}
      </div>

      <div className={styles.slugRow}>
        <div className={styles.slugField}>
          <Input
            placeholder="Slug (для URL)"
            autoComplete="off"
            {...register('slug')}
          />
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
        <Input placeholder="Цена" autoComplete="off" {...register('price')} />
        {errors.price && (
          <div className={styles.fieldError}>{errors.price.message}</div>
        )}
      </div>

      {/* Категория */}
      <div className={styles.field}>
        <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
          <InputLabel
            id="product-category-label"
            htmlFor="product-category-input"
          >
            Категория
          </InputLabel>
          <Select
            labelId="product-category-label"
            id="product-category-select"
            value={selectedCategoryId}
            label="Категория"
            onChange={handleCategoryChange}
            inputProps={{
              id: 'product-category-input',
              'aria-label': 'Категория',
            }}
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
        <Input
          placeholder="Остаток"
          autoComplete="off"
          {...register('stock')}
        />
        {errors.stock && (
          <div className={styles.fieldError}>{errors.stock.message}</div>
        )}
      </div>

      <div className={styles.field}>
        <Input
          placeholder="Картинка (URL)"
          autoComplete="off"
          {...register('image')}
        />
        {errors.image && (
          <div className={styles.fieldError}>{errors.image.message}</div>
        )}
      </div>

      <div className={styles.field}>
        <Input
          placeholder="Описание"
          autoComplete="off"
          {...register('description')}
        />
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
