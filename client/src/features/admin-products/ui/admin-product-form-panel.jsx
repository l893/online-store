import { parseApiError } from '../../../shared/lib';
import { ProductForm } from './product-form';
import styles from './admin-product-form-panel.module.scss';

export const AdminProductFormPanel = ({
  isEditing,
  initialValues,
  categories = [],
  onSubmit,
  submissionError,
}) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>
        {isEditing ? 'Редактирование' : 'Добавление товара'}
      </h2>

      <ProductForm
        initial={initialValues}
        categories={categories}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Сохранить' : 'Добавить'}
      />

      {submissionError && (
        <div className={styles.formError}>{parseApiError(submissionError)}</div>
      )}
    </div>
  );
};
