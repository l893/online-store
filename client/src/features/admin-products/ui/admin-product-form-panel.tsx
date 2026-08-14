import { useState } from 'react';

import type { Category } from '@entities/categories';
import { parseApiError } from '@shared/lib';

import { SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS } from '../config/product-form.constants';
import type {
  ProductFormInitialValues,
  ProductFormSubmitHandler,
  ProductFormValues,
} from '../model/product-form.types';
import { ProductForm } from './product-form';
import styles from './admin-product-form-panel.module.scss';

interface AdminProductFormPanelProps {
  readonly isEditing: boolean;
  readonly initialValues: ProductFormInitialValues;
  readonly formResetRevision: number;
  readonly categories?: readonly Category[];
  readonly onSubmit: ProductFormSubmitHandler;
  readonly submissionError?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProductSlugConflictError(error: unknown): boolean {
  return (
    isRecord(error) &&
    isRecord(error.data) &&
    error.data.code === 'PRODUCT_SLUG_CONFLICT'
  );
}

export const AdminProductFormPanel = ({
  isEditing,
  initialValues,
  formResetRevision,
  categories = [],
  onSubmit,
  submissionError,
}: AdminProductFormPanelProps) => {
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);

  const isProductSlugConflict = isProductSlugConflictError(submissionError);

  async function handleProductFormSubmit(
    productFormValues: ProductFormValues,
  ): Promise<void> {
    await onSubmit(productFormValues);
    setIsSuccessMessageVisible(true);

    window.setTimeout(
      () => setIsSuccessMessageVisible(false),
      SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS,
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>
        {isEditing ? 'Редактирование' : 'Добавление товара'}
      </h2>

      <ProductForm
        key={formResetRevision}
        initial={initialValues}
        categories={categories}
        onSubmit={handleProductFormSubmit}
        submitText={isEditing ? 'Сохранить' : 'Добавить'}
        hasSlugConflict={isProductSlugConflict}
      />

      {isSuccessMessageVisible && (
        <div className={styles.successMessage}>Товар сохранён ✅</div>
      )}

      {Boolean(submissionError) && !isProductSlugConflict && (
        <div className={styles.formError}>{parseApiError(submissionError)}</div>
      )}
    </div>
  );
};
