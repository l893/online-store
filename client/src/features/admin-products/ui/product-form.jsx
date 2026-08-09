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
import { Button, Input } from '../../../shared/ui';
import { SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS } from '../config/product-form.constants';
import { productFormSchema } from '../config/product-form-schema';
import { slugifyRu } from '../lib/slugify-ru';
import styles from './product-form.module.scss';

export const ProductForm = ({
  initial,
  formResetRevision,
  onSubmit,
  submitText = 'Сохранить',
  categories = [],
  hasSlugConflict = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(productFormSchema),
    defaultValues: initial || {},
  });

  const [success, setSuccess] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => initial?.categoryId || '',
  );

  const title = watch('title');

  const { onChange: handleRegisteredSlugChange, ...slugFieldRegistration } =
    register('slug');

  useEffect(() => {
    if (!hasSlugConflict) {
      return;
    }

    setError('slug', {
      type: 'server',
      message: 'Slug уже занят',
    });
  }, [hasSlugConflict, setError]);

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

  useEffect(() => {
    reset(initial || {});
    setSelectedCategoryId(initial?.categoryId || '');
  }, [formResetRevision, initial, reset]);

  const handleGenerateSlugButtonClick = () => {
    const generatedSlug = slugifyRu(title || '');

    if (generatedSlug) {
      if (errors.slug?.type === 'server') {
        clearErrors('slug');
      }

      setValue('slug', generatedSlug, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleSlugChange = (event) => {
    if (errors.slug?.type === 'server') {
      clearErrors('slug');
    }

    handleRegisteredSlugChange(event);
  };

  const handleCategoryChange = (event) => {
    const nextCategoryId = event.target.value;

    setSelectedCategoryId(nextCategoryId);
    setValue('categoryId', nextCategoryId, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
            {...slugFieldRegistration}
            onChange={handleSlugChange}
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
