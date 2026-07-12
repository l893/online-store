import { Button } from '../../../shared/ui';
import styles from './admin-products-pagination.module.scss';

export const AdminProductsPagination = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}) => {
  return (
    <div className={styles.pagination}>
      <Button
        type="button"
        onClick={onPreviousPage}
        disabled={currentPage <= 1}
      >
        Назад
      </Button>

      <span className={styles.paginationText}>
        Стр. {currentPage} из {totalPages}
      </span>

      <Button
        type="button"
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
      >
        Вперёд
      </Button>
    </div>
  );
};
