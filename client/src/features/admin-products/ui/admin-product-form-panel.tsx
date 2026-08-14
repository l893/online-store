import type { Category } from '@entities/categories';
import { parseApiError } from '@shared/lib';

import type {
  ProductFormInitialValues,
  ProductFormSubmitHandler,
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
  const isProductSlugConflict = isProductSlugConflictError(submissionError);

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>
        {isEditing ? 'Редактирование' : 'Добавление товара'}
      </h2>

      <ProductForm
        initial={initialValues}
        formResetRevision={formResetRevision}
        categories={categories}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Сохранить' : 'Добавить'}
        hasSlugConflict={isProductSlugConflict}
      />

      {Boolean(submissionError) && !isProductSlugConflict && (
        <div className={styles.formError}>{parseApiError(submissionError)}</div>
      )}
    </div>
  );
};
