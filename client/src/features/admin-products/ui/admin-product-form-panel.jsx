import { parseApiError } from '../../../shared/lib';
import { ProductForm } from './product-form';
import styles from './admin-product-form-panel.module.scss';

export const AdminProductFormPanel = ({
  isEditing,
  initialValues,
  formResetRevision,
  categories = [],
  onSubmit,
  submissionError,
}) => {
  const isProductSlugConflict =
    submissionError?.data?.code === 'PRODUCT_SLUG_CONFLICT';

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

      {submissionError && !isProductSlugConflict && (
        <div className={styles.formError}>{parseApiError(submissionError)}</div>
      )}
    </div>
  );
};
